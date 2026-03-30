import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AuthContext, type AuthContextValue, type AuthUser } from "./context";

async function fetchMe(): Promise<AuthUser | null> {
  try {
    const res = await api.get<{ user: AuthUser | null }>("/api/auth/me");
    return res.data.user ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ["auth", "me"],
    queryFn: fetchMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const logout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // ignore network errors; still clear client state
    }

    queryClient.setQueryData(["auth", "me"], null);
    queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
  }, [queryClient]);

  const checkAuth = useCallback(async () => {
    return queryClient.fetchQuery<AuthUser | null>({
      queryKey: ["auth", "me"],
      queryFn: fetchMe,
    });
  }, [queryClient]);

  const value: AuthContextValue = {
    user: user ?? null,
    loading: isLoading,
    isAuthenticated: !!user,
    isProfileComplete: !!(user?.alias?.trim() && user?.name?.trim()),
    checkAuth,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
