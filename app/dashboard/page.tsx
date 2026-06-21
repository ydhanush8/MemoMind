'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Note } from '@/app/lib/types';
import NoteCard from '@/app/components/NoteCard';
import PaywallModal from '@/app/components/PaywallModal';
import { DynamicUserButton } from '@/app/components/DynamicUserButton';
import { toast } from 'react-hot-toast';
import { Zap, Plus, FileText } from 'lucide-react';
import { useSubscription } from '@/app/hooks/useSubscription';
import { useNotes, useDeleteNote } from '@/app/hooks/useNotes';
import { usePracticeStatus } from '@/app/hooks/usePractice';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { cn } from '@/app/lib/utils';

export default function DashboardPage() {
  const [showPaywall, setShowPaywall] = useState(false);

  const { data: notes = [], isLoading: notesLoading } = useNotes();
  const { data: practiceStatus } = usePracticeStatus();
  const { data: subscription } = useSubscription();
  const deleteNote = useDeleteNote();

  const isPremium = subscription?.isPremium ?? false;
  const isLoading = notesLoading;

  const handleDelete = async (id: string) => {
    try {
      await deleteNote.mutateAsync(id);
      toast.success('Note deleted successfully');
    } catch {
      toast.error('Failed to delete note');
    }
  };

  const notesNeedingReview = practiceStatus?.notesNeedingReview ?? 0;
  const practiceCompleted = practiceStatus?.completed ?? false;

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground tracking-tight">MemoMind</span>
            {isPremium && (
              <Badge variant="default" className="gap-1 px-1.5 py-0.5 text-xs">
                <Zap className="h-3 w-3" />
                Pro
              </Badge>
            )}
          </div>
          <DynamicUserButton
            appearance={{
              elements: { avatarBox: 'w-8 h-8' },
            }}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Page title row */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">My Notes</h1>
          {!isLoading && (
            <span className="text-sm text-muted-foreground">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </span>
          )}
        </div>

        {/* Action bar */}
        <div className="flex gap-2 justify-between items-center mt-4 mb-8">
          {/* Left: practice status notice */}
          <div>
            {notesNeedingReview > 0 && !practiceCompleted && (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-sm text-amber-400">
                  {notesNeedingReview} {notesNeedingReview === 1 ? 'note needs' : 'notes need'} review
                </span>
              </div>
            )}
          </div>

          {/* Right: buttons */}
          <div className="flex items-center gap-2">
            {isPremium && practiceStatus && (
              <Link href="/dashboard/practice">
                <Button variant="secondary" size="sm" className="relative gap-2">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Daily Practice
                  <span
                    className={cn(
                      'absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white',
                      practiceCompleted ? 'bg-emerald-500' : 'bg-amber-500'
                    )}
                  >
                    {practiceCompleted ? '✓' : String(notesNeedingReview)}
                  </span>
                </Button>
              </Link>
            )}

            <Link href="/dashboard/new">
              <Button variant="default" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New Note
              </Button>
            </Link>

            {!isPremium && (
              <Link href="/pricing">
                <Button variant="outline" size="sm" className="gap-2">
                  <Zap className="h-4 w-4" />
                  Upgrade
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-secondary animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && notes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="mb-4 rounded-full bg-secondary p-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No notes yet</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              Start capturing what you learn. Add your first note to begin tracking your understanding.
            </p>
            <Link href="/dashboard/new">
              <Button className="mt-6">Create your first note</Button>
            </Link>
          </div>
        )}

        {/* Notes grid */}
        {!isLoading && notes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {(notes as Note[]).map((note) => (
              <NoteCard key={note._id} note={note} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  );
}
