export default function PracticeLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 h-14 border-b border-border/50 bg-background" />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="h-8 w-32 rounded-lg bg-secondary animate-pulse mb-6" />
        <div className="h-48 rounded-xl bg-secondary animate-pulse mb-4" />
        <div className="h-24 rounded-xl bg-secondary animate-pulse" style={{ animationDelay: '50ms' }} />
      </div>
    </div>
  );
}
