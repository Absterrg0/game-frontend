/**
 * Centralized query keys for TanStack Query.
 * Use these for consistency and easy invalidation.
 */
export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
  user: {
    all: ["user"] as const,
    profile: (id?: string) => [...queryKeys.user.all, "profile", id] as const,
  },
} as const;
