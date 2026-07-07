'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Bell } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useSubscription } from '@/app/hooks/useSubscription';
import { enableThisDevice, enableErrorMessage, getThisDeviceSubscription } from '@/app/lib/push';

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

export default function NotificationPermission() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { data: subscription } = useSubscription();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);

  const isPremium = subscription?.isPremium ?? false;

  useEffect(() => {
    if (!user || !isPremium || isDismissed()) {
      setShowPrompt(false);
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    // Only prompt if THIS device isn't already subscribed (a second device
    // should still be offered notifications even when another one is on).
    getThisDeviceSubscription().then((sub) => {
      if (cancelled || sub) return;
      timer = setTimeout(() => {
        if (!isDismissed()) setShowPrompt(true);
      }, 5000);
    });

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [user, isPremium]);

  const handleDismiss = () => {
    dismissFor7Days();
    setShowPrompt(false);
  };

  const requestPermission = async () => {
    if (isEnabling) return;
    setIsEnabling(true);

    const result = await enableThisDevice();
    if (result.ok) {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notifications enabled on this device');
      handleDismiss();
    } else if (result.reason === 'sw-timeout') {
      // Transient — let the prompt reappear rather than dismissing for 7 days
      toast.error(enableErrorMessage(result.reason));
      setShowPrompt(false);
    } else {
      toast.error(enableErrorMessage(result.reason));
      handleDismiss();
    }

    setIsEnabling(false);
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
