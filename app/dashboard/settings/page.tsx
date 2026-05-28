'use client';

import React from 'react';
import Link from 'next/link';
import { useUser, UserButton } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import { useSubscription } from '@/app/hooks/useSubscription';
import {
  useNotificationStatus,
  useUpdateNotificationPreferences,
  useDeleteNotificationSubscription,
} from '@/app/hooks/useNotifications';

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
          title: '🔔 Test Notification',
          body: 'This is a test notification from MemoMind! 🎉',
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
          <UserButton />
        </div>

        <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Account info */}
          {user && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Account
              </h2>
              <p className="text-slate-400 text-sm">
                {user.primaryEmailAddress?.emailAddress ?? 'No email'}
              </p>
            </div>
          )}

          {/* Subscription */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Account Tier
            </h2>
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isPremium ? 'bg-purple-600' : 'bg-slate-700'}`}>
                  ⭐
                </div>
                <div>
                  <p className="text-white font-bold">{isPremium ? 'Premium Plan' : 'Free Plan'}</p>
                  <p className="text-slate-400 text-sm">
                    {isPremium
                      ? subscription?.currentPeriodEnd
                        ? `Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                        : 'Active'
                      : 'Basic note tracking'}
                  </p>
                </div>
              </div>
              {!isPremium && (
                <Link
                  href="/pricing"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold px-4 py-2 rounded-lg"
                >
                  UPGRADE
                </Link>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Push Notifications
            </h2>

            {!isPremium ? (
              <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
                <p className="text-blue-200 text-sm">
                  ⭐ Notifications are a premium feature. Upgrade to enable daily reminders.
                </p>
                <Link href="/pricing" className="mt-3 inline-block text-blue-400 hover:text-blue-300 text-sm font-semibold">
                  View Pricing →
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Notification Status</p>
                    <p className="text-slate-400 text-sm">
                      {isSubscribed ? 'Notifications are enabled' : 'Notifications are currently disabled'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${isSubscribed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {isSubscribed ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                {isSubscribed && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Preferred Reminder Time
                      </label>
                      <input
                        type="time"
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        className="w-full max-w-xs bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="mt-2 text-xs text-slate-500">
                        Your daily reminder will arrive around this time.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleSave}
                        disabled={updatePrefs.isPending}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
                      >
                        {updatePrefs.isPending ? 'Saving…' : 'Save Preferences'}
                      </button>
                      <button
                        onClick={sendTestNotification}
                        className="border border-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
                      >
                        Send Test Notification
                      </button>
                      <button
                        onClick={handleUnsubscribe}
                        disabled={deleteNotifSub.isPending}
                        className="border border-red-500/50 hover:bg-red-900/20 text-red-400 font-semibold py-2 px-6 rounded-lg transition-all"
                      >
                        {deleteNotifSub.isPending ? 'Disabling…' : 'Disable Notifications'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
