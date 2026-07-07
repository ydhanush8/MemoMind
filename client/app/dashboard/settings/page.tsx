'use client';

import React from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { User, Zap, Bell, Info, Crown, Loader2 } from 'lucide-react';
import { useSubscription } from '@/app/hooks/useSubscription';
import {
  useNotificationStatus,
  useUpdateNotificationPreferences,
} from '@/app/hooks/useNotifications';
import {
  getThisDeviceSubscription,
  enableThisDevice,
  disableThisDevice,
  enableErrorMessage,
  pushEnvironment,
  type PushEnv,
} from '@/app/lib/push';
import { cn } from '@/app/lib/utils';
import { apiFetch } from '@/app/lib/api';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Separator } from '@/app/components/ui/separator';
import { Label } from '@/app/components/ui/label';

function SettingsSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card overflow-hidden shadow-elevation-1">
      <div className="px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <Icon className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground tracking-tight">{title}</h2>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { data: subscription, isLoading: subLoading } = useSubscription();
  const { data: notifStatus, isLoading: notifLoading } = useNotificationStatus();
  const updatePrefs = useUpdateNotificationPreferences();

  const [preferredTime, setPreferredTime] = React.useState('19:00');
  // null = still checking this device's push subscription
  const [deviceEnabled, setDeviceEnabled] = React.useState<boolean | null>(null);
  const [pushEnv, setPushEnv] = React.useState<PushEnv>('ready');
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (notifStatus?.preferredTime) {
      setPreferredTime(notifStatus.preferredTime);
    }
  }, [notifStatus?.preferredTime]);

  React.useEffect(() => {
    setPushEnv(pushEnvironment());
    getThisDeviceSubscription().then((sub) => setDeviceEnabled(!!sub));
  }, []);

  const isPremium = subscription?.isPremium ?? false;
  const isLoading = subLoading || notifLoading;

  const handleEnableDevice = async () => {
    setBusy(true);
    const result = await enableThisDevice();
    if (result.ok) {
      setDeviceEnabled(true);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notifications enabled on this device');
    } else {
      toast.error(enableErrorMessage(result.reason));
    }
    setBusy(false);
  };

  const handleDisableDevice = async () => {
    setBusy(true);
    await disableThisDevice();
    setDeviceEnabled(false);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    toast.success('Notifications turned off on this device');
    setBusy(false);
  };

  const handleSave = async () => {
    try {
      await updatePrefs.mutateAsync({ preferredTime });
      toast.success('Preferences saved!');
    } catch {
      toast.error('Failed to save preferences');
    }
  };

  const sendTestNotification = async () => {
    try {
      const res = await apiFetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'MemoMind Reminder',
          body: 'Test notification from MemoMind - it works.',
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
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Settings</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Manage your account, plan, and reminders.
      </p>

      <div className="mt-8 space-y-5">
        <SettingsSection icon={User} title="Account">
          <p className="text-sm text-muted-foreground">
            {user?.primaryEmailAddress?.emailAddress ?? 'No email'}
          </p>
        </SettingsSection>

        <SettingsSection icon={Zap} title="Subscription">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  'rounded-xl p-2.5 shrink-0',
                  isPremium ? 'bg-primary/12 text-primary' : 'bg-secondary text-muted-foreground',
                )}
              >
                {isPremium ? <Crown className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {isPremium ? 'Premium Plan' : 'Free Plan'}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {isPremium
                    ? subscription?.currentPeriodEnd
                      ? `Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                      : 'Active subscription'
                    : 'Basic note tracking'}
                </p>
              </div>
            </div>
            {!isPremium ? (
              <Link href="/pricing" className="shrink-0">
                <Button size="sm">Upgrade</Button>
              </Link>
            ) : (
              <Badge variant="success" className="shrink-0 whitespace-nowrap">
                Active
              </Badge>
            )}
          </div>
        </SettingsSection>

        <SettingsSection icon={Bell} title="Notifications">
          {!isPremium ? (
            <div className="bg-primary/[0.06] border border-primary/20 rounded-2xl p-4 flex gap-3">
              <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="text-sm text-muted-foreground">
                Push notifications are a Pro feature.{' '}
                <Link href="/pricing" className="text-primary hover:underline font-semibold">
                  Upgrade to Pro
                </Link>{' '}
                to enable daily reminders.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-sm font-medium text-foreground">This device</span>
                  {deviceEnabled === false && notifStatus?.subscribed && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Notifications are on for another device. Enable here to receive them on this
                      one too.
                    </p>
                  )}
                </div>
                <Badge
                  variant={deviceEnabled ? 'success' : 'secondary'}
                  className="shrink-0 whitespace-nowrap"
                >
                  {deviceEnabled === null ? 'Checking…' : deviceEnabled ? 'Enabled' : 'Not enabled'}
                </Badge>
              </div>

              {deviceEnabled === false &&
                (pushEnv === 'ios-needs-install' ? (
                  <div className="bg-secondary/60 border border-border/40 rounded-2xl p-4 text-sm text-muted-foreground leading-relaxed">
                    To get notifications on iPhone, add MemoMind to your Home Screen first: tap the{' '}
                    <span className="font-semibold text-foreground">Share</span> icon →{' '}
                    <span className="font-semibold text-foreground">Add to Home Screen</span>, then
                    open MemoMind from there and enable notifications.
                  </div>
                ) : pushEnv === 'unsupported' ? (
                  <div className="bg-secondary/60 border border-border/40 rounded-2xl p-4 text-sm text-muted-foreground leading-relaxed">
                    This browser doesn&apos;t support push notifications. Try Chrome, Edge, or
                    install MemoMind to your device.
                  </div>
                ) : (
                  <Button size="sm" onClick={handleEnableDevice} disabled={busy}>
                    {busy ? 'Enabling…' : 'Enable on this device'}
                  </Button>
                ))}

              {deviceEnabled && (
                <>
                  <Separator />

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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPreferredTime(e.target.value)
                      }
                      className="max-w-xs opacity-50 cursor-not-allowed"
                      disabled
                      title="Per-user reminder time is coming soon"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSave}
                      disabled
                      title="Reminder time settings coming soon"
                    >
                      Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={sendTestNotification}>
                      Test notification
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDisableDevice}
                      disabled={busy}
                    >
                      {busy ? 'Turning off…' : 'Turn off on this device'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </SettingsSection>
      </div>
    </div>
  );
}
