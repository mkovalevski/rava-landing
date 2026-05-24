// PostgreSQL connection pool + idempotent schema bootstrap.
//
// Raw SQL over `pg` — no ORM, in keeping with the rest of this codebase. The
// data model mirrors the old JSON store: a `users` table (with the 1:1 nested
// objects kept as JSONB, except `access` which is flattened to columns because
// we query it by status / expiry / telegram id), plus `payments` and `codes`.

import pg from "pg";

import { config } from "./config.js";

export const pool = new pg.Pool({ connectionString: config.db.url });

pool.on("error", (err) => console.error("[db] idle client error:", err.message));

// Thin query helper. Usage: query("SELECT ... WHERE id=$1", [id]).
export const query = (text, params) => pool.query(text, params);

const SCHEMA = `
CREATE SEQUENCE IF NOT EXISTS membership_seq;

CREATE TABLE IF NOT EXISTS users (
  id                       uuid PRIMARY KEY,
  email                    text UNIQUE NOT NULL,
  name                     text NOT NULL,
  password_hash            text,
  provider                 text NOT NULL DEFAULT 'local',
  yandex_id                text UNIQUE,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),
  membership               jsonb,
  profile                  jsonb NOT NULL DEFAULT '{"specialty":"","institution":"","city":"","phone":"","bio":""}'::jsonb,
  education                jsonb NOT NULL DEFAULT '{"courses":0,"credits":0,"certificates":0}'::jsonb,
  access_status            text NOT NULL DEFAULT 'none',
  access_paid_at           timestamptz,
  access_joined_at         timestamptz,
  access_expires_at        timestamptz,
  access_telegram_id       text,
  access_telegram_username text
);

CREATE TABLE IF NOT EXISTS payments (
  id          uuid PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount      numeric(10,2) NOT NULL,
  currency    text NOT NULL DEFAULT 'RUB',
  provider    text NOT NULL,
  external_id text,
  status      text NOT NULL DEFAULT 'pending',
  created_at  timestamptz NOT NULL DEFAULT now(),
  paid_at     timestamptz
);
CREATE INDEX IF NOT EXISTS payments_user_idx ON payments(user_id);
CREATE INDEX IF NOT EXISTS payments_external_idx ON payments(external_id);

CREATE TABLE IF NOT EXISTS codes (
  code                text PRIMARY KEY,
  user_id             uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status              text NOT NULL DEFAULT 'active',
  created_at          timestamptz NOT NULL DEFAULT now(),
  used_at             timestamptz,
  used_by_telegram_id text
);
CREATE INDEX IF NOT EXISTS codes_user_active_idx ON codes(user_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS users_active_tg_idx   ON users(access_telegram_id) WHERE access_status = 'active';
`;

// Ensure the schema exists. Safe to run on every boot (all statements are
// IF NOT EXISTS). Call once before the server starts accepting requests.
export async function initDb() {
  await query(SCHEMA);
}
