'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Note } from '@/app/lib/types';
import NoteCard from '@/app/components/NoteCard';
import PaywallModal from '@/app/components/PaywallModal';
import { toast } from 'react-hot-toast';
import { Plus, FileText, Sparkles } from 'lucide-react';
import { useSubscription } from '@/app/hooks/useSubscription';
import { useNotes, useDeleteNote } from '@/app/hooks/useNotes';
import { usePracticeStatus } from '@/app/hooks/usePractice';
import { Button } from '@/app/components/ui/button';

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
    <>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">My Notes</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {isLoading
              ? 'Loading your library…'
              : `${notes.length} ${notes.length === 1 ? 'note' : 'notes'} in your library`}
          </p>
        </div>

        <Link href="/dashboard/new" className="shrink-0">
          <Button size="lg" className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            New note
          </Button>
        </Link>
      </div>

      {isPremium && practiceStatus && notesNeedingReview > 0 && !practiceCompleted && (
        <Link
          href="/dashboard/practice"
          className="mt-6 flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/[0.06] px-5 py-4 transition-colors hover:bg-primary/10"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 text-primary shrink-0">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {notesNeedingReview} {notesNeedingReview === 1 ? 'note is' : 'notes are'} ready to
              review
            </p>
            <p className="text-xs text-muted-foreground">
              Keep your streak going with today&apos;s practice.
            </p>
          </div>
          <span className="text-sm font-semibold text-primary shrink-0">Practice →</span>
        </Link>
      )}

      {isLoading && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-40 rounded-2xl bg-secondary animate-pulse"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      )}

      {!isLoading && notes.length === 0 && (
        <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/40 py-24 text-center px-6">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
            <FileText className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Your library is empty</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground text-pretty">
            Capture what you learned today. Write it in your own words and let it compound into
            lasting knowledge.
          </p>
          <Link href="/dashboard/new">
            <Button className="mt-6 gap-2">
              <Plus className="h-4 w-4" />
              Create your first note
            </Button>
          </Link>
        </div>
      )}

      {!isLoading && notes.length > 0 && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {(notes as Note[]).map((note) => (
            <NoteCard key={note._id} note={note} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </>
  );
}
