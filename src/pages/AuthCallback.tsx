import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Cookies from "js-cookie";

/**
 * Handles OAuth callback from backend. Backend redirects here with query params:
 * - success=true: User logged in, session cookie set by backend
 * - signup=true&email=...&apple_id=...: User needs to complete signup
 * - error=true: Auth failed
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const success = searchParams.get("success");
    const signup = searchParams.get("signup");
    const error = searchParams.get("error");
    const email = searchParams.get("email");
    const appleId = searchParams.get("apple_id");

    if (success === "true") {
      navigate("/", { replace: true });
      return;
    }

    if (signup === "true") {
      // Store email/appleId for signup form (cookies for cross-tab persistence)
      // js-cookie uses "expires" (in days), not maxAge
      const tenMinutes = 600 / 86400; // 600 seconds in days
      if (email) Cookies.set("email", email, { path: "/", expires: tenMinutes });
      if (appleId) Cookies.set("appleId", appleId, { path: "/", expires: tenMinutes });
      navigate("/information", { replace: true });
      return;
    }

    if (error) {
      navigate("/login?error=" + error, { replace: true });
      return;
    }

    navigate("/login", { replace: true });
  }, [navigate, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
}
