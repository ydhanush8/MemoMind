'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import PracticeCard from '@/app/components/PracticeCard';
import { trackPracticeStarted } from '@/app/lib/analytics';
import { toast } from 'react-hot-toast';
import { usePracticeNotes } from '@/app/hooks/usePractice';
import { useMarkReviewed } from '@/app/hooks/useNotes';
import { useSubscription } from '@/app/hooks/useSubscription';

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
      toast.success('Note reviewed! 🧠');
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
    <div className="min-h-screen bg-slate-900 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
            <UserButton appearance={{ elements: { avatarBox: 'w-8 h-8 sm:w-10 sm:h-10' } }} />
          </div>

          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">Daily Practice</h1>
            <p className="text-sm sm:text-base text-slate-400">Test your memory and reinforce your learning</p>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
          </div>
        )}

        {!isLoading && notes.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-12 max-w-md mx-auto">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">All Caught Up! 🎉</h3>
              <p className="text-slate-400 mb-6">
                You&apos;ve reviewed all your notes today. Come back tomorrow for more practice.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-lg shadow-blue-900/50"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}

        {!isLoading && notes.length > 0 && (
          <div className="space-y-8">
            {/* Progress bar — reflects actual reviews, not card position */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 font-medium">
                  Card {currentIndex + 1} of {notes.length}
                </span>
                <span className="text-slate-400 text-sm">{reviewedCount} reviewed</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <PracticeCard
              key={`${notes[currentIndex]._id}-${currentIndex}`}
              note={notes[currentIndex]}
              onReviewed={handleReviewed}
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-700 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              {currentIndex === notes.length - 1 ? (
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all shadow-lg shadow-green-900/50 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Complete Practice
                </Link>
              ) : (
                <button
                  onClick={handleNext}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all shadow-lg shadow-blue-900/50 text-sm sm:text-base"
                >
                  Next
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
