'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import type { Note, AnalysisResponse } from '@/app/lib/types';
import { apiFetch } from '@/app/lib/api';

async function fetchNotes(): Promise<Note[]> {
  const res = await apiFetch('/api/notes');
  if (!res.ok) throw new Error('Failed to fetch notes');
  return res.json();
}

export function useNotes() {
  const { isSignedIn } = useAuth();
  return useQuery<Note[]>({
    queryKey: ['notes'],
    queryFn: fetchNotes,
    enabled: isSignedIn === true,
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      const res = await apiFetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete note');
      return noteId;
    },
    onSuccess: (noteId) => {
      queryClient.setQueryData<Note[]>(['notes'], (old) =>
        (old ?? []).filter((n) => n._id !== noteId),
      );
      queryClient.invalidateQueries({ queryKey: ['practiceStatus'] });
    },
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      understanding: string;
      analysis?: AnalysisResponse;
    }): Promise<Note> => {
      const res = await apiFetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to create note' }));
        throw new Error(err.error || 'Failed to create note');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useAnalyzeNote() {
  return useMutation({
    mutationFn: async (data: {
      title: string;
      understanding: string;
    }): Promise<AnalysisResponse> => {
      const res = await apiFetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Analysis failed' }));
        throw new Error(err.error || 'Analysis failed');
      }
      return res.json();
    },
  });
}

export function useMarkReviewed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      const res = await apiFetch(`/api/notes/${noteId}`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to update review');
      return res.json() as Promise<Note>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practiceStatus'] });
    },
  });
}
