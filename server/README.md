# RAVA backend

Small Express API behind the RAVA landing page: member registration, login,
**Yandex OAuth**, and profile management. Sessions are signed JWTs stored in an
`httpOnly` cookie; data lives in **PostgreSQL** (see `src/db.js` — the schema is
created automatically on startup).

> The easiest way to run the whole thing (DB + API + SPA) is the root
> `docker-compose.yml`: `docker compose up --build` → http://localhost:8080.

## Run

Needs a PostgreSQL reachable via `DATABASE_URL`. Quick local instance:

```bash
docker run -d --name rava-pg -e POSTGRES_PASSWORD=rava -e POSTGRES_USER=rava \
  -e POSTGRES_DB=rava -p 5432:5432 postgres:16
```

```bash
cd server
npm install
cp .env.example .env   # set DATABASE_URL (and any real credentials)
npm run dev            # http://localhost:3001  (auto-restarts on change)
```

Tables are created on first boot — no migration step. The server exits with a
clear message if the database is unreachable.

Auth and the Telegram access-code flow are **real**; only payment is mocked
(see below). Email/password registration and login work out of the box. The
"Войти с Яндекс ID" button needs real OAuth credentials (`YANDEX_DEMO=false` is
the default) — for local testing without keys you can temporarily set
`YANDEX_DEMO=true` to log in as a synthetic account.

The frontend (Vite) proxies `/api/*` to this server — see `vite.config.ts` — so
run both `npm run dev` here and `npm run dev` in the project root.

## Real Yandex OAuth

1. Create an app at <https://oauth.yandex.ru/client/new>
   - Platform: **Web services**
   - Redirect URI: `http://localhost:5173/api/auth/yandex/callback`
   - Scopes: `login:email`, `login:info`
2. Put the issued ID/secret in `.env` (`YANDEX_DEMO` is already `false`):

```env
YANDEX_CLIENT_ID=your-id
YANDEX_CLIENT_SECRET=your-secret
```

## API

| Method | Path                         | Auth | Purpose                              |
| ------ | ---------------------------- | ---- | ------------------------------------ |
| GET    | `/api/health`                | —    | Liveness + Yandex mode               |
| POST   | `/api/auth/register`         | —    | `{ email, password, name }`          |
| POST   | `/api/auth/login`            | —    | `{ email, password }`                |
| GET    | `/api/auth/me`               | cookie | Current user                       |
| POST   | `/api/auth/logout`           | cookie | Clear session                      |
| POST   | `/api/auth/password`         | cookie | `{ currentPassword?, newPassword }`|
| GET    | `/api/auth/yandex`           | —    | Begin Yandex OAuth (redirect)        |
| GET    | `/api/auth/yandex/callback`  | —    | OAuth return → sets cookie → SPA     |
| GET    | `/api/profile`               | cookie | Profile                            |
| PATCH  | `/api/profile`               | cookie | Update profile fields              |
| POST   | `/api/billing/checkout`      | cookie | Pay (mock: settles instantly; real: → URL) |
| POST   | `/api/billing/webhook`       | —    | YooKassa `payment.succeeded` hook    |
| GET    | `/api/access`                | cookie | Subscription + current code + bot  |
| POST   | `/api/access/code`           | cookie | Issue / regenerate one-time code   |

## How the cookie survives the OAuth hop (dev)

The Yandex redirect URI points at the **frontend** origin
(`localhost:5173/...`). Vite proxies it to this API, the API sets the session
cookie and 302s back to `/profile`. Because the response is served through the
app origin, the cookie is stored there and every proxied `/api/*` request sends
it automatically. The YooKassa `return_url` works the same way.

## Paid Telegram-community access

The full flow: **register/login → pay (YooKassa) → get a one-time code in the
profile → open the bot → enter the code → join via a personal invite link →
auto-removed after `ACCESS_DURATION_DAYS`.**

States on a user: `none → paid → active → expired` (re-paying after expiry goes
back to `paid`). The subscription clock starts when the code is redeemed in the
bot, not at payment.

### Payment (mocked by design)

Payment is the **only** mocked piece. With `YOOKASSA_DEMO=true` (the default),
`POST /api/billing/checkout` settles the payment instantly server-side — no
money moves and no redirect — so the click drops the user straight into the
`paid` state and the rest of the flow is real. To switch to real charges later
set `YOOKASSA_SHOP_ID` / `YOOKASSA_SECRET_KEY`, `YOOKASSA_DEMO=false`, and
register the webhook `https://<your-host>/api/billing/webhook` in the dashboard.
Webhooks are never trusted blindly — the payment is re-fetched from the API
before access is granted, and a redirect-time reconciliation in `GET /api/access`
covers a missed webhook.

### Telegram bot

A bot **cannot add users to a group directly**, so on a valid code it creates a
personal **join-request invite link** (`createChatInviteLink`,
`creates_join_request: true`, 1-hour TTL) and sends it. Clicking the link does
not join — it raises a join request, and the bot **approves it only for the
Telegram account that redeemed the code** (`chat_join_request` →
`approveChatJoinRequest`). A link forwarded to anyone else is **declined**, so
access can't be shared. Requirements:

1. Create the bot in **@BotFather**, set `TELEGRAM_BOT_TOKEN`.
2. Add it to your **supergroup/channel** and make it **admin** with rights to
   *invite users via link* (this right also lets it approve join requests) and
   *ban users*.
3. Set `TELEGRAM_GROUP_ID` (numeric, e.g. `-1001234567890`).

The bot runs in this process via long polling (only start **one** instance per
token). It requests `chat_join_request` updates explicitly via
`allowed_updates` — they're excluded from `getUpdates` by default. A 60-second
sweep removes members whose window has closed (`banChatMember` +
`unbanChatMember`, so they can rejoin if they pay again) and notifies them.

## Verifying

`node --env-file-if-exists=.env scripts/verify-access.mjs` runs an integration
check of the membership / code / redemption / expiry logic against the
configured PostgreSQL. It creates a few throwaway users and **deletes them again
at the end**, so it's safe to re-run.

## Deployment

The static SPA can go on Vercel, but **this API + bot must run as a long-lived
Node service** (Railway, Fly, a VPS, …) — not a serverless function, because of
the polling bot and the in-process scheduler. Point `DATABASE_URL` at a managed
PostgreSQL, set a strong `JWT_SECRET`, real provider credentials, and serve over
HTTPS (the session cookie becomes `Secure` automatically when `APP_URL` is
`https://…`). Or just run the root `docker-compose.yml` on a host.
