'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DynamicUserButton } from '@/app/components/DynamicUserButton';
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PracticeCard from '@/app/components/PracticeCard';
import { trackPracticeStarted } from '@/app/lib/analytics';
import { usePracticeNotes } from '@/app/hooks/usePractice';
import { useMarkReviewed } from '@/app/hooks/useNotes';
import { useSubscription } from '@/app/hooks/useSubscription';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { cn } from '@/app/lib/utils';

export default function PracticePage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewedNoteIds, setReviewedNoteIds] = useState<Set<string>>(new Set());

  const { data: subscription, isLoading: subLoading } = useSubscription();
  const { data: notes = [], isLoading: notesLoading } = usePracticeNotes();
  const markReviewed = useMarkReviewed();

  const isLoading = subLoading || notesLoading;

  // Redirect free users who navigate directly to this URL
  React.useEffect(() => {
    if (!subLoading && subscription && !subscription.isPremium) {
      router.replace('/dashboard');
    }
  }, [subscription, subLoading, router]);

  // Track start when notes load for the first time
  React.useEffect(() => {
    if (notes.length > 0) {
      trackPracticeStarted(notes[0]._id);
    }
  }, [notes.length]);

  const handleReviewed = async (noteId: string) => {
    if (reviewedNoteIds.has(noteId)) return;
    // Optimistically add to set before the API call so rapid re-flips can't fire twice
    setReviewedNoteIds((prev) => new Set([...prev, noteId]));
    try {
      await markReviewed.mutateAsync(noteId);
      toast.success('Note reviewed');
    } catch {
      // Roll back on failure
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
    <div className="min-h-screen bg-background">
      {/* Sticky top nav */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur">
        <div className="px-4 h-14 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>

          <span className="text-sm font-medium text-foreground">Daily Practice</span>

          <DynamicUserButton appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {/* Empty / completed state */}
        {!isLoading && notes.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="bg-card border border-border/50 rounded-xl p-12 max-w-sm w-full text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-emerald-500/10 p-4 text-emerald-400 mb-4 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">All caught up!</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Come back tomorrow for more practice.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Active practice */}
        {!isLoading && notes.length > 0 && (
          <div className="space-y-6">
            {/* Progress header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  Card {currentIndex + 1} of {notes.length}
                </span>
                <span className="text-sm text-muted-foreground">{reviewedCount} reviewed</span>
              </div>
              <Progress value={progressPercent} />
            </div>

            {/* Flip card */}
            <PracticeCard
              key={`${notes[currentIndex]._id}-${currentIndex}`}
              note={notes[currentIndex]}
              onReviewed={handleReviewed}
            />

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between gap-3">
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
                  className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-medium transition-colors"
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
      </main>
    </div>
  );
}
