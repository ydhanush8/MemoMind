export default function PracticeLoading() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 rounded bg-secondary/70 animate-pulse" />
        <div className="h-4 w-24 rounded bg-secondary/70 animate-pulse" />
      </div>
      <div className="mt-8 space-y-6">
        <div className="h-2 w-full rounded-full bg-secondary animate-pulse" />
        <div className="h-[460px] w-full rounded-3xl bg-secondary animate-pulse" />
      </div>
    </div>
  );
}
