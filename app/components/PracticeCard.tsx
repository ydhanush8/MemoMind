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

  useEffect(() => {
    setIsFlipped(false);
  }, [note]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      const noteId = (note as { _id?: string })._id || note.id;
      onReviewed(noteId);
    }
  };

  return (
    <div className="perspective-1000 w-full max-w-2xl mx-auto">
      <div
        className={`relative w-full transition-transform duration-700 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front of Card - Question */}
        <div
          className={`absolute inset-0 backface-hidden bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-2 border-blue-500/50 rounded-2xl p-4 sm:p-8 cursor-pointer hover:border-blue-400/70 transition-all ${
            isFlipped ? 'invisible' : 'visible'
          }`}
          onClick={handleFlip}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] space-y-4 sm:space-y-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                />
              </svg>
              <span className="font-medium text-sm sm:text-base">Click to reveal</span>
            </div>
          </div>
        </div>

        {/* Back of Card - Answer */}
        <div
          className={`bg-slate-800/50 border-2 border-slate-700 rounded-2xl p-4 sm:p-8 cursor-pointer hover:border-slate-600 transition-all ${
            isFlipped ? 'visible' : 'invisible'
          }`}
          onClick={handleFlip}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="min-h-[300px] sm:min-h-[400px] space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">{note.title}</h2>
              <button className="text-slate-400 hover:text-white transition-colors flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Original Note */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 sm:p-4">
              <h3 className="text-xs sm:text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                What You Learned
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                {note.understanding}
              </p>
            </div>

            {/* AI Analysis */}
            {note.analysis && (
              <div className="border-t border-slate-700 pt-4">
                <h3 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  AI Analysis
                </h3>
                <div className="text-sm">
                  <AnalysisResult analysis={note.analysis} />
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm mt-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Click to flip back
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
