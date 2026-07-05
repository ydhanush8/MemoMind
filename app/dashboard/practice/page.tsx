'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PracticeCard from '@/app/components/PracticeCard';
import { usePracticeNotes } from '@/app/hooks/usePractice';
import { useMarkReviewed } from '@/app/hooks/useNotes';
import { useSubscription } from '@/app/hooks/useSubscription';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';

export default function PracticePage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewedNoteIds, setReviewedNoteIds] = useState<Set<string>>(new Set());

  const { data: subscription, isLoading: subLoading } = useSubscription();
  const { data: notes = [], isLoading: notesLoading } = usePracticeNotes();
  const markReviewed = useMarkReviewed();

  const isLoading = subLoading || notesLoading;

  React.useEffect(() => {
    if (!subLoading && subscription && !subscription.isPremium) {
      router.replace('/dashboard');
    }
  }, [subscription, subLoading, router]);

  const handleReviewed = async (noteId: string) => {
    if (reviewedNoteIds.has(noteId)) return;
    // Optimistically add to set before the API call so rapid re-flips can't fire twice
    setReviewedNoteIds((prev) => new Set([...prev, noteId]));
    try {
      await markReviewed.mutateAsync(noteId);
      toast.success('Note reviewed');
    } catch {
      setReviewedNoteIds((prev) => {
        const next = new Set(prev);
        next.delete(noteId);
        return next;
      });
      toast.error('Failed to update review status');
    }
  };

  const handleNext = () => {
    if (currentIndex < notes.length - 1) setCurrentIndex((i) => i + 1);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  // Progress = how many unique notes have been reviewed (not card position)
  const reviewedCount = reviewedNoteIds.size;
  const progressPercent = notes.length > 0 ? (reviewedCount / notes.length) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to notes
        </Link>
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
          Daily Practice
        </span>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      )}

      {!isLoading && notes.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <div className="bg-card border border-border/60 rounded-3xl p-12 max-w-sm w-full text-center shadow-elevation-1">
            <div className="inline-flex items-center justify-center rounded-2xl bg-emerald-500/12 p-4 text-emerald-500 mb-5 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">All caught up!</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Come back tomorrow for more practice.
            </p>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      )}

      {!isLoading && notes.length > 0 && (
        <div className="mt-8 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-sm font-semibold text-foreground tabular-nums">
                Card {currentIndex + 1} of {notes.length}
              </span>
              <span className="text-sm text-muted-foreground tabular-nums">
                {reviewedCount} reviewed
              </span>
            </div>
            <Progress value={progressPercent} />
          </div>

          <PracticeCard
            key={`${notes[currentIndex]._id}-${currentIndex}`}
            note={notes[currentIndex]}
            onReviewed={handleReviewed}
          />

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            {currentIndex === notes.length - 1 ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-sm font-semibold transition-colors shadow-elevation-1"
              >
                <CheckCircle2 className="w-4 h-4" />
                Complete Practice
              </Link>
            ) : (
              <Button onClick={handleNext} className="gap-1.5">
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
