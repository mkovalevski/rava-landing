import type { User } from "@/lib/api";

const STATUS: Record<string, { label: string; cls: string }> = {
  active: { label: "Активно", cls: "is-active" },
  pending: { label: "На рассмотрении", cls: "is-pending" },
  expired: { label: "Истекло", cls: "is-expired" },
};

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso),
  );
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function MembershipCard({ user }: { user: User }) {
  const status = STATUS[user.membership.status] ?? STATUS.active;

  return (
    <div className="mcard">
      <svg className="mcard-vessels" viewBox="0 0 420 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path d="M-20 60 Q 120 110 220 150 T 460 200" />
        <path d="M440 30 Q 300 110 220 150 T -20 230" />
        <path d="M-20 190 Q 140 170 240 190 T 460 160" />
        <circle cx="220" cy="150" r="3.5" />
      </svg>

      <div className="mcard-top">
        <div className="mcard-brand">
          <span className="mcard-mark">R</span>
          <span>RAVA</span>
        </div>
        <span className="mcard-kind">Карта члена</span>
      </div>

      <div className="mcard-body">
        <div className="mcard-avatar" aria-hidden="true">{initials(user.name)}</div>
        <div>
          <div className="mcard-name">{user.name}</div>
          <div className="mcard-tier">{user.membership.tier}</div>
        </div>
      </div>

      {/* heartbeat strip — the medical signature */}
      <svg className="mcard-ecg" viewBox="0 0 420 28" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M0 14 H150 l6 -10 l7 18 l6 -22 l5 14 H260 l6 -10 l7 18 l6 -22 l5 14 H420"
          pathLength={100}
        />
      </svg>

      <div className="mcard-foot">
        <div className="mcard-field">
          <span className="mcard-lab">№ членства</span>
          <span className="mcard-val mono">{user.membership.id}</span>
        </div>
        <div className="mcard-field">
          <span className="mcard-lab">Статус</span>
          <span className={`mcard-status ${status.cls}`}>
            <i className="mcard-dot" />
            {status.label}
          </span>
        </div>
        <div className="mcard-field">
          <span className="mcard-lab">Действует до</span>
          <span className="mcard-val">{fmtDate(user.membership.renewsAt)}</span>
        </div>
      </div>
    </div>
  );
}
