import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MyScoreRecordScoreLinkProps {
  to: string;
  label: string;
  className?: string;
}

/** Subtle inline action for matches that still need a score recorded. */
export function MyScoreRecordScoreLink({ to, label, className }: MyScoreRecordScoreLinkProps) {
  return (
    <Link
      to={to}
      onClick={(event) => event.stopPropagation()}
      className={cn(
        "inline-flex items-center rounded-sm text-[11px] font-medium text-brand-primary/85 underline underline-offset-2 transition-colors hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40",
        className,
      )}
    >
      {label}
    </Link>
  );
}
