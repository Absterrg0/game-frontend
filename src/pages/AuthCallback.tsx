import { useSearchParams, Navigate } from "react-router-dom";
import { PENDING_SIGNUP_TOKEN_KEY } from "@/lib/auth";

/** Whitelist of safe error codes from backend/auth flow (prevents XSS/open redirect). */
const ALLOWED_ERROR_CODES = new Set(["true", "denied", "token", "invalid_callback"]);

function sanitizeErrorCode(raw: string | null): string | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim().toLowerCase();
  return ALLOWED_ERROR_CODES.has(trimmed) ? trimmed : "true";
}

/** Basic JWT format check (3 base64 parts) before storing. Backend does full verification. */
function isValidJwtFormat(token: string): boolean {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  return parts.length === 3 && parts.every((p) => /^[A-Za-z0-9_-]+$/.test(p));
}

/**
 * Handles OAuth callback from backend. Backend redirects here with query params:
 * - success=true: User logged in, session cookie set by backend
 * - signup=true&pendingToken=...: User needs to complete signup (token is signed JWT)
 * - error=true: Auth failed
 */
export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const signup = searchParams.get("signup");
  const error = sanitizeErrorCode(searchParams.get("error"));
  const pendingToken = searchParams.get("pendingToken");

  if (success === "true") return <Navigate to="/" replace />;

  if (signup === "true" && pendingToken) {
    if (!isValidJwtFormat(pendingToken)) {
      return <Navigate to="/login?error=invalid_callback" replace />;
    }
    sessionStorage.setItem(PENDING_SIGNUP_TOKEN_KEY, pendingToken);
    return <Navigate to="/information" replace />;
  }

  if (signup === "true" && !pendingToken) {
    return <Navigate to="/login?error=invalid_callback" replace />;
  }

  if (error) return <Navigate to={"/login?error=" + encodeURIComponent(error)} replace />;

  return <Navigate to="/login" replace />;
}
