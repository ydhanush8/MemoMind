'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import type { SubscriptionStatus } from '@/app/lib/types';

async function fetchSubscription(): Promise<SubscriptionStatus> {
  const res = await fetch('/api/subscription/status');
  if (!res.ok) throw new Error('Failed to fetch subscription status');
  return res.json();
}

export function useSubscription() {
  const { isSignedIn } = useAuth();
  return useQuery<SubscriptionStatus>({
    queryKey: ['subscription'],
    queryFn: fetchSubscription,
    staleTime: 5 * 60 * 1000,
    enabled: isSignedIn === true, // never fires on public pages
  });
}
