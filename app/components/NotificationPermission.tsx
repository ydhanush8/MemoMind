'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
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
        body: "We'll remind you about your daily practice 🎉",
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
      });
    } catch {
      toast.error('Failed to enable notifications. Please try again.');
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-slate-800 border border-blue-500 rounded-lg p-4 shadow-lg z-50 animate-fadeIn">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-slate-400 hover:text-white"
        aria-label="Dismiss"
      >
        ✕
      </button>

      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-1">🔔 Enable Daily Reminders</h3>
          <p className="text-slate-300 text-sm">
            Get notified when it&apos;s time to practice. Never break your streak!
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={requestPermission}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
        >
          Enable
        </button>
        <button
          onClick={handleDismiss}
          className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
        >
          Later
        </button>
      </div>
    </div>
  );
}
