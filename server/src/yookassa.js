// Minimal YooKassa (ЮKassa) REST client over global fetch — no SDK needed.
// Docs: https://yookassa.ru/developers/api

import { config } from "./config.js";

function authHeader() {
  const creds = Buffer.from(`${config.yookassa.shopId}:${config.yookassa.secretKey}`).toString("base64");
  return `Basic ${creds}`;
}

export async function createPayment({ amount, description, returnUrl, metadata, idempotenceKey }) {
  const res = await fetch(`${config.yookassa.apiBase}/payments`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Idempotence-Key": idempotenceKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: { value: amount.toFixed(2), currency: "RUB" },
      capture: true,
      confirmation: { type: "redirect", return_url: returnUrl },
      description,
      metadata,
    }),
  });
  if (!res.ok) throw new Error(`YooKassa create ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function getPayment(id) {
  const res = await fetch(`${config.yookassa.apiBase}/payments/${id}`, {
    headers: { Authorization: authHeader() },
  });
  if (!res.ok) throw new Error(`YooKassa get ${res.status}`);
  return res.json();
}
