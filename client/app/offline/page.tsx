'use client';

import { WifiOff, RotateCcw } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="rounded-2xl bg-secondary p-5 w-fit mx-auto mb-6">
          <WifiOff className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-extrabold text-foreground mb-2 tracking-tight">
          You&apos;re offline
        </h1>
        <p className="text-sm text-muted-foreground mb-6">Check your connection and try again.</p>
        <Button variant="outline" onClick={() => window.location.reload()} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}
