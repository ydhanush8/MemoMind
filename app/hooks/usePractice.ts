'use client';

import { useQuery } from '@tanstack/react-query';
import type { Note, PracticeStatus } from '@/app/lib/types';
import { useSubscription } from './useSubscription';

async function fetchPracticeNotes(): Promise<Note[]> {
  const res = await fetch('/api/practice/daily');
  if (!res.ok) throw new Error('Failed to fetch practice notes');
  return res.json();
}

async function fetchPracticeStatus(): Promise<PracticeStatus> {
  const res = await fetch('/api/practice/status');
  if (!res.ok) throw new Error('Failed to fetch practice status');
  return res.json();
}

export function usePracticeNotes() {
  const { data: subscription } = useSubscription();
  return useQuery<Note[]>({
    queryKey: ['practiceNotes'],
    queryFn: fetchPracticeNotes,
    staleTime: 5 * 60 * 1000,
    enabled: subscription?.isPremium === true, // skip for free users
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
