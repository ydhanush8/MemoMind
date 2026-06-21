export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 h-14 border-b border-border/50 bg-background" />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="h-8 w-40 rounded-lg bg-secondary animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-xl bg-secondary animate-pulse"
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
