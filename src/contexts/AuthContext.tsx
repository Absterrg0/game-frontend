import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  alias?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  userType?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const res = await api.get<{ user: AuthUser }>("/api/auth/me");
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout");
      setUser(null);
    } catch {
      setUser(null);
    }
  }, []);

  const isProfileComplete = !!(user?.alias?.trim() && user?.name?.trim());

  const value: AuthContextValue = {
    user,
    loading,
    isAuthenticated: !!user,
    isProfileComplete,
    checkAuth,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
