import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type ScoreQrLoadingSpinnerProps = {
  message?: string;
  className?: string;
  /** Use on dark scan/validate interim screens. */
  variant?: "light" | "dark";
};

export function ScoreQrLoadingSpinner({
  message,
  className,
  variant = "light",
}: ScoreQrLoadingSpinnerProps) {
  const { t } = useTranslation();
  const dotClass =
    variant === "dark" ? "bg-white/60" : "bg-[#010a04]/35";
  const messageClass =
    variant === "dark" ? "text-white/75" : "text-[#010a04]/65";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex flex-col items-center justify-center gap-3", className)}
    >
      <span className="sr-only">{t("common.loading", "Loading...")}</span>
      <div className="flex gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={cn("h-2 w-2 rounded-full", dotClass)}
            style={{
              animation: "score-qr-spinner-bounce 1.4s infinite ease-in-out",
              animationDelay: `${index * 0.16}s`,
            }}
          />
        ))}
      </div>
      {message ? (
        <p className={cn("max-w-xs text-center text-sm leading-relaxed", messageClass)}>
          {message}
        </p>
      ) : null}
      <style>{`
        @keyframes score-qr-spinner-bounce {
          0%, 80%, 100% { opacity: 0.4; transform: scale(1); }
          40% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
