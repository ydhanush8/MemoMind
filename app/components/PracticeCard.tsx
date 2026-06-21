'use client';

import React, { useState, useEffect } from 'react';
import { Brain, X } from 'lucide-react';
import type { Note } from '@/app/lib/types';
import AnalysisResult from './AnalysisResult';
import { cn } from '@/app/lib/utils';

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
    <div className="w-full max-w-2xl mx-auto" style={{ perspective: '1200px' }}>
      <div
        className="relative w-full transition-transform duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          minHeight: '460px',
        }}
      >
        {/* Front face */}
        <div
          className="absolute inset-0 rounded-xl border border-border/50 bg-card cursor-pointer hover:bg-zinc-800/20 transition-colors p-8"
          onClick={handleFlip}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex flex-col items-center justify-center h-full gap-6">
            {/* Icon */}
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <Brain className="w-6 h-6" />
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground text-center">
              {note.title}
            </h2>

            {/* Subtitle */}
            <p className="text-sm text-muted-foreground text-center">
              Do you remember what you learned?
            </p>

            {/* Tap hint */}
            <div className="flex items-center gap-2 text-primary text-sm animate-pulse cursor-pointer">
              <Brain className="w-4 h-4" />
              <span>Tap to reveal</span>
            </div>
          </div>
        </div>

        {/* Back face */}
        <div
          className="absolute inset-0 rounded-xl border border-border/50 bg-card cursor-pointer overflow-y-auto p-6 sm:p-8"
          onClick={handleFlip}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold text-foreground">{note.title}</h2>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 p-1"
              aria-label="Flip back"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* What You Learned */}
          <div className="bg-zinc-800/50 rounded-lg p-4 mt-4">
            <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">
              What You Learned
            </p>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {note.understanding}
            </p>
          </div>

          {/* AI Analysis */}
          {note.analysis && (
            <div
              className="border-t border-border/50 pt-4 mt-4"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                AI Analysis
              </p>
              <AnalysisResult analysis={note.analysis} />
            </div>
          )}

          {/* Footer hint */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            Click anywhere to flip back
          </p>
        </div>
      </div>
    </div>
  );
}
