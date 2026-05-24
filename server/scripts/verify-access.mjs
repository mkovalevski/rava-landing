// Integration check of the redemption + expiry-sweep store logic (the parts the
// Telegram bot drives), run against the configured PostgreSQL.
// Run from server/:  node --env-file-if-exists=.env scripts/verify-access.mjs
// It creates a handful of throwaway users and deletes them again at the end.
import { initDb, pool, query } from "../src/db.js";
import { store } from "../src/store.js";
import { hashPassword } from "../src/tokens.js";

await initDb();

const tag = Date.now(); // unique suffix so re-runs never collide on email
const pw = await hashPassword("vascular2026");
const createdIds = [];
let ok = true;

const mk = async (local, name) => {
  const u = await store.create({ email: `${local}+${tag}@clinic.ru`, name, passwordHash: pw });
  createdIds.push(u.id);
  return u;
};
const check = (label, cond) => {
  console.log(`${cond ? "✓" : "✗ FAIL"}  ${label}`);
  if (!cond) ok = false;
};

try {
  // none — just registered: no membership card, status none
  const none = await mk("none", "Нина Новикова");
  check("new user has no membership card", none.membership === null);
  check("new user access is 'none'", none.access.status === "none");

  // paid — paid, code issued, not yet joined
  const paid = await mk("paid", "Павел Платёжный");
  const paidAfter = await store.grantPaid(paid.id);
  check("grantPaid issues a membership card", !!paidAfter.membership?.id);
  const c1 = await store.issueCode(paid.id);
  const c2 = await store.issueCode(paid.id); // regenerate
  check("regenerate revokes the previous code", !(await store.findActiveCode(c1.code)) && !!(await store.findActiveCode(c2.code)));
  check("paid user has exactly one active code", (await store.activeCodeFor(paid.id)).code === c2.code);

  // active — redeemed via bot path (markCodeUsed + startMembership)
  const active = await mk("active", "Алла Активова");
  await store.grantPaid(active.id);
  const ac = await store.issueCode(active.id);
  check("code lookup is case-insensitive", !!(await store.findActiveCode(ac.code.toLowerCase())));
  await store.markCodeUsed(ac.code, 111222333);
  await store.startMembership(active.id, { telegramId: 111222333, telegramUsername: "alla_a" }, 30);
  check("used code is no longer active", !(await store.findActiveCode(ac.code)));
  check("member is active after redemption", (await store.findById(active.id)).access.status === "active");
  check("findActiveMemberByTelegramId matches the redeemer", (await store.findActiveMemberByTelegramId(111222333))?.id === active.id);
  check("stranger tg id has no active membership", (await store.findActiveMemberByTelegramId(999000999)) === null);
  check("active member NOT in expired sweep", !(await store.listExpiredMembers()).some((u) => u.id === active.id));

  // expired — membership window already closed → sweep should catch it
  const exp = await mk("expsweep", "Эдуард Истёкин");
  await store.grantPaid(exp.id);
  await store.startMembership(exp.id, { telegramId: 444555666, telegramUsername: "ed" }, 0); // expires immediately
  check("expired member IS in sweep", (await store.listExpiredMembers()).some((u) => u.id === exp.id));
  await store.expireAccess(exp.id);
  check("expireAccess flips status to expired", (await store.findById(exp.id)).access.status === "expired");
  check("expired member no longer in sweep", !(await store.listExpiredMembers()).some((u) => u.id === exp.id));
} finally {
  // Clean up the throwaway users (cascade removes their codes).
  if (createdIds.length) await query("DELETE FROM users WHERE id = ANY($1::uuid[])", [createdIds]);
  await pool.end();
}

console.log(ok ? "\nAll access-logic checks passed.\n" : "\nSOME CHECKS FAILED.\n");
process.exit(ok ? 0 : 1);
