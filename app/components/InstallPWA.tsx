'use client';

import { useEffect, useState } from 'react';
import { Smartphone, X } from 'lucide-react';

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
    <div className="fixed bottom-28 sm:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-xl z-50 animate-fadeIn">
      <button
        onClick={handleLater}
        className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
          <Smartphone className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-white text-sm font-semibold">Install MemoMind</p>
          <p className="text-slate-400 text-xs mt-0.5">Add to home screen for quick access</p>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleInstallClick}
          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Install
        </button>
        <button
          onClick={handleLater}
          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Later
        </button>
      </div>
    </div>
  );
}
