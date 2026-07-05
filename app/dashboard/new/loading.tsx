export default function NewNoteLoading() {
  return (
    <>
      <div className="h-4 w-28 rounded bg-secondary/70 animate-pulse" />
      <div className="mt-5 space-y-2">
        <div className="h-8 w-48 rounded-lg bg-secondary animate-pulse" />
        <div className="h-4 w-72 max-w-full rounded bg-secondary/70 animate-pulse" />
      </div>
      <div className="mt-7 max-w-2xl rounded-3xl border border-border/60 bg-card p-6 sm:p-8 shadow-elevation-1 space-y-6">
        <div className="h-11 w-full rounded-lg bg-secondary animate-pulse" />
        <div className="h-52 w-full rounded-lg bg-secondary animate-pulse" />
        <div className="flex gap-3">
          <div className="h-12 flex-1 rounded-xl bg-secondary animate-pulse" />
          <div className="h-12 flex-1 rounded-xl bg-secondary animate-pulse" />
        </div>
      </div>
    </>
  );
}
