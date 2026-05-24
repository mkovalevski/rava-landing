import { Router } from "express";

import { config } from "../config.js";
import { store } from "../store.js";
import { publicAccess, requireAuth } from "../tokens.js";
import { getPayment } from "../yookassa.js";

export const accessRouter = Router();
accessRouter.use(requireAuth);

// Snapshot of everything the "Community" tab needs.
accessRouter.get("/", async (req, res) => {
  await reconcilePending(req.user);

  const code = store.activeCodeFor(req.user.id);
  res.json({
    priceRub: config.access.priceRub,
    durationDays: config.access.durationDays,
    access: publicAccess(store.findById(req.user.id)),
    code: code ? { code: code.code, status: code.status, createdAt: code.createdAt } : null,
    bot: {
      username: config.telegram.username,
      configured: Boolean(config.telegram.token),
    },
  });
});

// Generate (or regenerate) the one-time access code. Old code is invalidated.
accessRouter.post("/code", (req, res) => {
  const status = req.user.access?.status;
  if (status === "active") {
    return res.status(409).json({ error: "Вы уже состоите в сообществе." });
  }
  if (status !== "paid") {
    return res.status(402).json({ error: "Сначала оплатите доступ." });
  }
  const code = store.issueCode(req.user.id);
  res.json({ code: code.code });
});

// For real YooKassa, a redirect may beat the webhook — reconcile on read.
async function reconcilePending(user) {
  if (config.yookassa.demo) return;
  const pending = store.pendingPaymentFor(user.id);
  if (!pending?.externalId) return;
  try {
    const yk = await getPayment(pending.externalId);
    if (yk.status === "succeeded") {
      store.markPaymentStatus(pending.id, "succeeded");
      store.grantPaid(user.id);
    } else if (yk.status === "canceled") {
      store.markPaymentStatus(pending.id, "canceled");
    }
  } catch (err) {
    console.error("[access] reconcile failed:", err.message);
  }
}
