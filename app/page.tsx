'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Note } from './lib/types';
import NoteCard from './components/NoteCard';
import PaywallModal from './components/PaywallModal';
import { UserButton } from '@clerk/nextjs';

export default function HomePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [practiceStatus, setPracticeStatus] = useState<{
    completed: boolean;
    reviewedToday: number;
    notesNeedingReview: number;
  } | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    loadNotes();
    loadPracticeStatus();
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/status');
      if (response.ok) {
        const data = await response.json();
        setIsPremium(data.isPremium);
      }
    } catch (error) {
      console.error('Failed to check subscription:', error);
    }
  };

  const loadNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPracticeStatus = async () => {
    try {
      const response = await fetch('/api/practice/status');
      if (response.ok) {
        const data = await response.json();
        setPracticeStatus(data);
      }
    } catch (error) {
      console.error('Error loading practice status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotes(
          notes.filter((note) => {
            const noteId = (note as { _id?: string })._id || note.id;
            return noteId !== id;
          }),
        );
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 mb-4 sm:mb-6">
            {/* Title Row */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                  <h1 className="text-3xl sm:text-4xl font-bold text-white">
                    <span className="text-blue-400">Memo</span>Mind
                  </h1>
                  {isPremium && (
                    <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      ⭐ Premium
                    </span>
                  )}
                </div>
                <p className="text-sm sm:text-base text-slate-400">My Learning Notes</p>
              </div>
              
              {/* Profile Button - Always visible on right */}
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-10 h-10',
                  },
                }}
              />
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-2">
              {isPremium ? (
                <Link
                  href="/practice"
                  className="relative inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-purple-900/50 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  <span>Daily Practice</span>
                  {practiceStatus && (
                    <span
                      className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        practiceStatus.completed
                          ? 'bg-green-500 text-white'
                          : 'bg-orange-500 text-white'
                      }`}
                    >
                      {practiceStatus.completed ? '✓' : practiceStatus.notesNeedingReview}
                    </span>
                  )}
                </Link>
              ) : (
                <button
                  onClick={() => setShowPaywall(true)}
                  className="relative inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold px-4 py-2.5 rounded-lg transition-all text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="hidden sm:inline">Daily Practice</span>
                  <span className="sm:hidden">Practice</span>
                </button>
              )}
              
              <Link
                href="/new"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-blue-900/50 text-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Add Note</span>
              </Link>
              
              {!isPremium && (
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-blue-900/50 transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden sm:inline">Upgrade to Premium</span>
                  <span className="sm:hidden">Upgrade</span>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm sm:text-base">
            <p className="text-slate-400">
              {isLoading
                ? 'Loading...'
                : `${notes.length} ${notes.length === 1 ? 'note' : 'notes'} saved`}
            </p>
            {practiceStatus && !practiceStatus.completed && practiceStatus.notesNeedingReview > 0 && (
              <p className="text-orange-400 font-medium text-xs sm:text-sm">
                {practiceStatus.notesNeedingReview} notes need review today
              </p>
            )}
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
              <svg
                className="w-16 h-16 text-slate-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-xl font-bold text-white mb-2">No notes yet</h3>
              <p className="text-slate-400 mb-6">
                Start creating learning notes to track your progress and understanding.
              </p>
              <Link
                href="/new"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-lg shadow-blue-900/50"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Your First Note
              </Link>
            </div>
          </div>
        )}

        {!isLoading && notes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => {
              const noteId = (note as { _id?: string })._id || note.id;
              return <NoteCard key={noteId} note={note} onDelete={handleDelete} />;
            })}
          </div>
        )}
      </div>
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  );
}
