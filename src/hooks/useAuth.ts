import { useState, useEffect } from "react";
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

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function checkAuth() {
    try {
      const res = await api.get<{ user: AuthUser }>("/api/auth/me");
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  // Initial auth check on mount — useEffect required; no declarative alternative without a data-fetching library
  useEffect(() => {
    checkAuth();
  }, []);

  async function logout() {
    try {
      await api.post("/api/auth/logout");
      setUser(null);
    } catch {
      setUser(null);
    }
  }

  const isProfileComplete = !!(user?.alias?.trim() && user?.name?.trim());

  return { user, loading, isAuthenticated: !!user, isProfileComplete, checkAuth, logout };
}
