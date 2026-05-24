# RAVA

Landing page + member cabinet for the Russian Association of Vascular Access
Specialists. React/Vite SPA, an Express API with **Yandex OAuth** and a Telegram
access-code bot, and **PostgreSQL** for storage.

## Run everything with Docker

```bash
# put your secrets in server/.env first (Yandex / Telegram / JWT_SECRET);
# DATABASE_URL and APP_URL are overridden by compose automatically.
docker compose up --build
```

Then open **http://&lt;host-ip&gt;:5199** (e.g. `http://192.168.31.145:5199`) — the
port is published on all interfaces, so it works by IP. Three services come up:

| Service  | What it is                                   | Port            |
| -------- | -------------------------------------------- | --------------- |
| `web`    | nginx serving the built SPA, proxies `/api`  | `5199` → 80     |
| `server` | Express API + Telegram bot                   | internal `3001` |
| `db`     | PostgreSQL 16 (volume `rava-pgdata`)         | `55432` → 5432  |

Set `APP_URL` in `docker-compose.yml` to match how you reach the site (IP or
domain). The SPA and API share one origin (nginx), which the session cookie and
the Yandex OAuth redirect rely on. The schema is created automatically on first
boot. Run **either** the compose stack **or** a local `npm start` — not both,
since only one Telegram poller may exist per bot token.

```bash
docker compose up -d db        # just Postgres, e.g. for local `npm run dev`
docker compose down            # stop (keeps the data volume)
docker compose down -v         # stop and wipe the database
```

### Telegram via VLESS (where Telegram is blocked)

A bundled, opt-in **Xray** sidecar exposes a SOCKS5 proxy the bot tunnels
through your VLESS server:

1. Fill `xray/config.json` with your VLESS params (it maps to a `vless://` link).
2. Set `TELEGRAM_PROXY=socks5h://xray:1080` in `server/.env`.
3. Start with the proxy profile:

```bash
docker compose --profile proxy up -d --build
```

Without these steps the bot connects to Telegram directly.

## Local development (without Docker for the app)

```bash
docker compose up -d db        # or any Postgres reachable via DATABASE_URL
npm install && npm run dev     # SPA → http://localhost:5173 (or :5174)
cd server && npm install && npm run dev   # API → http://localhost:3001
```

Vite proxies `/api/*` to the API in dev (see `vite.config.ts`). Payment is an
intentional instant **mock**; everything else (auth, Yandex, the Telegram
code → invite flow) is real. Backend details: [`server/README.md`](server/README.md).
