'use client';

import { useQuery } from '@tanstack/react-query';
import type { SubscriptionStatus } from '@/app/lib/types';

async function fetchSubscription(): Promise<SubscriptionStatus> {
  const res = await fetch('/api/subscription/status');
  if (!res.ok) throw new Error('Failed to fetch subscription status');
  return res.json();
}

export function useSubscription() {
  return useQuery<SubscriptionStatus>({
    queryKey: ['subscription'],
    queryFn: fetchSubscription,
    staleTime: 5 * 60 * 1000, // subscription status doesn't change often
  });
}
