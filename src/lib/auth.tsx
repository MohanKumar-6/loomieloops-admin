import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

type AuthCtx = {
  user: AdminUser | null;
  token: string | null;
  isReady: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);
const TOKEN_KEY = "admin_token";
const USER_KEY = "admin_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const t = localStorage.getItem(TOKEN_KEY);
      const raw = localStorage.getItem(USER_KEY);
      if (t && raw) {
        setToken(t);
        setUser(JSON.parse(raw));
      }
    } catch {}
    setIsReady(true);
  }, []);

  const login = (newToken: string, newUser: AdminUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, token, isReady, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
