'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { NotificationStatus } from '@/app/lib/types';

async function fetchNotificationStatus(): Promise<NotificationStatus> {
  const res = await fetch('/api/notifications/subscribe');
  if (!res.ok) throw new Error('Failed to fetch notification status');
  return res.json();
}

export function useNotificationStatus() {
  return useQuery<NotificationStatus>({
    queryKey: ['notifications'],
    queryFn: fetchNotificationStatus,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: { preferredTime?: string; enabled?: boolean }) => {
      const res = await fetch('/api/notifications/subscribe', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to save preferences' }));
        throw new Error(err.error || 'Failed to save preferences');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteNotificationSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notifications/subscribe', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove subscription');
      return res.json();
    },
    onSuccess: () => {
      queryClient.setQueryData<NotificationStatus>(['notifications'], { subscribed: false });
    },
  });
}
