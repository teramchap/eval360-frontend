import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../lib/api";
import { supabase } from "../lib/supabase";

interface UserInfo {
  id: string;
  name: string;
  personnelCode: string;
  role: string;
  roleLabel: string;
  unit: string;
}

interface AuthCtx {
  user: UserInfo | null;
  loading: boolean;
  login: (code: string, password: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshProfile() {
    try {
      const profile = await api.me();
      setUser(profile);
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) await refreshProfile();
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setUser(null);
      } else {
        await refreshProfile();
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function login(code: string, password: string) {
    await api.login(code, password);
    await refreshProfile();
  }

  function logout() {
    api.logout();
    setUser(null);
  }

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
