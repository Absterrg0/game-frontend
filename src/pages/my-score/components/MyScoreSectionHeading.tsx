import { cn } from "@/lib/utils";

interface MyScoreSectionHeadingProps {
  title: string;
  className?: string;
}

export function MyScoreSectionHeading({ title, className }: MyScoreSectionHeadingProps) {
  return (
    <h2
      className={cn(
        "px-4 pb-2 text-[15px] font-semibold text-[#010a04] sm:px-5",
        className,
      )}
    >
      {title}
    </h2>
  );
}
