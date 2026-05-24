// Centralised, validated configuration. Reads from process.env (populated by
// `node --env-file-if-exists=.env`) and falls back to development-safe defaults
// so the server runs out-of-the-box in demo mode.

const bool = (v, fallback) =>
  v === undefined ? fallback : ["1", "true", "yes", "on"].includes(String(v).toLowerCase());

export const config = {
  port: Number(process.env.PORT) || 3001,
  isProd: process.env.NODE_ENV === "production",
  appUrl: process.env.APP_URL || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET || "dev-only-secret-change-me-in-production",
  cookieName: "rava_session",
  cookieMaxAge: 1000 * 60 * 60 * 24 * 7, // 7 days

  // PostgreSQL connection string (see db.js). Defaults to a local instance.
  db: {
    url: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/rava",
  },

  yandex: {
    clientId: process.env.YANDEX_CLIENT_ID || "",
    clientSecret: process.env.YANDEX_CLIENT_SECRET || "",
    redirectUri:
      process.env.YANDEX_REDIRECT_URI ||
      "http://localhost:5173/api/auth/yandex/callback",
    // Real OAuth is the default. Set YANDEX_DEMO=true ONLY for local dev without
    // credentials — it logs you in as a synthetic account (never use in prod).
    demo: bool(process.env.YANDEX_DEMO, false),
    authorizeUrl: "https://oauth.yandex.ru/authorize",
    tokenUrl: "https://oauth.yandex.ru/token",
    infoUrl: "https://login.yandex.ru/info",
  },

  // Paid Telegram-community access subscription.
  access: {
    priceRub: Number(process.env.ACCESS_PRICE_RUB) || 990,
    durationDays: Number(process.env.ACCESS_DURATION_DAYS) || 30,
  },

  // YooKassa (ЮKassa) payment provider — https://yookassa.ru
  yookassa: {
    shopId: process.env.YOOKASSA_SHOP_ID || "",
    secretKey: process.env.YOOKASSA_SECRET_KEY || "",
    apiBase: "https://api.yookassa.ru/v3",
  },

  // Telegram bot that hands out group access.
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN || "",
    groupId: process.env.TELEGRAM_GROUP_ID || "",
    username: process.env.TELEGRAM_BOT_USERNAME || null, // filled from getMe at startup
    // Optional SOCKS5 proxy for ALL Telegram API traffic — e.g. an Xray/VLESS
    // sidecar (socks5h://xray:1080) for regions where Telegram is blocked.
    proxy: (process.env.TELEGRAM_PROXY || "").trim(),
  },
};

// Whether real Yandex OAuth is usable (credentials present).
config.yandex.configured = Boolean(config.yandex.clientId && config.yandex.clientSecret);

// YooKassa: real when credentials present; demo otherwise (overridable).
config.yookassa.configured = Boolean(config.yookassa.shopId && config.yookassa.secretKey);
config.yookassa.demo =
  process.env.YOOKASSA_DEMO !== undefined ? bool(process.env.YOOKASSA_DEMO) : !config.yookassa.configured;

// Mark the session cookie `Secure` only when the app is actually served over
// HTTPS (derived from APP_URL) — so it still works over http://localhost in a
// local docker-compose run, and is hardened automatically in real deployments.
config.cookieSecure = /^https:/i.test(config.appUrl);

if (config.isProd && config.jwtSecret.startsWith("dev-only")) {
  console.warn(
    "[config] WARNING: running in production with the default JWT_SECRET. Set JWT_SECRET.",
  );
}
