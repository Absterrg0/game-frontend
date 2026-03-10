import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { cn } from "@/lib/utils";

type InlineLoaderSize = "sm" | "md" | "lg";

const sizeClasses: Record<InlineLoaderSize, string> = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

interface InlineLoaderProps {
  className?: string;
  size?: InlineLoaderSize;
}

export default function InlineLoader({
  className,
  size = "lg",
}: InlineLoaderProps) {
  return (
    <div
      className={cn(
        "overflow-hidden pointer-events-none select-none",
        sizeClasses[size],
        className
      )}
    >
      <DotLottieReact
        src="/tennis-ball.json"
        loop
        autoplay
        mode="bounce"
        useFrameInterpolation
        renderConfig={{ devicePixelRatio: 1, autoResize: true }}
        className="w-full h-full"
      />
    </div>
  );
}
