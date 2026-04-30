export function ClubsListSkeleton() {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading clubs">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="animate-skeleton-soft rounded-[14px] border border-border bg-white p-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="h-14 w-14 shrink-0 rounded-xl bg-[#edf2ed]" />
            <div className="min-w-0 flex-1 space-y-2 pt-1">
              <div className="h-4 w-3/4 rounded bg-[#edf2ed]" />
              <div className="h-3 w-1/2 rounded bg-[#edf2ed]" />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="h-3 w-full rounded bg-[#edf2ed]" />
            <div className="h-3 w-5/6 rounded bg-[#edf2ed]" />
            <div className="h-3 w-2/3 rounded bg-[#edf2ed]" />
          </div>

          <div className="mt-4 flex gap-2">
            <div className="h-8 flex-1 rounded-lg bg-[#edf2ed]" />
            <div className="h-8 w-20 rounded-lg bg-[#edf2ed]" />
          </div>
        </div>
      ))}
    </div>
  );
}