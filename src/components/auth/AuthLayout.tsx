import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

// Generates a tiled ECG/heartbeat path normalised to pathLength=100 so the
// traced highlight animates resolution-independently.
function ecgPath(width = 720, units = 5) {
  const step = width / units;
  let d = "M0 40 ";
  for (let i = 0; i < units; i++) {
    const base = i * step;
    d += `H${(base + step * 0.4).toFixed(1)} `;
    d += `l${(step * 0.05).toFixed(1)} -24 l${(step * 0.06).toFixed(1)} 42 l${(step * 0.05).toFixed(1)} -30 l${(step * 0.04).toFixed(1)} 12 `;
    d += `H${(base + step).toFixed(1)} `;
  }
  return d.trim();
}

const ECG = ecgPath();

type Variant = "login" | "register";

const COPY: Record<Variant, { eyebrow: string; title: ReactNode; sub: string }> = {
  login: {
    eyebrow: "Личный кабинет",
    title: (
      <>
        Доступ к <span className="auth-aside-accent">сообществу</span> специалистов
      </>
    ),
    sub: "Членство, образовательные программы и научный обмен — в одном кабинете.",
  },
  register: {
    eyebrow: "Вступление в ассоциацию",
    title: (
      <>
        Станьте частью <span className="auth-aside-accent">RAVA</span>
      </>
    ),
    sub: "Регистрация открывает доступ к стандартам, курсам и профессиональной сети.",
  },
};

const STATS = [
  { num: "240+", lbl: "специалистов" },
  { num: "18", lbl: "регионов" },
  { num: "2026", lbl: "год основания" },
];

export function AuthLayout({ variant, children }: { variant: Variant; children: ReactNode }) {
  const copy = COPY[variant];

  return (
    <div className="auth">
      <aside className="auth-aside">
        <div className="auth-aside-noise" aria-hidden="true" />

        {/* Faint vascular network + travelling pulses */}
        <svg className="auth-aside-vessels" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path className="auth-vessel" d="M-20 120 Q 180 200 320 320 T 620 540" />
          <path className="auth-vessel" d="M620 80 Q 420 220 320 360 T 60 720" />
          <path className="auth-vessel" d="M-20 480 Q 200 460 360 500 T 620 460" />
          <path className="auth-vessel-pulse" d="M-20 120 Q 180 200 320 320 T 620 540" />
          <path className="auth-vessel-pulse delay" d="M620 80 Q 420 220 320 360 T 60 720" />
          <circle className="auth-vessel-node" cx="320" cy="320" r="4" />
          <circle className="auth-vessel-node" cx="360" cy="500" r="3" />
        </svg>

        <div className="auth-aside-inner">
          <Link to="/" className="auth-brand">
            <span className="auth-brand-mark">
              <span>R</span>
            </span>
            <span className="auth-brand-text">RAVA</span>
          </Link>

          <div className="auth-aside-body">
            <span className="auth-aside-eyebrow">{copy.eyebrow}</span>
            <h2 className="auth-aside-title">{copy.title}</h2>
            <p className="auth-aside-sub">{copy.sub}</p>

            {/* The signature: a live heartbeat trace */}
            <div className="auth-ecg" aria-hidden="true">
              <svg viewBox="0 0 720 80" preserveAspectRatio="none">
                <path className="auth-ecg-base" d={ECG} pathLength={100} />
                <path className="auth-ecg-trace" d={ECG} pathLength={100} />
              </svg>
              <span className="auth-ecg-label">Сосудистый доступ · Vascular Access</span>
            </div>
          </div>

          <div className="auth-aside-stats">
            {STATS.map((s) => (
              <div key={s.lbl} className="auth-stat">
                <div className="auth-stat-num">{s.num}</div>
                <div className="auth-stat-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="auth-main">
        <Link to="/" className="auth-back">
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          На сайт
        </Link>
        <div className="auth-card">{children}</div>
      </main>
    </div>
  );
}
