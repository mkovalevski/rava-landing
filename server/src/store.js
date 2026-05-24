// Tiny zero-dependency JSON datastore. Good enough for a single-process demo;
// swap for Postgres/SQLite when this graduates beyond a prototype. State is held
// in memory and written through to disk atomically (write temp + rename).

import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
const DB_FILE = join(DATA_DIR, "db.json");

const empty = { users: [], seq: 0, payments: [], codes: [] };

const emptyAccess = () => ({
  status: "none", // none | paid | active | expired
  paidAt: null,
  joinedAt: null,
  expiresAt: null,
  telegramId: null,
  telegramUsername: null,
});

function load() {
  let data = structuredClone(empty);
  try {
    if (existsSync(DB_FILE)) data = { ...empty, ...JSON.parse(readFileSync(DB_FILE, "utf8")) };
  } catch (err) {
    console.error("[store] could not read db.json, starting fresh:", err.message);
  }
  // Forward-migrate records created before billing/access existed.
  data.payments ??= [];
  data.codes ??= [];
  for (const u of data.users) u.access ??= emptyAccess();
  return data;
}

let state = load();

function persist() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${DB_FILE}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(state, null, 2));
  renameSync(tmp, DB_FILE);
}

const norm = (email) => String(email || "").trim().toLowerCase();

// RAVA-2026-0001 style human-facing membership number.
function nextMembershipId() {
  state.seq += 1;
  const year = new Date().getFullYear();
  return `RAVA-${year}-${String(state.seq).padStart(4, "0")}`;
}

export const store = {
  findByEmail(email) {
    const e = norm(email);
    return state.users.find((u) => u.email === e) || null;
  },

  findById(id) {
    return state.users.find((u) => u.id === id) || null;
  },

  findByYandexId(yandexId) {
    return state.users.find((u) => u.yandexId === String(yandexId)) || null;
  },

  create({ email, name, passwordHash = null, provider = "local", yandexId = null }) {
    const now = new Date().toISOString();
    const user = {
      id: randomUUID(),
      email: norm(email),
      name: name?.trim() || norm(email).split("@")[0],
      passwordHash,
      provider, // "local" | "yandex"
      yandexId: yandexId ? String(yandexId) : null,
      createdAt: now,
      updatedAt: now,
      membership: {
        id: nextMembershipId(),
        tier: "Действительный член",
        status: "active",
        since: now,
        renewsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
      },
      profile: {
        specialty: "",
        institution: "",
        city: "",
        phone: "",
        bio: "",
      },
      education: { courses: 0, credits: 0, certificates: 0 },
      access: emptyAccess(),
    };
    state.users.push(user);
    persist();
    return user;
  },

  update(id, patch) {
    const user = store.findById(id);
    if (!user) return null;
    Object.assign(user, patch, { updatedAt: new Date().toISOString() });
    persist();
    return user;
  },

  updateProfile(id, fields) {
    const user = store.findById(id);
    if (!user) return null;
    const allowed = ["specialty", "institution", "city", "phone", "bio"];
    for (const key of allowed) {
      if (typeof fields[key] === "string") user.profile[key] = fields[key].slice(0, 600);
    }
    if (typeof fields.name === "string" && fields.name.trim()) user.name = fields.name.trim().slice(0, 120);
    user.updatedAt = new Date().toISOString();
    persist();
    return user;
  },

  /* ── Payments ──────────────────────────────────────────────────────────── */

  createPayment({ userId, amount, provider, externalId = null }) {
    const payment = {
      id: randomUUID(),
      userId,
      amount,
      currency: "RUB",
      provider, // "yookassa" | "demo"
      externalId,
      status: "pending", // pending | succeeded | canceled
      createdAt: new Date().toISOString(),
      paidAt: null,
    };
    state.payments.push(payment);
    persist();
    return payment;
  },

  findPaymentById(id) {
    return state.payments.find((p) => p.id === id) || null;
  },
  findPaymentByExternalId(externalId) {
    return state.payments.find((p) => p.externalId === externalId) || null;
  },
  pendingPaymentFor(userId) {
    return state.payments.find((p) => p.userId === userId && p.status === "pending") || null;
  },
  setPaymentExternalId(id, externalId) {
    const p = store.findPaymentById(id);
    if (p) { p.externalId = externalId; persist(); }
    return p;
  },
  markPaymentStatus(id, status) {
    const p = store.findPaymentById(id);
    if (!p) return null;
    p.status = status;
    if (status === "succeeded") p.paidAt = new Date().toISOString();
    persist();
    return p;
  },

  /* ── Subscription / group access ───────────────────────────────────────── */

  // Payment confirmed → the user may now generate a code and join.
  grantPaid(userId) {
    const user = store.findById(userId);
    if (!user) return null;
    user.access = { ...emptyAccess(), status: "paid", paidAt: new Date().toISOString() };
    persist();
    return user;
  },

  // Code redeemed in the bot → the clock starts now.
  startMembership(userId, { telegramId, telegramUsername }, durationDays) {
    const user = store.findById(userId);
    if (!user) return null;
    const now = Date.now();
    user.access = {
      status: "active",
      paidAt: user.access?.paidAt ?? new Date(now).toISOString(),
      joinedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + durationDays * 86400000).toISOString(),
      telegramId: String(telegramId),
      telegramUsername: telegramUsername || null,
    };
    persist();
    return user;
  },

  expireAccess(userId) {
    const user = store.findById(userId);
    if (!user) return null;
    user.access.status = "expired";
    persist();
    return user;
  },

  // Active members whose window has closed — used by the kick sweeper.
  listExpiredMembers(now = new Date()) {
    return state.users.filter(
      (u) => u.access?.status === "active" && u.access.expiresAt && new Date(u.access.expiresAt) <= now,
    );
  },

  /* ── One-time access codes ─────────────────────────────────────────────── */

  activeCodeFor(userId) {
    return state.codes.find((c) => c.userId === userId && c.status === "active") || null;
  },
  findActiveCode(value) {
    const v = String(value || "").trim().toUpperCase();
    return state.codes.find((c) => c.code === v && c.status === "active") || null;
  },

  // Issue a fresh code, revoking any previous active one for the user.
  issueCode(userId) {
    for (const c of state.codes) {
      if (c.userId === userId && c.status === "active") c.status = "revoked";
    }
    const code = {
      code: generateCodeValue(),
      userId,
      status: "active", // active | used | revoked
      createdAt: new Date().toISOString(),
      usedAt: null,
      usedByTelegramId: null,
    };
    state.codes.push(code);
    persist();
    return code;
  },

  markCodeUsed(value, telegramId) {
    const c = store.findActiveCode(value);
    if (!c) return null;
    c.status = "used";
    c.usedAt = new Date().toISOString();
    c.usedByTelegramId = String(telegramId);
    persist();
    return c;
  },
};

// Human-typeable code: RAVA-XXXX-XXXX from an unambiguous alphabet (no O/0/I/1/L).
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function generateCodeValue() {
  const block = () =>
    Array.from({ length: 4 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join("");
  let value;
  do {
    value = `RAVA-${block()}-${block()}`;
  } while (state.codes.some((c) => c.code === value && c.status === "active"));
  return value;
}
