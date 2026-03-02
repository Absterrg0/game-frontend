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
    favoriteClubs: () => [...queryKeys.user.all, "favorite-clubs"] as const,
    adminClubs: () => [...queryKeys.user.all, "admin-clubs"] as const,
    search: (query: string) =>
      [...queryKeys.user.all, "search", query] as const,
  },
  club: {
    all: ["club"] as const,
    detail: (id: string) => [...queryKeys.club.all, "detail", id] as const,
    staff: (id: string) => [...queryKeys.club.all, "staff", id] as const,
    sponsors: (id: string) => [...queryKeys.club.all, "sponsors", id] as const,
  },
} as const;
