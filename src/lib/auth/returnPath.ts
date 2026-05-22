/** sessionStorage key for post-login redirect (survives OAuth full-page navigation). */
export const RETURN_AFTER_LOGIN_KEY = "returnAfterLogin";

export function saveReturnPath(path: string): void {
  if (typeof window === "undefined") return;
  const trimmed = path.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return;
  try {
    sessionStorage.setItem(RETURN_AFTER_LOGIN_KEY, trimmed);
  } catch {
    /* private mode */
  }
}

export function consumeReturnPath(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = sessionStorage.getItem(RETURN_AFTER_LOGIN_KEY)?.trim() ?? "";
    sessionStorage.removeItem(RETURN_AFTER_LOGIN_KEY);
    if (!value.startsWith("/") || value.startsWith("//")) return null;
    return value;
  } catch {
    return null;
  }
}

export function loginPathWithReturn(returnPath?: string): string {
  if (!returnPath?.trim()) return "/login";
  return `/login?returnTo=${encodeURIComponent(returnPath.trim())}`;
}
