'use client';

import { useQuery } from '@tanstack/react-query';
import type { Note, PracticeStatus } from '@/app/lib/types';
import { useSubscription } from './useSubscription';
import { apiFetch } from '@/app/lib/api';

async function fetchPracticeNotes(): Promise<Note[]> {
  const res = await apiFetch('/api/practice/daily');
  if (!res.ok) throw new Error('Failed to fetch practice notes');
  return res.json();
}

async function fetchPracticeStatus(): Promise<PracticeStatus> {
  const res = await apiFetch('/api/practice/status');
  if (!res.ok) throw new Error('Failed to fetch practice status');
  return res.json();
}

export function usePracticeNotes() {
  const { data: subscription } = useSubscription();
  return useQuery<Note[]>({
    queryKey: ['practiceNotes'],
    queryFn: fetchPracticeNotes,
    staleTime: 0, // always re-fetch on mount so completed sessions show "all caught up"
    enabled: subscription?.isPremium === true,
  });
}

export function usePracticeStatus() {
  const { data: subscription } = useSubscription();
  return useQuery<PracticeStatus>({
    queryKey: ['practiceStatus'],
    queryFn: fetchPracticeStatus,
    staleTime: 60 * 1000,
    enabled: subscription?.isPremium === true, // skip for free users
  });
}
