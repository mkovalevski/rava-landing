import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

import { useAuth } from "@/auth/AuthContext";
import { api, ApiError, type AccessInfo, type AccessResponse, type Profile, type User } from "@/lib/api";
import { AuthField } from "@/components/auth/AuthField";
import { MembershipCard } from "@/components/profile/MembershipCard";

/* ────────────────────────────────────────────────────────────────────────── */

type Tab = "overview" | "community" | "profile" | "security";

const TABS: { id: Tab; label: string; icon: JSX.Element }[] = [
  { id: "overview", label: "Обзор", icon: <IconGrid /> },
  { id: "community", label: "Сообщество", icon: <IconSend /> },
  { id: "profile", label: "Профиль", icon: <IconUser /> },
  { id: "security", label: "Безопасность", icon: <IconShield /> },
];

function ProfilePage() {
  const { status, user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [welcome, setWelcome] = useState(false);

  useEffect(() => {
    if (status === "guest") void navigate({ to: "/login" });
  }, [status, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("welcome") === "1") setWelcome(true);
    if (params.get("paid") === "1") setTab("community"); // returning from checkout
  }, []);

  if (status !== "authed" || !user) {
    return (
      <div className="pf-loading">
        <span className="spinner spinner-brand" aria-hidden="true" />
        <p>Загрузка кабинета…</p>
      </div>
    );
  }

  return (
    <div className="pf">
      <header className="pf-bar">
        <Link to="/" className="pf-brand">
          <span className="pf-brand-mark"><span>R</span></span>
          <span className="pf-brand-text">RAVA</span>
          <span className="pf-brand-sub">Кабинет члена</span>
        </Link>
        <div className="pf-bar-right">
          <Link to="/" className="pf-bar-link">На сайт</Link>
          <span className="pf-bar-divider" aria-hidden="true" />
          <div className="pf-userchip">
            <span className="pf-userchip-avatar">{initialsOf(user.name)}</span>
            <span className="pf-userchip-meta">
              <span className="pf-userchip-name">{user.name}</span>
              <span className="pf-userchip-tier">{user.membership.tier}</span>
            </span>
          </div>
          <button className="pf-logout" onClick={() => void logout()}>Выйти</button>
        </div>
      </header>

      <div className="pf-container">
        {welcome && (
          <div className="pf-welcome" role="status">
            <div>
              <strong>Добро пожаловать в RAVA!</strong> Заполните профиль, чтобы коллеги могли вас найти.
            </div>
            <button className="pf-welcome-x" onClick={() => setWelcome(false)} aria-label="Закрыть">×</button>
          </div>
        )}

        <div className="pf-layout">
          <aside className="pf-side">
            <nav className="pf-nav">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  className={`pf-nav-item${tab === t.id ? " is-active" : ""}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </nav>
            <div className="pf-side-note">
              <span className="mono">RAVA · {user.membership.id}</span>
              <p>Член с {fmtDate(user.membership.since)}</p>
            </div>
          </aside>

          <section className="pf-content">
            {tab === "overview" && <OverviewTab user={user} onOpenCommunity={() => setTab("community")} />}
            {tab === "community" && <CommunityTab />}
            {tab === "profile" && <ProfileTab user={user} onSaved={setUser} />}
            {tab === "security" && <SecurityTab user={user} onLogout={() => void logout()} />}
          </section>
        </div>
      </div>
    </div>
  );
}

/* ── Overview ─────────────────────────────────────────────────────────────── */

function OverviewTab({ user, onOpenCommunity }: { user: User; onOpenCommunity: () => void }) {
  const stats = [
    { num: user.education.courses, lbl: "Курсов пройдено" },
    { num: user.education.credits, lbl: "Кредитов НМО" },
    { num: user.education.certificates, lbl: "Сертификатов" },
  ];
  const filled = profileCompletion(user.profile);

  return (
    <div className="pf-grid">
      <SectionHead eyebrow="01 — Членство" title="Ваша карта" />
      <MembershipCard user={user} />

      <div className="pf-stats">
        {stats.map((s) => (
          <div key={s.lbl} className="pf-stat">
            <div className="pf-stat-num">{s.num}</div>
            <div className="pf-stat-lbl">{s.lbl}</div>
          </div>
        ))}
        <div className="pf-stat pf-stat-progress">
          <div className="pf-ring" style={{ ["--p" as string]: `${filled}` }}>
            <span>{filled}%</span>
          </div>
          <div className="pf-stat-lbl">Профиль заполнен</div>
        </div>
      </div>

      <div className="pf-panel pf-cta-panel">
        <div>
          <h3>Telegram-сообщество</h3>
          <p className="pf-muted">{accessSummaryLine(user.access)}</p>
        </div>
        <button className="btn btn-ghost" onClick={onOpenCommunity}>
          {user.access.status === "active" ? "Открыть раздел" : "Оформить доступ"}
        </button>
      </div>
    </div>
  );
}

function accessSummaryLine(a: AccessInfo) {
  switch (a.status) {
    case "active":
      return `Доступ активен${a.expiresAt ? ` до ${fmtDate(a.expiresAt)}` : ""}.`;
    case "paid":
      return "Оплачено — активируйте доступ кодом в боте.";
    case "expired":
      return "Доступ истёк. Продлите, чтобы вернуться в группу.";
    default:
      return "Закрытая группа специалистов по сосудистому доступу.";
  }
}

/* ── Profile ──────────────────────────────────────────────────────────────── */

const FIELDS: { key: keyof Profile | "name"; label: string; placeholder: string; full?: boolean }[] = [
  { key: "name", label: "Имя и фамилия", placeholder: "Алексей Петров" },
  { key: "specialty", label: "Специальность", placeholder: "Сосудистый хирург" },
  { key: "institution", label: "Учреждение", placeholder: "ФЦ сердечно-сосудистой хирургии" },
  { key: "city", label: "Город", placeholder: "Москва" },
  { key: "phone", label: "Телефон", placeholder: "+7 (___) ___-__-__" },
];

function ProfileTab({ user, onSaved }: { user: User; onSaved: (u: User) => void }) {
  const initial = useMemo(
    () => ({ name: user.name, ...user.profile }),
    [user],
  );
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { user: updated } = await api.updateProfile(form);
      onSaved(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось сохранить");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="pf-grid" onSubmit={onSubmit}>
      <SectionHead eyebrow="02 — Профиль" title="Профессиональные данные" />

      <div className="pf-panel">
        <div className="pf-fields">
          {FIELDS.map((f) => (
            <AuthField
              key={f.key}
              label={f.label}
              placeholder={f.placeholder}
              value={(form as Record<string, string>)[f.key] ?? ""}
              onChange={(e) => set(f.key as keyof typeof form, e.target.value)}
            />
          ))}
          <label className="field pf-field-full">
            <span className="field-label">О себе</span>
            <span className="field-control">
              <textarea
                className="field-input"
                rows={4}
                placeholder="Научные интересы, направления работы, регалии…"
                value={form.bio}
                onChange={(e) => set("bio", e.target.value)}
              />
            </span>
          </label>
        </div>

        {error && <div className="auth-error" role="alert">{error}</div>}

        <div className="pf-actions">
          <span className={`pf-saved${saved ? " is-on" : ""}`}>✓ Сохранено</span>
          <button className="btn btn-primary" type="submit" disabled={busy || !dirty}>
            {busy ? <span className="spinner" aria-hidden="true" /> : "Сохранить изменения"}
          </button>
        </div>
      </div>
    </form>
  );
}

/* ── Security ─────────────────────────────────────────────────────────────── */

function SecurityTab({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await api.changePassword(
        user.hasPassword ? { currentPassword: cur, newPassword: next } : { newPassword: next },
      );
      setMsg({ ok: true, text: user.hasPassword ? "Пароль обновлён" : "Пароль установлен" });
      setCur("");
      setNext("");
    } catch (err) {
      setMsg({ ok: false, text: err instanceof ApiError ? err.message : "Не удалось сохранить" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pf-grid">
      <SectionHead eyebrow="03 — Безопасность" title="Аккаунт и вход" />

      <div className="pf-panel">
        <div className="pf-account">
          <div className="pf-account-row">
            <span className="pf-account-lab">E-mail</span>
            <span className="pf-account-val">{user.email}</span>
          </div>
          <div className="pf-account-row">
            <span className="pf-account-lab">Способ входа</span>
            <span className="pf-account-val">
              {user.provider === "yandex" ? "Яндекс ID" : "E-mail и пароль"}
            </span>
          </div>
          <div className="pf-account-row">
            <span className="pf-account-lab">Яндекс ID</span>
            <span className="pf-account-val">
              {user.yandexLinked ? (
                <span className="pf-badge is-yandex">Привязан</span>
              ) : (
                <span className="pf-badge">Не привязан</span>
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="pf-panel">
        <h3 className="pf-panel-title">{user.hasPassword ? "Сменить пароль" : "Задать пароль"}</h3>
        {!user.hasPassword && (
          <p className="pf-muted">
            Вы вошли через Яндекс. Задайте пароль, чтобы также входить по e-mail.
          </p>
        )}
        <form className="pf-fields pf-fields-narrow" onSubmit={onSubmit}>
          {user.hasPassword && (
            <AuthField
              label="Текущий пароль"
              type="password"
              autoComplete="current-password"
              value={cur}
              onChange={(e) => setCur(e.target.value)}
              required
            />
          )}
          <AuthField
            label="Новый пароль"
            type="password"
            autoComplete="new-password"
            hint="Не короче 8 символов"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
          />
          {msg && (
            <div className={msg.ok ? "pf-note-ok" : "auth-error"} role="alert">
              {msg.text}
            </div>
          )}
          <div className="pf-actions">
            <button className="btn btn-primary" type="submit" disabled={busy || next.length < 8}>
              {busy ? <span className="spinner" aria-hidden="true" /> : "Сохранить"}
            </button>
          </div>
        </form>
      </div>

      <div className="pf-panel pf-danger">
        <div>
          <h3 className="pf-panel-title">Завершить сессию</h3>
          <p className="pf-muted">Вы выйдете из кабинета на этом устройстве.</p>
        </div>
        <button className="btn btn-ghost" onClick={onLogout}>Выйти из аккаунта</button>
      </div>
    </div>
  );
}

/* ── Community (Telegram access) ────────────────────────────────────────────── */

const ACCESS_LABEL: Record<AccessInfo["status"], string> = {
  none: "Не оформлен",
  paid: "Оплачено · ожидает активации",
  active: "Активно",
  expired: "Истёк",
};

function CommunityTab() {
  const [data, setData] = useState<AccessResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await api.getAccess());
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Returning from checkout (?paid=1): poll until the subscription flips.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("paid") !== "1") return;
    let n = 0;
    const iv = setInterval(async () => {
      n += 1;
      try {
        const d = await api.getAccess();
        setData(d);
        if (d.access.status !== "none" || n >= 6) clearInterval(iv);
      } catch {
        if (n >= 6) clearInterval(iv);
      }
    }, 1200);
    return () => clearInterval(iv);
  }, []);

  async function pay() {
    setBusy(true);
    setError(null);
    try {
      const res = await api.checkout();
      // Mock payment settles instantly server-side — just refresh into the
      // "paid" state where the access code can be issued. Real YooKassa
      // (when configured) returns a confirmation URL to redirect to instead.
      if (res.confirmationUrl) {
        window.location.href = res.confirmationUrl;
        return;
      }
      await load();
      setBusy(false);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Не удалось начать оплату");
      setBusy(false);
    }
  }

  async function regenerate() {
    setBusy(true);
    setError(null);
    try {
      await api.generateCode();
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Не удалось создать код");
    } finally {
      setBusy(false);
    }
  }

  function copyCode(code: string) {
    void navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  if (loading || !data) {
    return (
      <div className="pf-grid">
        <SectionHead eyebrow="02 — Сообщество" title="Доступ в Telegram-группу" />
        <div className="pf-panel" style={{ display: "grid", placeItems: "center", minHeight: 120 }}>
          <span className="spinner spinner-brand" aria-hidden="true" />
        </div>
      </div>
    );
  }

  const { access, code, bot, priceRub, durationDays } = data;
  const botLink = bot.username ? `https://t.me/${bot.username}` : null;

  return (
    <div className="pf-grid">
      <div className="pf-head pf-head-row">
        <div>
          <span className="eyebrow">02 — Сообщество</span>
          <h2>Доступ в Telegram-группу</h2>
        </div>
        <span className={`pf-access-pill is-${access.status}`}>
          <i /> {ACCESS_LABEL[access.status]}
        </span>
      </div>

      {error && <div className="auth-error" role="alert">{error}</div>}

      {(access.status === "none" || access.status === "expired") && (
        <div className="pf-panel pf-paywall">
          <div className="pf-paywall-info">
            <h3>Закрытое сообщество специалистов</h3>
            <ul className="pf-perks">
              <li>Клинические разборы и протоколы сосудистого доступа</li>
              <li>Прямой диалог с экспертами ассоциации</li>
              <li>Анонсы школ, вебинаров и конференций RAVA</li>
            </ul>
          </div>
          <div className="pf-price-card">
            {access.status === "expired" && (
              <div className="pf-price-note">Доступ истёк — продлите, чтобы вернуться</div>
            )}
            <div className="pf-price">
              <b>{priceRub}</b> ₽<span>/ {durationDays} дней</span>
            </div>
            <button className="btn btn-primary" onClick={pay} disabled={busy} style={{ width: "100%", justifyContent: "center" }}>
              {busy ? <span className="spinner" aria-hidden="true" /> : "Оплатить доступ"}
            </button>
            <div className="pf-price-fine">Безопасная оплата через ЮKassa</div>
          </div>
        </div>
      )}

      {access.status === "paid" && (
        <div className="pf-panel">
          <div className="pf-paid-banner">✓ Оплата прошла. Активируйте доступ кодом в боте.</div>

          {code ? (
            <div className="pf-code-block">
              <span className="pf-code-cap">Ваш одноразовый код</span>
              <div className="pf-code">
                <span className="pf-code-value mono">{code.code}</span>
                <button className="pf-copy" onClick={() => copyCode(code.code)}>
                  {copied ? "Скопировано ✓" : "Копировать"}
                </button>
              </div>
              <button className="pf-regen" onClick={regenerate} disabled={busy}>
                ↻ Перегенерировать — прежний код станет недействительным
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={regenerate} disabled={busy}>
              {busy ? <span className="spinner" aria-hidden="true" /> : "Получить код доступа"}
            </button>
          )}

          <ol className="pf-steps">
            <li>Откройте бота в Telegram</li>
            <li>Нажмите «Получить доступ»</li>
            <li>Введите код — бот пришлёт персональную ссылку на вступление</li>
          </ol>

          {botLink ? (
            <a className="btn-telegram" href={botLink} target="_blank" rel="noreferrer">
              <IconSend /> Открыть бота{bot.username ? ` @${bot.username}` : ""}
            </a>
          ) : (
            <div className="pf-muted">
              Бот ещё настраивается администратором — ваш код сохранён в кабинете.
            </div>
          )}
        </div>
      )}

      {access.status === "active" && (
        <div className="pf-panel pf-cta-panel pf-active">
          <div>
            <h3>Вы в сообществе 🎉</h3>
            <p className="pf-muted">
              Доступ активен{access.expiresAt ? ` до ${fmtDate(access.expiresAt)}` : ""}.
              {access.telegramUsername ? ` Аккаунт: @${access.telegramUsername}.` : ""} По окончании срока
              вы будете автоматически удалены из группы.
            </p>
          </div>
          {botLink && (
            <a className="btn-telegram" href={botLink} target="_blank" rel="noreferrer">
              <IconSend /> Открыть бота
            </a>
          )}
        </div>
      )}
    </div>
  );
}

/* ── bits ─────────────────────────────────────────────────────────────────── */

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="pf-head">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
    </div>
  );
}

function profileCompletion(p: Profile) {
  const keys: (keyof Profile)[] = ["specialty", "institution", "city", "phone", "bio"];
  const done = keys.filter((k) => p[k]?.trim()).length;
  return Math.round((done / keys.length) * 100);
}

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso),
  );
}

function initialsOf(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}

function IconGrid() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" /><path d="M9 12l2 2 4-4" />
    </svg>
  );
}
function IconSend() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
    </svg>
  );
}

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});
