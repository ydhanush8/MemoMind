export default function DashboardLoading() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded-lg bg-secondary animate-pulse" />
          <div className="h-4 w-52 rounded bg-secondary/70 animate-pulse" />
        </div>
        <div className="h-11 w-32 rounded-xl bg-secondary animate-pulse" />
      </div>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-40 rounded-2xl bg-secondary animate-pulse"
            style={{ animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>
    </>
  );
}
