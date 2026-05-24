import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { config } from "./config.js";
import { startBot } from "./bot.js";
import { accessRouter } from "./routes/access.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { billingRouter } from "./routes/billing.routes.js";
import { profileRouter } from "./routes/profile.routes.js";

const app = express();

app.disable("x-powered-by");
app.use(express.json());
app.use(cookieParser());

// In dev the SPA talks to the API through Vite's proxy (same origin), but allow
// direct cross-origin calls with credentials too.
app.use(
  cors({
    origin: config.appUrl,
    credentials: true,
  }),
);

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    yandex: config.yandex.configured ? "configured" : config.yandex.demo ? "demo" : "off",
    yookassa: config.yookassa.configured ? "configured" : config.yookassa.demo ? "demo" : "off",
    telegram: config.telegram.token ? "configured" : "off",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/billing", billingRouter);
app.use("/api/access", accessRouter);

app.use((req, res) => res.status(404).json({ error: `Не найдено: ${req.method} ${req.path}` }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[error]", err);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

app.listen(config.port, () => {
  const mode = config.yandex.configured
    ? "real credentials"
    : config.yandex.demo
      ? "DEMO mode (no credentials needed)"
      : "disabled";
  const yooMode = config.yookassa.configured
    ? "real credentials"
    : config.yookassa.demo
      ? "DEMO mode"
      : "disabled";
  console.log(`\n  RAVA API → http://localhost:${config.port}`);
  console.log(`  Yandex OAuth: ${mode}`);
  console.log(`  YooKassa: ${yooMode}`);
  console.log(`  Allowed app origin: ${config.appUrl}`);
  startBot();
  console.log("");
});
