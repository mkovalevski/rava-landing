import { useEffect, useState, type FormEvent } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthField } from "@/components/auth/AuthField";
import { YandexButton } from "@/components/auth/YandexButton";
import { useAuth } from "@/auth/AuthContext";
import { ApiError } from "@/lib/api";

const YANDEX_ERRORS: Record<string, string> = {
  yandex_not_configured: "Вход через Яндекс пока не настроен на сервере.",
  yandex_denied: "Доступ через Яндекс отклонён.",
  yandex_state: "Сессия входа истекла. Попробуйте ещё раз.",
  yandex_failed: "Не удалось войти через Яндекс. Попробуйте ещё раз.",
};

function LoginPage() {
  const { login, status } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Surface Yandex redirect errors, and bounce already-authed users away.
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("error");
    if (code) setError(YANDEX_ERRORS[code] ?? "Не удалось войти. Попробуйте ещё раз.");
  }, []);

  useEffect(() => {
    if (status === "authed") void navigate({ to: "/profile" });
  }, [status, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email.trim(), password);
      await navigate({ to: "/profile" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось войти");
      setBusy(false);
    }
  }

  return (
    <AuthLayout variant="login">
      <span className="eyebrow">Вход</span>
      <h1 className="auth-title">С возвращением</h1>
      <p className="auth-lead">Войдите, чтобы управлять членством и образовательным профилем.</p>

      <YandexButton label="Войти с Яндекс ID" />

      <div className="auth-divider"><span>или по e-mail</span></div>

      {error && <div className="auth-error" role="alert">{error}</div>}

      <form className="auth-form" onSubmit={onSubmit} noValidate>
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
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn btn-primary auth-submit" type="submit" disabled={busy}>
          {busy ? <span className="spinner" aria-hidden="true" /> : "Войти"}
        </button>
      </form>

      <p className="auth-switch">
        Ещё нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>
    </AuthLayout>
  );
}

export const Route = createFileRoute("/login")({
  component: LoginPage,
});
