/**
 * Decodes the payload of a JWT without verification (for display only).
 * The backend verifies the token; this is only for UX (e.g. showing email).
 */
export function decodeJwtPayload<T = Record<string, unknown>>(token: string): T {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token format");
  const payload = parts[1];
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - base64.length % 4) % 4), "=");
  const json = atob(padded);
  return JSON.parse(json) as T;
}

export interface PendingSignupPayload {
  pendingEmail: string;
  pendingSignup: true;
  appleId?: string;
  googleId?: string;
}
