import { useTranslation } from "react-i18next";
import { cn } from "../../utils/tailwindClassesMerge";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
export default function Loader({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <section
      className={cn(
        "w-full h-[calc(100vh-80px)] flex justify-center items-center flex-col overflow-hidden",
        className
      )}
    >
      <DotLottieReact
        src="/tennis-ball.json"
        loop
        autoplay
        className="w-full h-full"
      />
      <p className="font-secondary text-2xl text-brand-black/60 -mt-28">
        {t("loading")}
      </p>
    </section>
  );
}
