import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/auth";

export default function AuthCallback() {
  const { checkAuth } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setIsCheckingSession(false);
      return;
    }

    let cancelled = false;
    async function finalizeSignIn() {
      await checkAuth();
      if (!cancelled) {
        navigate("/", { replace: true });
      }
    }

    void finalizeSignIn().finally(() => {
      if (!cancelled) {
        setIsCheckingSession(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [checkAuth, navigate, searchParams]);

  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const title = error
    ? "Sign-in could not be completed"
    : "Finishing sign-in";
  const description = error
    ? errorDescription ?? "Authentication failed. Please try again."
    : "Your session is being finalized. You will be redirected automatically.";
  const nextHref = error ? "/login" : "/";

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center gap-6 px-4 py-10 sm:px-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Apple OAuth callback</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{description}</p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to={nextHref}
            replace
            className="inline-flex items-center justify-center rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-brand-primary-hover"
          >
            {error ? "Back to login" : "Continue to the app"}
          </Link>
          {!error && isCheckingSession ? (
            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-500"
            >
              Redirecting...
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
