'use client';

import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export default function LoadError({ what, onRetry }: { what: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/40 py-20 text-center px-6"
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
        <AlertTriangle className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-bold text-foreground">Couldn&apos;t load {what}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground text-pretty">
        The server didn&apos;t respond. Your data is safe — try again in a moment.
      </p>
      <Button variant="outline" className="mt-6 gap-2" onClick={onRetry}>
        <RotateCw className="h-4 w-4" />
        Retry
      </Button>
    </div>
  );
}
