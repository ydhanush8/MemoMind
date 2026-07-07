export default function SettingsLoading() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-2">
        <div className="h-8 w-32 rounded-lg bg-secondary animate-pulse" />
        <div className="h-4 w-64 max-w-full rounded bg-secondary/70 animate-pulse" />
      </div>
      <div className="mt-8 space-y-5">
        <div className="h-24 rounded-3xl bg-secondary animate-pulse" />
        <div
          className="h-28 rounded-3xl bg-secondary animate-pulse"
          style={{ animationDelay: '60ms' }}
        />
        <div
          className="h-32 rounded-3xl bg-secondary animate-pulse"
          style={{ animationDelay: '120ms' }}
        />
      </div>
    </div>
  );
}
