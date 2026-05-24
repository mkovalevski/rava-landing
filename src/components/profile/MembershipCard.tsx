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
  const m = user.membership;
  if (!m) return null; // not issued yet — caller renders <MembershipLocked />

  const status = STATUS[m.status] ?? STATUS.active;

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
        <span className="mcard-kind">Карта участника</span>
      </div>

      <div className="mcard-body">
        <div className="mcard-avatar" aria-hidden="true">{initials(user.name)}</div>
        <div>
          <div className="mcard-name">{user.name}</div>
          <div className="mcard-tier">{m.tier}</div>
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
          <span className="mcard-val mono">{m.id}</span>
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
          <span className="mcard-val">{fmtDate(m.renewsAt)}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * The credential before it's issued: a blank card whose ECG is a FLAT LINE —
 * no pulse until the member purchases access. Issuing the card brings the
 * heartbeat (and the navy <MembershipCard/>) to life.
 */
export function MembershipLocked({ onGetAccess }: { onGetAccess: () => void }) {
  return (
    <div className="mcard-blank">
      <svg className="mcard-vessels mcard-vessels-blank" viewBox="0 0 420 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path d="M-20 60 Q 120 110 220 150 T 460 200" />
        <path d="M440 30 Q 300 110 220 150 T -20 230" />
      </svg>

      <div className="mcard-top">
        <div className="mcard-brand mcard-brand-blank">
          <span className="mcard-mark mcard-mark-blank">R</span>
          <span>RAVA</span>
        </div>
        <span className="mcard-kind mcard-kind-blank">Карта участника</span>
      </div>

      <div className="mcard-blank-body">
        <span className="mcard-lock" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
            <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
            <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
          </svg>
        </span>
        <div>
          <div className="mcard-blank-title">Карта ещё не выпущена</div>
          <p className="mcard-blank-sub">Оформите доступ — членская карта активируется автоматически.</p>
        </div>
      </div>

      {/* flat line — no pulse until issued */}
      <svg className="mcard-ecg mcard-ecg-flat" viewBox="0 0 420 28" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 14 H420" pathLength={100} />
      </svg>

      <div className="mcard-blank-foot">
        <div className="mcard-field">
          <span className="mcard-lab mcard-lab-blank">№ членства</span>
          <span className="mcard-blank-placeholder mono">RAVA-····-····</span>
        </div>
        <button type="button" className="btn btn-primary mcard-issue-btn" onClick={onGetAccess}>
          Оформить доступ
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
