import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/queryKeys";
import { type AuthUser } from "@/contexts/auth/AuthContext";
async function fetchCurrentUser() {
  const res = await api.get<{ user: AuthUser }>("/api/session/me");
  return res.data.user;
}

export function useCurrentUser() {
  const query = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: fetchCurrentUser,
    retry: false,
  });

  const user = query.data ?? null;
  const isProfileComplete = !!(user?.alias?.trim() && user?.name?.trim());

  return {
    user,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    dataUpdatedAt: query.dataUpdatedAt,
    isAuthenticated: !!user,
    isProfileComplete,
  };
}
