'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import { Bell, X } from 'lucide-react';
import { useSubscription } from '@/app/hooks/useSubscription';
import { useNotificationStatus } from '@/app/hooks/useNotifications';
import { useQueryClient } from '@tanstack/react-query';

const PROMPT_DISMISSED_KEY = 'memoMind_notification_dismissed_until';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function isDismissed(): boolean {
  try {
    const until = localStorage.getItem(PROMPT_DISMISSED_KEY);
    if (!until) return false;
    return Date.now() < parseInt(until, 10);
  } catch {
    return false;
  }
}

function dismissFor7Days() {
  try {
    localStorage.setItem(PROMPT_DISMISSED_KEY, String(Date.now() + DISMISS_DURATION_MS));
  } catch {
    // localStorage unavailable in some environments — silently ignore
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from(rawData, (c) => c.charCodeAt(0));
}

export default function NotificationPermission() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { data: subscription } = useSubscription();
  const { data: notifStatus } = useNotificationStatus();
  const [showPrompt, setShowPrompt] = useState(false);

  const isPremium = subscription?.isPremium ?? false;
  const alreadySubscribed = notifStatus?.subscribed ?? false;

  useEffect(() => {
    if (!user || !isPremium || alreadySubscribed || isDismissed()) {
      setShowPrompt(false);
      return;
    }

    // Delay prompt by 5 seconds so it doesn't immediately appear
    const timer = setTimeout(() => {
      if (!isDismissed()) setShowPrompt(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [user, isPremium, alreadySubscribed]);

  const handleDismiss = () => {
    dismissFor7Days();
    setShowPrompt(false);
  };

  const requestPermission = async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      toast.error('Push notifications are not supported in this browser');
      handleDismiss();
      return;
    }

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      toast.error('Push notifications are not configured');
      handleDismiss();
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      toast.error('Notification permission denied. You can enable it in browser settings.');
      handleDismiss();
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const pushSub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const res = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pushSub),
      });

      if (!res.ok) throw new Error('Server rejected subscription');

      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      handleDismiss();

      registration.showNotification('MemoMind Notifications Enabled!', {
        body: "You'll receive daily practice reminders from now on.",
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
      });
    } catch {
      toast.error('Failed to enable notifications. Please try again.');
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-xl z-50 animate-fadeIn">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
          <Bell className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-white text-sm font-semibold">Enable Daily Reminders</p>
          <p className="text-slate-400 text-xs mt-0.5">
            Get notified when it&apos;s time to practice.
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={requestPermission}
          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Enable
        </button>
        <button
          onClick={handleDismiss}
          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Later
        </button>
      </div>
    </div>
  );
}
