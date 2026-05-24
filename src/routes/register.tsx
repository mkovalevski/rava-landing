import { useEffect, useState, type FormEvent } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthField } from "@/components/auth/AuthField";
import { YandexButton } from "@/components/auth/YandexButton";
import { useAuth } from "@/auth/AuthContext";
import { ApiError } from "@/lib/api";

function RegisterPage() {
  const { register, status } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "authed") void navigate({ to: "/profile" });
  }, [status, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!consent) {
      setError("Подтвердите согласие на обработку персональных данных.");
      return;
    }
    setBusy(true);
    try {
      await register(name.trim(), email.trim(), password);
      await navigate({ to: "/profile", search: { welcome: 1 } as never });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось зарегистрироваться");
      setBusy(false);
    }
  }

  return (
    <AuthLayout variant="register">
      <span className="eyebrow">Регистрация</span>
      <h1 className="auth-title">Создать аккаунт</h1>
      <p className="auth-lead">Присоединяйтесь к профессиональному сообществу сосудистого доступа.</p>

      <YandexButton label="Зарегистрироваться через Яндекс" />

      <div className="auth-divider"><span>или по e-mail</span></div>

      {error && <div className="auth-error" role="alert">{error}</div>}

      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <AuthField
          label="Имя и фамилия"
          name="name"
          autoComplete="name"
          placeholder="Алексей Петров"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <AuthField
          label="E-mail"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@hospital.ru"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <AuthField
          label="Пароль"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="Минимум 8 символов"
          hint="Не короче 8 символов"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label className="auth-consent">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>
            Я соглашаюсь с обработкой персональных данных и условиями членства в ассоциации.
          </span>
        </label>

        <button className="btn btn-primary auth-submit" type="submit" disabled={busy}>
          {busy ? <span className="spinner" aria-hidden="true" /> : "Создать аккаунт"}
        </button>
      </form>

      <p className="auth-switch">
        Уже состоите в ассоциации? <Link to="/login">Войти</Link>
      </p>
    </AuthLayout>
  );
}

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});
