'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import { Bell } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
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
  const [isEnabling, setIsEnabling] = useState(false);

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
    if (isEnabling) return;
    setIsEnabling(true);

    try {
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

      let registration: ServiceWorkerRegistration;
      let swTimeoutId: ReturnType<typeof setTimeout>;
      try {
        registration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<never>((_, reject) => {
            swTimeoutId = setTimeout(() => reject(new Error('SW_TIMEOUT')), 8000);
          }),
        ]);
        clearTimeout(swTimeoutId!);
      } catch {
        const isDev = process.env.NODE_ENV === 'development';
        toast.error(
          isDev
            ? 'Run `next build && next start` to test push notifications locally.'
            : 'Notifications unavailable. Try refreshing the page.',
        );
        // Don't call handleDismiss() here — SW timeout is transient; let the prompt reappear
        setShowPrompt(false);
        return;
      }

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

      // Welcome notification — fire-and-forget, failure does not affect subscription
      registration
        .showNotification('MemoMind Notifications Enabled!', {
          body: "You'll receive daily practice reminders from now on.",
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
        })
        .catch(() => {
          /* silent — subscription already saved */
        });
    } catch {
      toast.error('Failed to enable notifications. Please try again.');
    } finally {
      setIsEnabling(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 lg:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-xs rounded-2xl border border-border/60 bg-card shadow-elevation-3 p-4 z-50 animate-fade-in-up">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-primary/12 p-2 w-10 h-10 flex items-center justify-center flex-shrink-0">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Daily Reminders</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Get notified when it&apos;s time to practice
          </p>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <Button
          variant="default"
          size="sm"
          onClick={requestPermission}
          disabled={isEnabling}
          className="flex-1"
        >
          {isEnabling ? 'Enabling…' : 'Enable'}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDismiss}>
          Later
        </Button>
      </div>
    </div>
  );
}
