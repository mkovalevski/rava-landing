import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { api, type User } from "@/lib/api";

type Status = "loading" | "authed" | "guest";

type AuthValue = {
  user: User | null;
  status: Status;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (user: User) => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  const refresh = useCallback(async () => {
    try {
      const { user } = await api.me();
      setUser(user);
      setStatus("authed");
    } catch {
      setUser(null);
      setStatus("guest");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await api.login({ email, password });
    setUser(user);
    setStatus("authed");
    return user;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { user } = await api.register({ name, email, password });
    setUser(user);
    setStatus("authed");
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      setStatus("guest");
    }
  }, []);

  // Permanent: the server deletes the account and clears the session cookie.
  const deleteAccount = useCallback(async () => {
    await api.deleteAccount();
    setUser(null);
    setStatus("guest");
  }, []);

  const value: AuthValue = { user, status, login, register, logout, deleteAccount, refresh, setUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
