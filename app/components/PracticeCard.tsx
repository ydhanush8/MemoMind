'use client';

import React, { useState, useEffect } from 'react';
import type { Note } from '@/app/lib/types';
import AnalysisResult from './AnalysisResult';

interface PracticeCardProps {
  note: Note;
  onReviewed: (id: string) => void;
}

export default function PracticeCard({ note, onReviewed }: PracticeCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  // useRef so the flag updates synchronously — state updater double-invocation in
  // React 18 Strict Mode would fire onReviewed twice if this were useState.
  const hasReviewedRef = React.useRef(false);

  useEffect(() => {
    setIsFlipped(false);
    hasReviewedRef.current = false;
  }, [note]);

  const handleFlip = () => {
    const next = !isFlipped;
    setIsFlipped(next);
    if (next && !hasReviewedRef.current) {
      hasReviewedRef.current = true;
      onReviewed(note._id);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto" style={{ perspective: '1000px' }}>
      <div
        className="relative w-full transition-transform duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          minHeight: '420px',
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-2 border-blue-500/50 rounded-2xl p-4 sm:p-8 cursor-pointer hover:border-blue-400/70 transition-all"
          onClick={handleFlip}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex flex-col items-center justify-center h-full space-y-4 sm:space-y-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center px-4">{note.title}</h2>
            <p className="text-slate-300 text-center text-base sm:text-lg px-4">
              Do you remember what you learned?
            </p>
            <div className="flex items-center gap-2 text-blue-400 animate-pulse">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <span className="font-medium text-sm sm:text-base">Click to reveal</span>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 bg-slate-800/50 border-2 border-slate-700 rounded-2xl p-4 sm:p-8 cursor-pointer hover:border-slate-600 transition-all overflow-y-auto"
          onClick={handleFlip}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="space-y-4 sm:space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">{note.title}</h2>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(false);
                }}
                className="text-slate-400 hover:text-white transition-colors flex-shrink-0 p-1"
                aria-label="Flip back"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Note content */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 sm:p-4">
              <h3 className="text-xs sm:text-sm font-semibold text-blue-400 mb-2">What You Learned</h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                {note.understanding}
              </p>
            </div>

            {/* AI Analysis */}
            {note.analysis && (
              <div className="border-t border-slate-700 pt-4" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-sm font-semibold text-purple-400 mb-3">🤖 AI Analysis</h3>
                <AnalysisResult analysis={note.analysis} />
              </div>
            )}

            <p className="text-center text-slate-500 text-xs mt-2">Click anywhere to flip back</p>
          </div>
        </div>
      </div>
    </div>
  );
}
