// Thin fetch wrapper around the RAVA backend. All requests go to the same
// origin (`/api/*`) — Vite proxies them to the Node server in dev — and carry
// the session cookie via `credentials: "include"`.

export type Membership = {
  id: string;
  tier: string;
  status: "active" | "pending" | "expired";
  since: string;
  renewsAt: string;
};

export type Profile = {
  specialty: string;
  institution: string;
  city: string;
  phone: string;
  bio: string;
};

export type Education = {
  courses: number;
  credits: number;
  certificates: number;
};

export type AccessStatus = "none" | "paid" | "active" | "expired";

export type AccessInfo = {
  status: AccessStatus;
  paidAt: string | null;
  joinedAt: string | null;
  expiresAt: string | null;
  telegramUsername: string | null;
};

export type AccessCode = {
  code: string;
  status: "active" | "used" | "revoked";
  createdAt: string;
};

export type AccessResponse = {
  priceRub: number;
  durationDays: number;
  access: AccessInfo;
  code: AccessCode | null;
  bot: { username: string | null; configured: boolean };
};

export type User = {
  id: string;
  email: string;
  name: string;
  provider: "local" | "yandex";
  hasPassword: boolean;
  yandexLinked: boolean;
  createdAt: string;
  membership: Membership | null; // null until the member purchases access
  profile: Profile;
  education: Education;
  access: AccessInfo;
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...init?.headers },
      ...init,
    });
  } catch {
    throw new ApiError("Не удалось связаться с сервером. Запущен ли backend?", 0);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError((data as { error?: string }).error ?? "Что-то пошло не так", res.status);
  }
  return data as T;
}

type AuthResponse = { user: User };

export const api = {
  me: () => request<AuthResponse>("/auth/me"),
  login: (body: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  register: (body: { email: string; password: string; name: string }) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request<{ ok: true }>("/auth/logout", { method: "POST" }),
  deleteAccount: () => request<{ ok: true }>("/auth/account", { method: "DELETE" }),
  changePassword: (body: { currentPassword?: string; newPassword: string }) =>
    request<{ ok: true }>("/auth/password", { method: "POST", body: JSON.stringify(body) }),
  updateProfile: (body: Partial<Profile> & { name?: string }) =>
    request<AuthResponse>("/profile", { method: "PATCH", body: JSON.stringify(body) }),

  // Telegram-community access
  getAccess: () => request<AccessResponse>("/access"),
  checkout: () =>
    request<{ confirmationUrl?: string; paid?: boolean; mock?: boolean }>("/billing/checkout", {
      method: "POST",
    }),
  generateCode: () => request<{ code: string }>("/access/code", { method: "POST" }),
};

// Full-page navigation target that kicks off the Yandex OAuth redirect flow.
export const YANDEX_AUTH_URL = "/api/auth/yandex";
