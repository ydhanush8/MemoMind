'use client';

import { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

const DISMISSED_KEY = 'memoMind_install_dismissed_until';
const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;

function isDismissed(): boolean {
  try {
    const until = localStorage.getItem(DISMISSED_KEY);
    return until ? Date.now() < parseInt(until, 10) : false;
  } catch {
    return false;
  }
}

function dismiss() {
  try {
    localStorage.setItem(DISMISSED_KEY, String(Date.now() + COOLDOWN_MS));
  } catch {}
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    if (isDismissed()) return;
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleLater = () => {
    dismiss();
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-24 lg:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-xs rounded-2xl border border-border/60 bg-card shadow-elevation-3 p-4 z-50 animate-fade-in-up">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-primary/12 p-2 w-10 h-10 flex items-center justify-center flex-shrink-0">
          <Smartphone className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Install MemoMind</p>
          <p className="text-xs text-muted-foreground mt-0.5">Add to your home screen</p>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <Button variant="default" size="sm" onClick={handleInstallClick} className="flex-1">
          Install
        </Button>
        <Button variant="ghost" size="sm" onClick={handleLater}>
          Later
        </Button>
      </div>
    </div>
  );
}
