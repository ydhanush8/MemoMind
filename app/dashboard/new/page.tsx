'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Lightbulb, Sparkles, Save, Check, Loader2 } from 'lucide-react';
import AnalysisResult from '@/app/components/AnalysisResult';
import type { AnalysisResponse } from '@/app/lib/types';
import { toast } from 'react-hot-toast';
import { useSubscription } from '@/app/hooks/useSubscription';
import { useCreateNote, useAnalyzeNote } from '@/app/hooks/useNotes';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';

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
      await createNote.mutateAsync({
        title: title.trim(),
        understanding: understanding.trim(),
      });
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

      await createNote.mutateAsync({
        title: title.trim(),
        understanding: understanding.trim(),
        analysis: result,
      });
      setIsSaved(true);
      toast.success('Analysis complete! Redirecting…');

      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to notes
      </Link>

      <div className="mt-5 max-w-2xl">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Create a note</h1>
        <p className="text-sm text-muted-foreground mt-1.5 text-pretty">
          Capture what you learned in your own words — AI will score how well you understand it.
        </p>
      </div>

      <div className="mt-7 max-w-2xl rounded-3xl border border-border/60 bg-card p-6 sm:p-8 shadow-elevation-1">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="title">Topic</Label>
              <span className="text-xs text-muted-foreground tabular-nums">{title.length}/200</span>
            </div>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., React Hooks, Binary Search Trees"
              maxLength={200}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="understanding">What did you learn?</Label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {understanding.length.toLocaleString()}/10,000
              </span>
            </div>
            <Textarea
              id="understanding"
              value={understanding}
              onChange={(e) => setUnderstanding(e.target.value)}
              placeholder="Explain in your own words. The more detail, the better the AI feedback."
              rows={10}
              maxLength={10000}
              required
            />
          </div>

          {analyzeNote.isError && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3.5">
              <p className="text-sm text-destructive">
                {analyzeNote.error instanceof Error ? analyzeNote.error.message : 'Analysis failed'}
              </p>
            </div>
          )}

          {isSaved && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5">
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Note saved — redirecting to dashboard…
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              variant="secondary"
              size="lg"
              disabled={isWorking || isSaved}
              className="flex-1"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  Saved
                </>
              ) : createNote.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save note
                </>
              )}
            </Button>

            <Button
              type="button"
              size="lg"
              onClick={handleAnalyze}
              disabled={
                isWorking || isSaved || (isPremium && (!title.trim() || !understanding.trim()))
              }
              className="flex-1"
            >
              {analyzeNote.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  {!isPremium ? <Lock className="w-3.5 h-3.5" /> : <Sparkles className="w-4 h-4" />}
                  {isPremium ? 'Analyze with AI' : 'Analyze (Premium)'}
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-5 rounded-2xl bg-secondary/60 border border-border/40 p-4 flex items-start gap-3">
          <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isPremium
              ? 'Use AI Analysis to get instant feedback — it also saves your note automatically.'
              : 'Upgrade to Premium to unlock AI analysis and get detailed feedback on your understanding.'}
          </p>
        </div>
      </div>

      {analysis && (
        <div className="mt-10 max-w-3xl">
          <h2 className="text-lg font-bold text-foreground mb-4 tracking-tight">AI Analysis</h2>
          <AnalysisResult analysis={analysis} />
        </div>
      )}
    </>
  );
}
