import { Router } from "express";

import { config } from "../config.js";
import { store } from "../store.js";
import {
  clearAuthCookie,
  currentUser,
  hashPassword,
  publicUser,
  requireAuth,
  setAuthCookie,
  signOAuthState,
  verifyOAuthState,
  verifyPassword,
} from "../tokens.js";

export const authRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Email + password registration ────────────────────────────────────────────
authRouter.post("/register", async (req, res) => {
  const { email, password, name } = req.body ?? {};

  if (!EMAIL_RE.test(String(email || ""))) {
    return res.status(400).json({ error: "Введите корректный e-mail" });
  }
  if (String(password || "").length < 8) {
    return res.status(400).json({ error: "Пароль должен быть не короче 8 символов" });
  }
  if (await store.findByEmail(email)) {
    return res.status(409).json({ error: "Пользователь с таким e-mail уже существует" });
  }

  const user = await store.create({
    email,
    name,
    passwordHash: await hashPassword(password),
    provider: "local",
  });
  setAuthCookie(res, user);
  res.status(201).json({ user: publicUser(user) });
});

// ── Email + password login ───────────────────────────────────────────────────
authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  const user = await store.findByEmail(email);
  const ok = user && (await verifyPassword(String(password || ""), user.passwordHash));

  if (!ok) return res.status(401).json({ error: "Неверный e-mail или пароль" });

  setAuthCookie(res, user);
  res.json({ user: publicUser(user) });
});

// ── Session ───────────────────────────────────────────────────────────────────
authRouter.get("/me", async (req, res) => {
  const user = await currentUser(req);
  if (!user) return res.status(401).json({ error: "Не авторизован" });
  res.json({ user: publicUser(user) });
});

authRouter.post("/logout", (req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

// ── Change / set password ──────────────────────────────────────────────────────
authRouter.post("/password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {};
  if (String(newPassword || "").length < 8) {
    return res.status(400).json({ error: "Новый пароль должен быть не короче 8 символов" });
  }
  // Yandex-only accounts have no password yet — allow setting one without the old.
  if (req.user.passwordHash) {
    const ok = await verifyPassword(String(currentPassword || ""), req.user.passwordHash);
    if (!ok) return res.status(403).json({ error: "Текущий пароль указан неверно" });
  }
  await store.update(req.user.id, { passwordHash: await hashPassword(newPassword) });
  res.json({ ok: true });
});

// ── Yandex OAuth: kick-off ──────────────────────────────────────────────────────
authRouter.get("/yandex", (req, res) => {
  const state = signOAuthState();

  // Demo mode: skip the real provider and bounce straight to our callback.
  if (!config.yandex.configured && config.yandex.demo) {
    const url = new URL(config.yandex.redirectUri);
    url.searchParams.set("demo", "1");
    url.searchParams.set("state", state);
    return res.redirect(url.toString());
  }

  if (!config.yandex.configured) {
    return res.redirect(`${config.appUrl}/login?error=yandex_not_configured`);
  }

  const url = new URL(config.yandex.authorizeUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", config.yandex.clientId);
  url.searchParams.set("redirect_uri", config.yandex.redirectUri);
  url.searchParams.set("state", state);
  res.redirect(url.toString());
});

// ── Yandex OAuth: callback ──────────────────────────────────────────────────────
authRouter.get("/yandex/callback", async (req, res) => {
  const { code, state, demo, error } = req.query;

  if (error) return res.redirect(`${config.appUrl}/login?error=yandex_denied`);
  if (!verifyOAuthState(String(state || ""))) {
    return res.redirect(`${config.appUrl}/login?error=yandex_state`);
  }

  try {
    const identity =
      demo === "1" && config.yandex.demo
        ? demoIdentity()
        : await fetchYandexIdentity(String(code || ""));

    const user = await upsertYandexUser(identity);
    setAuthCookie(res, user);
    // New Yandex accounts land on the profile with a welcome flag.
    const fresh = Date.now() - new Date(user.createdAt).getTime() < 5000;
    res.redirect(`${config.appUrl}/profile${fresh ? "?welcome=1" : ""}`);
  } catch (err) {
    console.error("[yandex] callback failed:", err.message);
    res.redirect(`${config.appUrl}/login?error=yandex_failed`);
  }
});

// Exchange the auth code for a token, then read the profile from Yandex.
async function fetchYandexIdentity(code) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: config.yandex.clientId,
    client_secret: config.yandex.clientSecret,
  });

  const tokenRes = await fetch(config.yandex.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!tokenRes.ok) throw new Error(`token exchange ${tokenRes.status}`);
  const { access_token } = await tokenRes.json();

  const infoRes = await fetch(`${config.yandex.infoUrl}?format=json`, {
    headers: { Authorization: `OAuth ${access_token}` },
  });
  if (!infoRes.ok) throw new Error(`userinfo ${infoRes.status}`);
  const info = await infoRes.json();

  return {
    id: info.id,
    email: info.default_email || (info.emails && info.emails[0]) || `${info.login}@yandex.ru`,
    name: info.real_name || info.display_name || info.first_name || info.login,
  };
}

// A believable synthetic Yandex account for local demos.
function demoIdentity() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return {
    id: `demo-${n}`,
    email: `demo.user.${n}@yandex.ru`,
    name: "Демо Пользователь",
  };
}

async function upsertYandexUser({ id, email, name }) {
  const user = await store.findByYandexId(id);
  if (user) return user;

  // Link Yandex to an existing local account that shares the e-mail.
  const byEmail = await store.findByEmail(email);
  if (byEmail) {
    return store.update(byEmail.id, { yandexId: String(id), provider: byEmail.provider });
  }

  return store.create({ email, name, provider: "yandex", yandexId: id });
}
