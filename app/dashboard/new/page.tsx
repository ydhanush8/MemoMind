'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DynamicUserButton } from '@/app/components/DynamicUserButton';
import { ArrowLeft, Lock, Lightbulb } from 'lucide-react';
import AnalysisResult from '@/app/components/AnalysisResult';
import type { AnalysisResponse } from '@/app/lib/types';
import { trackNoteCreated, trackAIAnalysisUsed } from '@/app/lib/analytics';
import { toast } from 'react-hot-toast';
import { useSubscription } from '@/app/hooks/useSubscription';
import { useCreateNote, useAnalyzeNote } from '@/app/hooks/useNotes';
import { cn } from '@/app/lib/utils';

export default function NewNotePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [understanding, setUnderstanding] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const { data: subscription } = useSubscription();
  const isPremium = subscription?.isPremium ?? false;

  const createNote = useCreateNote();
  const analyzeNote = useAnalyzeNote();

  const isWorking = createNote.isPending || analyzeNote.isPending;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !understanding.trim()) {
      toast.error('Please fill in both fields');
      return;
    }
    if (isSaved) return;

    try {
      const note = await createNote.mutateAsync({
        title: title.trim(),
        understanding: understanding.trim(),
      });
      trackNoteCreated(note._id);
      setIsSaved(true);
      toast.success('Note saved successfully');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save note. Please try again.');
    }
  };

  const handleAnalyze = async () => {
    if (!isPremium) {
      router.push('/pricing');
      return;
    }
    if (!title.trim() || !understanding.trim()) {
      toast.error('Please fill in both fields before analyzing');
      return;
    }
    if (isSaved) return;

    try {
      const result = await analyzeNote.mutateAsync({
        title: title.trim(),
        understanding: understanding.trim(),
      });
      setAnalysis(result);

      trackAIAnalysisUsed({ topic: title.trim(), accuracyScore: result.accuracy_score });

      // Save with analysis — only after successful analysis, never duplicate
      const note = await createNote.mutateAsync({
        title: title.trim(),
        understanding: understanding.trim(),
        analysis: result,
      });
      trackNoteCreated(note._id);
      setIsSaved(true);
      toast.success('Analysis complete! Redirecting…');

      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur">
        <div className="px-4 h-14 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <span className="text-sm font-medium text-foreground">New Note</span>
          <DynamicUserButton appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Create a note</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Capture what you learned — AI will score your understanding
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-xl border border-border/50 bg-card p-6 mt-6">
          <form onSubmit={handleSave}>
            {/* Topic field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1.5">
                Topic
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., React Hooks, Binary Search Trees"
                maxLength={200}
                className={cn(
                  'w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground',
                  'placeholder:text-muted-foreground/50',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50',
                  'transition-colors'
                )}
                required
              />
              <p className="text-xs text-muted-foreground text-right mt-1">{title.length}/200</p>
            </div>

            {/* Understanding field */}
            <div className="mt-5">
              <label htmlFor="understanding" className="block text-sm font-medium text-foreground mb-1.5">
                What did you learn?
              </label>
              <textarea
                id="understanding"
                value={understanding}
                onChange={(e) => setUnderstanding(e.target.value)}
                placeholder="Explain in your own words. The more detail, the better the AI feedback."
                rows={10}
                maxLength={10000}
                className={cn(
                  'w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground',
                  'placeholder:text-muted-foreground/50',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50',
                  'resize-none transition-colors'
                )}
                required
              />
              <p className="text-xs text-muted-foreground text-right mt-1">
                {understanding.length.toLocaleString()}/10,000
              </p>
            </div>

            {/* Error state */}
            {analyzeNote.isError && (
              <div className="mt-4 bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                <p className="text-sm text-destructive">
                  {analyzeNote.error instanceof Error ? analyzeNote.error.message : 'Analysis failed'}
                </p>
              </div>
            )}

            {/* Success state */}
            {isSaved && (
              <div className="mt-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                <p className="text-sm text-emerald-400">Note saved — redirecting to dashboard…</p>
              </div>
            )}

            {/* Button row */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isWorking || isSaved}
                className={cn(
                  'flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
                  'border border-border bg-secondary text-foreground',
                  'hover:bg-secondary/80 hover:border-border/80',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isSaved ? (
                  <>
                    <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Saved
                  </>
                ) : createNote.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save Note
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isWorking || isSaved || (isPremium && (!title.trim() || !understanding.trim()))}
                className={cn(
                  'flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
                  'bg-primary text-white',
                  'hover:bg-primary/90',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {analyzeNote.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    {!isPremium && <Lock className="w-3.5 h-3.5" />}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    {isPremium ? 'Analyze with AI' : 'Analyze (Premium)'}
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Tip box */}
          <div className="mt-4 rounded-lg bg-secondary/50 border border-border/30 p-3 flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isPremium
                ? 'Use AI Analysis to get instant feedback — it also saves your note automatically.'
                : 'Upgrade to Premium to unlock AI analysis and get detailed feedback on your understanding.'}
            </p>
          </div>
        </div>

        {/* Analysis result section */}
        {analysis && (
          <div className="mt-8">
            <h2 className="text-base font-semibold text-foreground mb-4">AI Analysis</h2>
            <AnalysisResult analysis={analysis} />
          </div>
        )}

      </main>
    </div>
  );
}
