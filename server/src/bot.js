// Telegram bot that hands out group access against one-time codes, and a
// scheduler that removes members once their month is up.
//
// Telegram facts this relies on:
//   • A bot cannot add a user to a group directly. Instead it issues a
//     single-use invite link (createChatInviteLink, member_limit: 1) that the
//     user clicks to join.
//   • The bot must be an ADMIN of the group/supergroup with rights to invite
//     users and to ban/restrict members.
//   • "Kick" = banChatMember + unbanChatMember, so the user can rejoin later if
//     they pay again.

import TelegramBot from "node-telegram-bot-api";

import { config } from "./config.js";
import { store } from "./store.js";

let bot = null;
const awaitingCode = new Set(); // chat ids we expect a code from next

const KICK_INTERVAL_MS = 60_000;
const INVITE_TTL_SEC = 3600; // personal join link valid for 1 hour

export function startBot() {
  if (!config.telegram.token) {
    console.log("  Telegram bot: disabled (no TELEGRAM_BOT_TOKEN)");
    return null;
  }

  bot = new TelegramBot(config.telegram.token, { polling: true });

  bot.getMe()
    .then((me) => {
      config.telegram.username = me.username;
      console.log(`  Telegram bot: @${me.username} (polling)`);
    })
    .catch((err) => console.error("[bot] getMe failed — check the token:", err.message));

  bot.on("polling_error", (err) => console.error("[bot] polling_error:", err.code || err.message));

  bot.onText(/^\/start\b/, (msg) => {
    bot.sendMessage(msg.chat.id, welcomeText(), {
      reply_markup: { inline_keyboard: [[{ text: "🔑 Получить доступ", callback_data: "get_access" }]] },
    });
  });

  bot.on("callback_query", async (q) => {
    if (q.data !== "get_access") return;
    awaitingCode.add(q.message.chat.id);
    await bot.answerCallbackQuery(q.id).catch(() => {});
    await bot.sendMessage(
      q.message.chat.id,
      "Введите код доступа из личного кабинета.\nФормат: RAVA-XXXX-XXXX",
    );
  });

  bot.on("message", async (msg) => {
    if (!msg.text || msg.text.startsWith("/")) return;
    if (!awaitingCode.has(msg.chat.id)) return;
    awaitingCode.delete(msg.chat.id);
    await redeem(msg).catch((err) => console.error("[bot] redeem error:", err.message));
  });

  startKickScheduler();
  return bot;
}

async function redeem(msg) {
  const code = store.findActiveCode(msg.text);
  if (!code) {
    return bot.sendMessage(
      msg.chat.id,
      "❌ Код недействителен или уже использован.\nСгенерируйте новый в личном кабинете и попробуйте снова.",
    );
  }

  const user = store.findById(code.userId);
  if (!user || user.access?.status !== "paid") {
    return bot.sendMessage(msg.chat.id, "❌ Подписка не активна. Оплатите доступ в личном кабинете.");
  }
  if (!config.telegram.groupId) {
    return bot.sendMessage(msg.chat.id, "⚠️ Группа ещё не настроена администратором. Попробуйте позже.");
  }

  let link;
  try {
    // Create the personal invite link FIRST — only burn the code if this succeeds.
    link = await bot.createChatInviteLink(config.telegram.groupId, {
      member_limit: 1,
      expire_date: Math.floor(Date.now() / 1000) + INVITE_TTL_SEC,
      name: `RAVA ${user.email}`.slice(0, 32),
    });
  } catch (err) {
    console.error("[bot] createChatInviteLink failed:", err.message);
    return bot.sendMessage(
      msg.chat.id,
      "⚠️ Не удалось создать приглашение. Убедитесь, что бот — администратор группы.\nКод не израсходован, попробуйте позже.",
    );
  }

  store.markCodeUsed(code.code, msg.from.id);
  store.startMembership(
    user.id,
    { telegramId: msg.from.id, telegramUsername: msg.from.username },
    config.access.durationDays,
  );

  const until = new Date(Date.now() + config.access.durationDays * 86400000);
  await bot.sendMessage(
    msg.chat.id,
    `✅ Доступ открыт!\n\nВступите в сообщество по персональной ссылке (действует 1 час):\n${link.invite_link}\n\n` +
      `Доступ активен до ${until.toLocaleDateString("ru-RU")}. По истечении срока вы будете автоматически удалены из группы.`,
  );
}

function startKickScheduler() {
  const sweep = async () => {
    for (const user of store.listExpiredMembers()) {
      const tgId = user.access.telegramId;
      try {
        if (config.telegram.groupId && tgId) {
          await bot.banChatMember(config.telegram.groupId, tgId);
          await bot.unbanChatMember(config.telegram.groupId, tgId, { only_if_banned: true });
          await bot
            .sendMessage(
              tgId,
              "⌛️ Срок доступа в сообщество RAVA истёк. Продлите доступ в личном кабинете, чтобы вернуться.",
            )
            .catch(() => {});
        }
        store.expireAccess(user.id);
        console.log(`[bot] removed expired member: ${user.email}`);
      } catch (err) {
        console.error(`[bot] failed to remove ${user.email}:`, err.message);
      }
    }
  };

  setInterval(() => void sweep(), KICK_INTERVAL_MS);
  void sweep(); // run once at startup
}

function welcomeText() {
  return (
    "Добро пожаловать в бот сообщества RAVA — Российской ассоциации специалистов сосудистого доступа.\n\n" +
    "Чтобы вступить в закрытую Telegram-группу, оплатите доступ в личном кабинете на сайте, " +
    "получите одноразовый код и нажмите кнопку ниже."
  );
}
