'use client';

import { useEffect, useState } from 'react';

const DISMISSED_KEY = 'memoMind_install_dismissed_until';
const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

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
    // Offset above NotificationPermission (bottom-28 on mobile so they don't overlap)
    <div className="fixed bottom-28 sm:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-slate-800 border border-blue-500 rounded-lg p-4 shadow-lg z-50 animate-fadeIn">
      <button
        onClick={handleLater}
        className="absolute top-2 right-2 text-slate-400 hover:text-white"
        aria-label="Dismiss"
      >
        ✕
      </button>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-1">📱 Install MemoMind</h3>
          <p className="text-slate-300 text-sm">Add to your home screen for quick access!</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleInstallClick}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
        >
          Install
        </button>
        <button
          onClick={handleLater}
          className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
        >
          Later
        </button>
      </div>
    </div>
  );
}
