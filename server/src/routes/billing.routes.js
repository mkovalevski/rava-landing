import { randomUUID } from "node:crypto";
import { Router } from "express";

import { config } from "../config.js";
import { store } from "../store.js";
import { requireAuth } from "../tokens.js";
import { createPayment, getPayment } from "../yookassa.js";

export const billingRouter = Router();

const PRICE = config.access.priceRub;
const DESCRIPTION = `Доступ в Telegram-сообщество RAVA — ${config.access.durationDays} дней`;

// ── Start a payment ──────────────────────────────────────────────────────────
billingRouter.post("/checkout", requireAuth, async (req, res) => {
  const status = req.user.access?.status;
  if (status === "active") return res.status(409).json({ error: "У вас уже есть активный доступ." });
  if (status === "paid") {
    return res.status(409).json({ error: "Оплата уже прошла — сгенерируйте код доступа в кабинете." });
  }

  const payment = store.createPayment({
    userId: req.user.id,
    amount: PRICE,
    provider: config.yookassa.demo ? "mock" : "yookassa",
  });

  // Mock payment (intentional — the ONLY mocked piece). No money moves: the
  // click instantly settles the payment and unlocks the real downstream flow
  // (issue code → redeem in the bot → join the group). Wire real YooKassa by
  // setting YOOKASSA_SHOP_ID / YOOKASSA_SECRET_KEY and YOOKASSA_DEMO=false.
  if (config.yookassa.demo) {
    store.markPaymentStatus(payment.id, "succeeded");
    store.grantPaid(req.user.id);
    return res.json({ mock: true, paid: true });
  }

  try {
    const yk = await createPayment({
      amount: PRICE,
      description: DESCRIPTION,
      returnUrl: `${config.appUrl}/profile?paid=1`,
      metadata: { userId: req.user.id, paymentId: payment.id },
      idempotenceKey: payment.id,
    });
    store.setPaymentExternalId(payment.id, yk.id);
    res.json({ demo: false, confirmationUrl: yk.confirmation?.confirmation_url });
  } catch (err) {
    console.error("[billing] checkout failed:", err.message);
    store.markPaymentStatus(payment.id, "canceled");
    res.status(502).json({ error: "Платёжный сервис недоступен. Попробуйте позже." });
  }
});

// ── YooKassa webhook (server-to-server) ────────────────────────────────────────
// Configure this URL in the YooKassa dashboard. We never trust the body — we
// re-fetch the payment from the API before granting access.
billingRouter.post("/webhook", async (req, res) => {
  try {
    const externalId = req.body?.object?.id;
    if (req.body?.event === "payment.succeeded" && externalId) {
      const local = store.findPaymentByExternalId(externalId);
      if (local && local.status !== "succeeded") {
        const yk = await getPayment(externalId);
        if (yk.status === "succeeded") {
          store.markPaymentStatus(local.id, "succeeded");
          store.grantPaid(local.userId);
        }
      }
    }
  } catch (err) {
    console.error("[billing] webhook error:", err.message);
  }
  res.status(200).json({ ok: true }); // acknowledge regardless to stop retries
});
