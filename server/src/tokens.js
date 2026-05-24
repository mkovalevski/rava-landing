// Password hashing, JWT session tokens, the auth cookie and the route guard.

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { config } from "./config.js";
import { store } from "./store.js";

export const hashPassword = (plain) => bcrypt.hash(plain, 11);
export const verifyPassword = (plain, hash) => (hash ? bcrypt.compare(plain, hash) : Promise.resolve(false));

export function signSession(user) {
  return jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: "7d" });
}

// Short-lived signed token used as the OAuth `state` (CSRF protection).
export function signOAuthState() {
  return jwt.sign({ k: "yandex" }, config.jwtSecret, { expiresIn: "10m" });
}
export function verifyOAuthState(token) {
  try {
    return jwt.verify(token, config.jwtSecret).k === "yandex";
  } catch {
    return false;
  }
}

export function setAuthCookie(res, user) {
  res.cookie(config.cookieName, signSession(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: config.isProd,
    maxAge: config.cookieMaxAge,
    path: "/",
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(config.cookieName, { path: "/" });
}

// Resolve the current user from the session cookie, or null.
export function currentUser(req) {
  const token = req.cookies?.[config.cookieName];
  if (!token) return null;
  try {
    const { sub } = jwt.verify(token, config.jwtSecret);
    return store.findById(sub);
  } catch {
    return null;
  }
}

// Express middleware: 401 unless authenticated; attaches req.user.
export function requireAuth(req, res, next) {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: "Требуется авторизация" });
  req.user = user;
  next();
}

// Shape sent to the client — never leak the password hash.
export function publicUser(u) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    provider: u.provider,
    hasPassword: Boolean(u.passwordHash),
    yandexLinked: Boolean(u.yandexId),
    createdAt: u.createdAt,
    membership: u.membership,
    profile: u.profile,
    education: u.education,
    access: publicAccess(u),
  };
}

// Subscription summary — never includes the raw access code.
export function publicAccess(u) {
  const a = u.access ?? {};
  return {
    status: a.status ?? "none",
    paidAt: a.paidAt ?? null,
    joinedAt: a.joinedAt ?? null,
    expiresAt: a.expiresAt ?? null,
    telegramUsername: a.telegramUsername ?? null,
  };
}
