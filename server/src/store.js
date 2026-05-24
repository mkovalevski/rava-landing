// Data access layer over PostgreSQL. Every method is async (returns a Promise)
// and the shapes it returns match what the rest of the app expects from the old
// JSON store — so callers only had to add `await`. See db.js for the schema.

import { randomUUID } from "node:crypto";

import { pool, query } from "./db.js";

const norm = (email) => String(email || "").trim().toLowerCase();

const DEFAULT_PROFILE = { specialty: "", institution: "", city: "", phone: "", bio: "" };
const DEFAULT_EDUCATION = { courses: 0, credits: 0, certificates: 0 };

// ── Row → domain object mappers ───────────────────────────────────────────────
function rowToUser(r) {
  if (!r) return null;
  return {
    id: r.id,
    email: r.email,
    name: r.name,
    passwordHash: r.password_hash,
    provider: r.provider,
    yandexId: r.yandex_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    membership: r.membership, // jsonb → object | null
    profile: r.profile ?? { ...DEFAULT_PROFILE },
    education: r.education ?? { ...DEFAULT_EDUCATION },
    access: {
      status: r.access_status,
      paidAt: r.access_paid_at,
      joinedAt: r.access_joined_at,
      expiresAt: r.access_expires_at,
      telegramId: r.access_telegram_id,
      telegramUsername: r.access_telegram_username,
    },
  };
}

function rowToPayment(r) {
  if (!r) return null;
  return {
    id: r.id,
    userId: r.user_id,
    amount: Number(r.amount),
    currency: r.currency,
    provider: r.provider,
    externalId: r.external_id,
    status: r.status,
    createdAt: r.created_at,
    paidAt: r.paid_at,
  };
}

function rowToCode(r) {
  if (!r) return null;
  return {
    code: r.code,
    userId: r.user_id,
    status: r.status,
    createdAt: r.created_at,
    usedAt: r.used_at,
    usedByTelegramId: r.used_by_telegram_id,
  };
}

const USER_COLS = "*"; // rowToUser reads named columns, so SELECT * is fine

// RAVA-2026-0001 style number, drawn from a Postgres sequence (atomic, no gaps
// races). Only consumed when a membership is actually issued (on first payment).
async function nextMembershipId() {
  const { rows } = await query("SELECT nextval('membership_seq') AS n");
  const year = new Date().getFullYear();
  return `RAVA-${year}-${String(rows[0].n).padStart(4, "0")}`;
}

async function issueMembership() {
  const now = new Date();
  return {
    id: await nextMembershipId(),
    tier: "Действительный член",
    status: "active",
    since: now.toISOString(),
    renewsAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 365).toISOString(),
  };
}

