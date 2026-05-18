import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "@/icons/figma-icons";
import { cn } from "@/lib/utils";

const shareIconClassName =
  "text-[#010a04] transition-transform duration-200 ease-out group-hover:scale-[1.05]";

type ShareTextButtonProps = {
  label: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
};

/** Share action with brand-accent styling (matches Add Club / Become Sponsor CTAs). */
export function ShareTextButton({
  label,
  onClick,
  disabled,
  className,
  type = "button",
}: ShareTextButtonProps) {
  return (
    <Button
      type={type}
      variant="accent"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group h-auto gap-1.5 px-3 py-1.5 text-[14px] font-medium",
        className,
      )}
    >
      <Share2 size={16} className={shareIconClassName} />
      {label}
    </Button>
  );
}
