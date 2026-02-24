import { useSearchParams, Navigate } from "react-router-dom";
import Cookies from "js-cookie";

/**
 * Handles OAuth callback from backend. Backend redirects here with query params:
 * - success=true: User logged in, session cookie set by backend
 * - signup=true&email=...&apple_id=...: User needs to complete signup
 * - error=true: Auth failed
 */
export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const signup = searchParams.get("signup");
  const error = searchParams.get("error");
  const email = searchParams.get("email");
  const appleId = searchParams.get("apple_id");

  if (success === "true") return <Navigate to="/" replace />;

  if (signup === "true") {
    const tenMinutes = 600 / 86400;
    if (email) Cookies.set("email", email, { path: "/", expires: tenMinutes });
    if (appleId) Cookies.set("appleId", appleId, { path: "/", expires: tenMinutes });
    return <Navigate to="/information" replace />;
  }

  if (error) return <Navigate to={"/login?error=" + error} replace />;

  return <Navigate to="/login" replace />;
}