export const store = {
  /* ── Users ───────────────────────────────────────────────────────────────── */

  async findByEmail(email) {
    const { rows } = await query(`SELECT ${USER_COLS} FROM users WHERE email = $1`, [norm(email)]);
    return rowToUser(rows[0]);
  },

  async findById(id) {
    const { rows } = await query(`SELECT ${USER_COLS} FROM users WHERE id = $1`, [id]);
    return rowToUser(rows[0]);
  },

  async findByYandexId(yandexId) {
    const { rows } = await query(`SELECT ${USER_COLS} FROM users WHERE yandex_id = $1`, [String(yandexId)]);
    return rowToUser(rows[0]);
  },

  async create({ email, name, passwordHash = null, provider = "local", yandexId = null }) {
    const id = randomUUID();
    const displayName = name?.trim() || norm(email).split("@")[0];
    const { rows } = await query(
      `INSERT INTO users (id, email, name, password_hash, provider, yandex_id, profile, education)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb)
       RETURNING ${USER_COLS}`,
      [
        id,
        norm(email),
        displayName,
        passwordHash,
        provider,
        yandexId ? String(yandexId) : null,
        JSON.stringify(DEFAULT_PROFILE),
        JSON.stringify(DEFAULT_EDUCATION),
      ],
    );
    return rowToUser(rows[0]);
  },

  // Permanently delete a user. The FK ON DELETE CASCADE removes their payments
  // and access codes too. Returns true if a row was actually deleted.
  async deleteUser(id) {
    const { rowCount } = await query("DELETE FROM users WHERE id = $1", [id]);
    return rowCount > 0;
  },

  // Generic scalar update (used for password / Yandex linking). Whitelisted keys.
  async update(id, patch) {
    const map = {
      name: "name",
      passwordHash: "password_hash",
      provider: "provider",
      yandexId: "yandex_id",
    };
    const sets = [];
    const params = [id];
    for (const [key, col] of Object.entries(map)) {
      if (key in patch) {
        params.push(key === "yandexId" && patch[key] != null ? String(patch[key]) : patch[key]);
        sets.push(`${col} = $${params.length}`);
      }
    }
    if (!sets.length) return store.findById(id);
    const { rows } = await query(
      `UPDATE users SET ${sets.join(", ")}, updated_at = now() WHERE id = $1 RETURNING ${USER_COLS}`,
      params,
    );
    return rowToUser(rows[0]);
  },

  async updateProfile(id, fields) {
    const patch = {};
    for (const key of ["specialty", "institution", "city", "phone", "bio"]) {
      if (typeof fields[key] === "string") patch[key] = fields[key].slice(0, 600);
    }
    const name = typeof fields.name === "string" && fields.name.trim() ? fields.name.trim().slice(0, 120) : null;
    const { rows } = await query(
      `UPDATE users
         SET profile = profile || $2::jsonb,
             name = COALESCE($3, name),
             updated_at = now()
       WHERE id = $1
       RETURNING ${USER_COLS}`,
      [id, JSON.stringify(patch), name],
    );
    return rowToUser(rows[0]);
  },

  /* ── Payments ──────────────────────────────────────────────────────────────── */

  async createPayment({ userId, amount, provider, externalId = null }) {
    const { rows } = await query(
      `INSERT INTO payments (id, user_id, amount, provider, external_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [randomUUID(), userId, amount, provider, externalId],
    );
    return rowToPayment(rows[0]);
  },

  async findPaymentById(id) {
    const { rows } = await query("SELECT * FROM payments WHERE id = $1", [id]);
    return rowToPayment(rows[0]);
  },

  async findPaymentByExternalId(externalId) {
    const { rows } = await query("SELECT * FROM payments WHERE external_id = $1", [externalId]);
    return rowToPayment(rows[0]);
  },

  async pendingPaymentFor(userId) {
    const { rows } = await query(
      "SELECT * FROM payments WHERE user_id = $1 AND status = 'pending' ORDER BY created_at LIMIT 1",
      [userId],
    );
    return rowToPayment(rows[0]);
  },

  async setPaymentExternalId(id, externalId) {
    const { rows } = await query("UPDATE payments SET external_id = $2 WHERE id = $1 RETURNING *", [id, externalId]);
    return rowToPayment(rows[0]);
  },

  async markPaymentStatus(id, status) {
    const { rows } = await query(
      `UPDATE payments
         SET status = $2, paid_at = CASE WHEN $2 = 'succeeded' THEN now() ELSE paid_at END
       WHERE id = $1 RETURNING *`,
      [id, status],
    );
    return rowToPayment(rows[0]);
  },

  /* ── Subscription / group access ───────────────────────────────────────────── */

  // Payment confirmed → issue the membership credential (once) and mark paid.
  async grantPaid(userId) {
    const cur = await query("SELECT membership FROM users WHERE id = $1", [userId]);
    if (!cur.rows[0]) return null;

    const params = [userId];
    let membershipSql = "membership"; // keep an already-issued credential
    if (!cur.rows[0].membership) {
      params.push(JSON.stringify(await issueMembership()));
      membershipSql = `$${params.length}::jsonb`;
    }

    const { rows } = await query(
      `UPDATE users SET
         membership = ${membershipSql},
         access_status = 'paid',
         access_paid_at = now(),
         access_joined_at = NULL,
         access_expires_at = NULL,
         access_telegram_id = NULL,
         access_telegram_username = NULL,
         updated_at = now()
       WHERE id = $1 RETURNING ${USER_COLS}`,
      params,
    );
    return rowToUser(rows[0]);
  },

  // Code redeemed in the bot → the clock starts now.
  async startMembership(userId, { telegramId, telegramUsername }, durationDays) {
    const { rows } = await query(
      `UPDATE users SET
         access_status = 'active',
         access_paid_at = COALESCE(access_paid_at, now()),
         access_joined_at = now(),
         access_expires_at = now() + make_interval(days => $2::int),
         access_telegram_id = $3,
         access_telegram_username = $4,
         updated_at = now()
       WHERE id = $1 RETURNING ${USER_COLS}`,
      [userId, durationDays, String(telegramId), telegramUsername || null],
    );
    return rowToUser(rows[0]);
  },

  async expireAccess(userId) {
    const { rows } = await query(
      `UPDATE users SET access_status = 'expired', updated_at = now() WHERE id = $1 RETURNING ${USER_COLS}`,
      [userId],
    );
    return rowToUser(rows[0]);
  },

  // Active members whose window has closed — used by the kick sweeper.
  async listExpiredMembers() {
    const { rows } = await query(
      `SELECT ${USER_COLS} FROM users
        WHERE access_status = 'active' AND access_expires_at IS NOT NULL AND access_expires_at <= now()`,
    );
    return rows.map(rowToUser);
  },

  // The active member who redeemed a code from this Telegram account — used to
  // approve/decline join requests so a forwarded link can't let anyone else in.
  async findActiveMemberByTelegramId(telegramId) {
    const { rows } = await query(
      `SELECT ${USER_COLS} FROM users WHERE access_status = 'active' AND access_telegram_id = $1 LIMIT 1`,
      [String(telegramId)],
    );
    return rowToUser(rows[0]);
  },

  /* ── One-time access codes ──────────────────────────────────────────────────── */

  async activeCodeFor(userId) {
    const { rows } = await query("SELECT * FROM codes WHERE user_id = $1 AND status = 'active' LIMIT 1", [userId]);
    return rowToCode(rows[0]);
  },

  async findActiveCode(value) {
    const v = String(value || "").trim().toUpperCase();
    const { rows } = await query("SELECT * FROM codes WHERE code = $1 AND status = 'active'", [v]);
    return rowToCode(rows[0]);
  },

  // Issue a fresh code, revoking any previous active one for the user. Done in a
  // transaction; retries on the (astronomically unlikely) code collision.
  async issueCode(userId) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("UPDATE codes SET status = 'revoked' WHERE user_id = $1 AND status = 'active'", [userId]);
      let row;
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const res = await client.query(
          `INSERT INTO codes (code, user_id) VALUES ($1, $2)
           ON CONFLICT (code) DO NOTHING RETURNING *`,
          [generateCodeValue(), userId],
        );
        if (res.rows[0]) {
          row = res.rows[0];
          break;
        }
      }
      if (!row) throw new Error("could not generate a unique access code");
      await client.query("COMMIT");
      return rowToCode(row);
    } catch (err) {
      await client.query("ROLLBACK").catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  },

  async markCodeUsed(value, telegramId) {
    const v = String(value || "").trim().toUpperCase();
    const { rows } = await query(
      `UPDATE codes SET status = 'used', used_at = now(), used_by_telegram_id = $2
        WHERE code = $1 AND status = 'active' RETURNING *`,
      [v, String(telegramId)],
    );
    return rowToCode(rows[0]);
  },
};

// Human-typeable code: RAVA-XXXX-XXXX from an unambiguous alphabet (no O/0/I/1/L).
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function generateCodeValue() {
  const block = () =>
    Array.from({ length: 4 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join("");
  return `RAVA-${block()}-${block()}`;
}
