// Telegram bot that hands out group access against one-time codes, and a
// scheduler that removes members once their month is up.
//
// Telegram facts this relies on:
//   • A bot cannot add a user to a group directly. Instead it issues a personal
//     JOIN-REQUEST invite link (createChatInviteLink, creates_join_request) and
//     approves the request ONLY for the account that redeemed the code — so a
//     forwarded link can't let a non-payer in.
//   • The bot must be an ADMIN of the group/supergroup with rights to invite
//     users (also covers approving join requests) and to ban/restrict members.
//   • "Kick" = banChatMember + unbanChatMember, so the user can rejoin later if
//     they pay again.

import TelegramBot from "node-telegram-bot-api";
import { SocksProxyAgent } from "socks-proxy-agent";

import { config } from "./config.js";
import { store } from "./store.js";

let bot = null;
const awaitingCode = new Set(); // chat ids we expect a code from next

const KICK_INTERVAL_MS = 60_000;

export function startBot() {
  if (!config.telegram.token) {
    console.log("  Telegram bot: disabled (no TELEGRAM_BOT_TOKEN)");
    return null;
  }

  // Route all Telegram API traffic through a SOCKS proxy (e.g. an Xray/VLESS
  // sidecar) when configured — needed where Telegram is blocked. A malformed
  // proxy URL must not take down the whole API: fall back to a direct connection.
  let request;
  if (config.telegram.proxy) {
    try {
      request = { agent: new SocksProxyAgent(config.telegram.proxy) };
      console.log(`  Telegram via proxy: ${config.telegram.proxy}`);
    } catch (err) {
      console.error(
        `  [bot] invalid TELEGRAM_PROXY "${config.telegram.proxy}" (${err.message}) — connecting directly`,
      );
    }
  }

  bot = new TelegramBot(config.telegram.token, {
    polling: {
      // chat_join_request is excluded from getUpdates by default — it must be
      // listed explicitly (and the list is exhaustive, so keep message +
      // callback_query too). Telegram wants a JSON-serialised array.
      params: {
        allowed_updates: JSON.stringify(["message", "callback_query", "chat_join_request"]),
      },
    },
    request,
  });

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

  // The personal invite link is a join-REQUEST link: clicking it doesn't join,
  // it asks to. We approve only the Telegram account that actually redeemed the
  // code — so a forwarded link from someone else's account gets declined.
  bot.on("chat_join_request", (req) => void approveJoin(req));

  startKickScheduler();
  return bot;
}

async function approveJoin(req) {
  const tgId = req.from.id;
  const chatId = req.chat.id;
  // Ignore requests from other chats the bot may be in.
  if (config.telegram.groupId && String(chatId) !== String(config.telegram.groupId)) return;

  try {
    const member = await store.findActiveMemberByTelegramId(tgId);
    const valid = member?.access?.expiresAt && new Date(member.access.expiresAt) > new Date();

    if (valid) {
      await bot.approveChatJoinRequest(chatId, tgId);
      console.log(`[bot] approved join: ${member.email} (tg ${tgId})`);
    } else {
      await bot.declineChatJoinRequest(chatId, tgId);
      console.log(`[bot] declined join: tg ${tgId} — no active paid membership`);
      // Best-effort heads-up (works only if they've ever opened the bot).
      await bot
        .sendMessage(
          tgId,
          "❌ Заявка на вступление отклонена.\nЭтот Telegram-аккаунт не привязан к оплаченному доступу. " +
            "Оплатите доступ в личном кабинете, получите код и активируйте его в этом боте кнопкой «Получить доступ».",
        )
        .catch(() => {});
    }
  } catch (err) {
    console.error("[bot] chat_join_request failed:", err.message);
  }
}

async function redeem(msg) {
  const code = await store.findActiveCode(msg.text);
  if (!code) {
    return bot.sendMessage(
      msg.chat.id,
      "❌ Код недействителен или уже использован.\nСгенерируйте новый в личном кабинете и попробуйте снова.",
    );
  }

  const user = await store.findById(code.userId);
  if (!user || user.access?.status !== "paid") {
    return bot.sendMessage(msg.chat.id, "❌ Подписка не активна. Оплатите доступ в личном кабинете.");
  }
  if (!config.telegram.groupId) {
    return bot.sendMessage(msg.chat.id, "⚠️ Группа ещё не настроена администратором. Попробуйте позже.");
  }

  let link;
  try {
    // Create the personal invite link FIRST — only burn the code if this succeeds.
    // It's a join-REQUEST link (no member_limit, no expiry): the bot approves the
    // request only for the account that redeemed the code (see approveJoin), so a
    // forwarded link can't let anyone else in — which is why it needn't expire.
    link = await bot.createChatInviteLink(config.telegram.groupId, {
      creates_join_request: true,
      name: `RAVA ${user.email}`.slice(0, 32),
    });
  } catch (err) {
    console.error("[bot] createChatInviteLink failed:", err.message);
    return bot.sendMessage(
      msg.chat.id,
      "⚠️ Не удалось создать приглашение. Убедитесь, что бот — администратор группы.\nКод не израсходован, попробуйте позже.",
    );
  }

  await store.markCodeUsed(code.code, msg.from.id);
  await store.startMembership(
    user.id,
    { telegramId: msg.from.id, telegramUsername: msg.from.username },
    config.access.durationDays,
  );

  const until = new Date(Date.now() + config.access.durationDays * 86400000);
  await bot.sendMessage(
    msg.chat.id,
    `✅ Доступ открыт!\n\nВступите в сообщество по персональной ссылке:\n${link.invite_link}\n\n` +
      `🔒 Ссылка привязана к вашему аккаунту: заявку на вступление бот подтвердит только с этого Telegram. ` +
      `Пересланная кому-то ещё ссылка не сработает.\n\n` +
      `Доступ активен до ${until.toLocaleDateString("ru-RU")}. По истечении срока вы будете автоматически удалены из группы.`,
  );
}

// Remove a member from the group: ban + immediately unban, so they can rejoin
// later if they pay again. No-op if the bot or group isn't configured. Reused by
// the expiry sweeper and by permanent account deletion.
export async function removeFromGroup(telegramId) {
  if (!bot || !config.telegram.groupId || !telegramId) return false;
  try {
    await bot.banChatMember(config.telegram.groupId, telegramId);
    await bot.unbanChatMember(config.telegram.groupId, telegramId, { only_if_banned: true });
    return true;
  } catch (err) {
    console.error(`[bot] removeFromGroup(${telegramId}) failed:`, err.message);
    return false;
  }
}

function startKickScheduler() {
  const sweep = async () => {
    for (const user of await store.listExpiredMembers()) {
      const tgId = user.access.telegramId;
      try {
        if (config.telegram.groupId && tgId) {
          await removeFromGroup(tgId);
          await bot
            .sendMessage(
              tgId,
              "⌛️ Срок доступа в сообщество RAVA истёк. Продлите доступ в личном кабинете, чтобы вернуться.",
            )
            .catch(() => {});
        }
        await store.expireAccess(user.id);
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
