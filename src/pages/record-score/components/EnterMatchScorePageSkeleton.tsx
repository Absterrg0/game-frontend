type EnterMatchScorePageSkeletonProps = {
  variant: "confirm" | "generate";
  statusMessage?: string;
};

function ScoreRowsSkeleton() {
  return (
    <div className="space-y-3 sm:space-y-2.5">
      {Array.from({ length: 2 }).map((_, rowIndex) => (
        <div
          key={`score-skeleton-row-${rowIndex}`}
          className="rounded-[12px] border border-[#010a04]/[0.06] bg-[#f4f6f5] p-3 sm:grid sm:grid-cols-[140px_minmax(0,1fr)] sm:items-center sm:gap-3 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0"
        >
          <div className="flex items-center gap-2 sm:block">
            <div className="size-8 shrink-0 animate-skeleton-soft rounded-full bg-[#010a04]/8 sm:mb-1.5" />
            <div className="h-4 w-24 animate-skeleton-soft rounded bg-[#010a04]/8 sm:h-4" />
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2.5 sm:mt-0 sm:gap-2">
            {Array.from({ length: 3 }).map((__, colIndex) => (
              <div
                key={`score-skeleton-cell-${rowIndex}-${colIndex}`}
                className="h-[44px] animate-skeleton-soft rounded-[10px] bg-[#010a04]/8 sm:h-[34px] sm:rounded-[8px]"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function EnterMatchScorePageSkeleton({
  variant,
  statusMessage = "Loading…",
}: EnterMatchScorePageSkeletonProps) {
  const isConfirm = variant === "confirm";

  return (
    <div
      className="min-h-[calc(100vh-56px)] px-0 pb-10 pt-0 sm:px-0 sm:pt-0 lg:min-h-[calc(100vh-60px)] lg:pt-0"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only" role="status">
        {statusMessage}
      </span>
      <div className="mx-auto w-full max-w-[992px]">
        <div className="mx-auto w-full max-w-[784px]">
          {!isConfirm ? (
            <div className="h-4 w-20 animate-skeleton-soft rounded bg-[#010a04]/10" />
          ) : null}
        </div>

        <section className="mx-auto mt-3 w-full max-w-[784px] rounded-[12px] border border-[rgba(1,10,4,0.08)] bg-white p-4 shadow-[0_3px_7.5px_rgba(0,0,0,0.06)] sm:mt-3 sm:p-[18px]">
          <div className="mt-1 flex flex-col gap-1 sm:mt-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="h-7 w-48 animate-skeleton-soft rounded bg-[#010a04]/10 sm:h-8 sm:w-56" />
            {isConfirm ? (
              <div className="h-4 w-32 animate-skeleton-soft rounded bg-[#010a04]/8 sm:pt-1" />
            ) : null}
          </div>

          <div className="mt-5 flex flex-col gap-5">
            {!isConfirm ? (
              <div className="mx-auto aspect-square w-full max-w-[min(560px,100%)] animate-skeleton-soft rounded-[8px] bg-[#010a04]/8" />
            ) : null}

            <div className="min-w-0 flex-1 space-y-4">
              <div className="space-y-2.5">
                <div className="h-[34px] w-full animate-skeleton-soft rounded-[8px] bg-[#010a04]/8" />
                <div className="h-4 w-[85%] animate-skeleton-soft rounded bg-[#010a04]/8" />

                <div className="space-y-3 pt-1">
                  <div className="flex min-w-0 flex-row flex-wrap items-center gap-2">
                    <div className="h-6 w-32 animate-skeleton-soft rounded bg-[#010a04]/10 sm:h-7 sm:w-36" />
                    <div className="h-6 w-28 animate-skeleton-soft rounded-full bg-[#010a04]/8 sm:h-7" />
                  </div>
                  <ScoreRowsSkeleton />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 h-[44px] w-full animate-skeleton-soft rounded-[10px] bg-[#010a04]/10 sm:mt-6" />
        </section>
      </div>
    </div>
  );
}
