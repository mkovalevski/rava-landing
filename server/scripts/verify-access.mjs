// Offline verification of the redemption + expiry-sweep store logic (the parts
// the Telegram bot drives), plus seeding of demo users in every access state.
// Run from server/: node scripts/verify-access.mjs
import { store } from "../src/store.js";
import { hashPassword } from "../src/tokens.js";

const pw = await hashPassword("vascular2026");
let ok = true;
const check = (label, cond) => {
  console.log(`${cond ? "✓" : "✗ FAIL"}  ${label}`);
  if (!cond) ok = false;
};

// none — just registered
store.create({ email: "none@clinic.ru", name: "Нина Новикова", passwordHash: pw });

// paid — paid, code issued, not yet joined
const paid = store.create({ email: "paid@clinic.ru", name: "Павел Платёжный", passwordHash: pw });
store.grantPaid(paid.id);
const c1 = store.issueCode(paid.id);
const c2 = store.issueCode(paid.id); // regenerate
check("regenerate revokes the previous code", !store.findActiveCode(c1.code) && !!store.findActiveCode(c2.code));
check("paid user has exactly one active code", store.activeCodeFor(paid.id).code === c2.code);

// active — redeemed via bot path (markCodeUsed + startMembership)
const active = store.create({ email: "active@clinic.ru", name: "Алла Активова", passwordHash: pw });
store.grantPaid(active.id);
const ac = store.issueCode(active.id);
const found = store.findActiveCode(ac.code.toLowerCase()); // case-insensitive lookup
check("code lookup is case-insensitive", !!found);
store.markCodeUsed(ac.code, 111222333);
store.startMembership(active.id, { telegramId: 111222333, telegramUsername: "alla_a" }, 30);
check("used code is no longer active", !store.findActiveCode(ac.code));
check("member is active after redemption", store.findById(active.id).access.status === "active");
check("active member NOT in expired sweep", !store.listExpiredMembers().some((u) => u.id === active.id));

// expired — membership window already closed → sweep should catch it
const exp = store.create({ email: "expsweep@clinic.ru", name: "Эдуард Истёкин", passwordHash: pw });
store.grantPaid(exp.id);
store.startMembership(exp.id, { telegramId: 444555666, telegramUsername: "ed" }, 0); // expires immediately
const sweep = store.listExpiredMembers();
check("expired member IS in sweep", sweep.some((u) => u.id === exp.id));
store.expireAccess(exp.id);
check("expireAccess flips status to expired", store.findById(exp.id).access.status === "expired");
check("expired member no longer in sweep", !store.listExpiredMembers().some((u) => u.id === exp.id));

console.log(ok ? "\nAll access-logic checks passed.\n" : "\nSOME CHECKS FAILED.\n");
process.exit(ok ? 0 : 1);
