import { createAuthClient } from "better-auth/react";
import { getBackendUrl } from "@/lib/api";

export const authClient = createAuthClient({
  baseURL: getBackendUrl(),
  fetchOptions: {
    credentials: "include",
  },
});
