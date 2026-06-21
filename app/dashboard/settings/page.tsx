'use client';

import React from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { DynamicUserButton } from '@/app/components/DynamicUserButton';
import { toast } from 'react-hot-toast';
import { ArrowLeft, User, Zap, Bell, Info } from 'lucide-react';
import { useSubscription } from '@/app/hooks/useSubscription';
import {
  useNotificationStatus,
  useUpdateNotificationPreferences,
  useDeleteNotificationSubscription,
} from '@/app/hooks/useNotifications';
import { cn } from '@/app/lib/utils';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Separator } from '@/app/components/ui/separator';
import { Label } from '@/app/components/ui/label';

export default function SettingsPage() {
  const { user } = useUser();
  const { data: subscription, isLoading: subLoading } = useSubscription();
  const { data: notifStatus, isLoading: notifLoading } = useNotificationStatus();
  const updatePrefs = useUpdateNotificationPreferences();
  const deleteNotifSub = useDeleteNotificationSubscription();

  const [preferredTime, setPreferredTime] = React.useState('19:00');

  // Sync local state with server value once loaded
  React.useEffect(() => {
    if (notifStatus?.preferredTime) {
      setPreferredTime(notifStatus.preferredTime);
    }
  }, [notifStatus?.preferredTime]);

  const isPremium = subscription?.isPremium ?? false;
  const isSubscribed = notifStatus?.subscribed ?? false;
  const isLoading = subLoading || notifLoading;

  const handleSave = async () => {
    try {
      await updatePrefs.mutateAsync({ preferredTime });
      toast.success('Preferences saved!');
    } catch {
      toast.error('Failed to save preferences');
    }
  };

  const handleUnsubscribe = async () => {
    try {
      await deleteNotifSub.mutateAsync();
      toast.success('Notifications disabled');
    } catch {
      toast.error('Failed to disable notifications');
    }
  };

  const sendTestNotification = async () => {
    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'MemoMind Reminder',
          body: 'Test notification from MemoMind — it works.',
          url: '/dashboard',
        }),
      });

      if (res.ok) {
        toast.success('Test notification sent!');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to send test');
      }
    } catch {
      toast.error('Failed to send test notification');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur">
        <div className="px-4 h-14 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <span className="text-sm font-medium text-foreground">Settings</span>
          <DynamicUserButton />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Account section */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Account</h2>
            </div>
          </div>
          <div className="p-6">
            <p className="text-sm text-muted-foreground">
              {user?.primaryEmailAddress?.emailAddress ?? 'No email'}
            </p>
          </div>
        </div>

        {/* Subscription section */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Subscription</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'rounded-lg p-2',
                    isPremium
                      ? 'bg-primary/10 text-primary'
                      : 'bg-zinc-800 text-zinc-400'
                  )}
                >
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {isPremium ? 'Premium Plan' : 'Free Plan'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isPremium
                      ? subscription?.currentPeriodEnd
                        ? `Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                        : 'Active'
                      : 'Basic note tracking'}
                  </p>
                </div>
              </div>
              {!isPremium ? (
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-8 px-3 text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                  Upgrade
                </Link>
              ) : (
                <Badge variant="success">
                  {subscription?.currentPeriodEnd
                    ? `Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                    : 'Active'}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Notifications section */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
            </div>
          </div>
          <div className="p-6">
            {!isPremium ? (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3">
                <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="text-sm text-muted-foreground">
                  Push notifications are a Pro feature.{' '}
                  <Link href="/pricing" className="text-primary hover:underline font-medium">
                    Upgrade to Pro
                  </Link>
                  {' '}to enable daily reminders.
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Status row */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Status</span>
                  <Badge variant={isSubscribed ? 'success' : 'secondary'}>
                    {isSubscribed ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>

                {isSubscribed && (
                  <>
                    <Separator />

                    {/* Time input row */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="shrink-0">
                        <Label htmlFor="reminder-time" className="text-sm text-foreground">
                          Reminder time
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Currently sent at 9:00 AM IST daily
                        </p>
                      </div>
                      <Input
                        id="reminder-time"
                        type="time"
                        value={preferredTime}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPreferredTime(e.target.value)}
                        className="max-w-xs opacity-50 cursor-not-allowed"
                        disabled
                        title="Per-user reminder time is coming soon"
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleSave}
                        disabled
                        title="Reminder time settings coming soon"
                      >
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={sendTestNotification}
                      >
                        Test notification
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleUnsubscribe}
                        disabled={deleteNotifSub.isPending}
                      >
                        {deleteNotifSub.isPending ? 'Disabling…' : 'Disable'}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
