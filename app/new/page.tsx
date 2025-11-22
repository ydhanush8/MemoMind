'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import AnalysisResult from '@/app/components/AnalysisResult';
import PaywallModal from '@/app/components/PaywallModal';
import type { AnalysisRequest, AnalysisResponse } from '@/app/lib/types';
import { trackNoteCreated, trackAIAnalysisUsed } from '@/app/lib/analytics';

export default function NewNotePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [understanding, setUnderstanding] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  React.useEffect(() => {
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
  }; // Track if note is already saved

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim() || !understanding.trim()) {
      alert('Please fill in both fields');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          understanding: understanding.trim(),
        }),
      });

      if (response.ok) {
        const createdNote = await response.json();
        
        // Track note creation
        trackNoteCreated(createdNote._id || createdNote.id);
        
        router.push('/dashboard');
      } else {
        alert('Failed to save note. Please try again.');
      }
    } catch (err) {
      alert('Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyze = async () => {
    if (!isPremium) {
      setShowPaywall(true);
      return;
    }

    // Validation
    if (!title.trim() || !understanding.trim()) {
      alert('Please fill in both fields before analyzing');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const requestBody: AnalysisRequest = {
        title: title.trim(),
        understanding: understanding.trim(),
      };

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze');
      }

      const data: AnalysisResponse = await response.json();
      setAnalysis(data);

      // Track AI analysis usage
      trackAIAnalysisUsed({
        topic: title.trim(),
        accuracyScore: data.accuracy_score,
      });

      // Auto-save the note with analysis results to database
      await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          understanding: understanding.trim(),
          analysis: data,
        }),
      });

      setIsSaved(true); // Mark as saved
      setShowSuccess(true);

      // Redirect to dashboard after showing success message
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Renamed handleSave to handleSubmit for clarity in the form
  const handleSubmit = handleSave;
  const isLoading = isSaving; // Alias for consistency with new button states

  return (
    <div className="min-h-screen bg-slate-900 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors text-sm sm:text-base"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to My Notes
            </Link>

            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8 sm:w-10 sm:h-10',
                },
              }}
            />
          </div>

          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">
              Create Learning Note
            </h1>
            <p className="text-sm sm:text-base text-slate-400">
              Track your understanding and get AI feedback
            </p>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
                Topic / Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., React Hooks"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <label htmlFor="understanding" className="block text-sm font-medium text-slate-300 mb-2">
                What did you learn?
              </label>
              <textarea
                id="understanding"
                value={understanding}
                onChange={(e) => setUnderstanding(e.target.value)}
                placeholder="Explain your understanding in your own words..."
                rows={8}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
                required
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 sm:p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {showSuccess && (
              <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-3 sm:p-4">
                <p className="text-green-400 text-sm">
                  ✓ Note saved successfully! Redirecting to dashboard...
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="submit"
                disabled={isLoading || isSaved}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all shadow-lg shadow-blue-900/50 disabled:shadow-none text-sm sm:text-base"
              >
                {isSaved ? (
                  <>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Already Saved
                  </>
                ) : isLoading ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                      />
                    </svg>
                    <span className="hidden xs:inline">Save Learning Note</span>
                    <span className="xs:hidden">Save</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !title || !understanding || isSaved}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all shadow-lg shadow-purple-900/50 disabled:shadow-none text-sm sm:text-base relative"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    {!isPremium && (
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
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
                    <span className="hidden xs:inline">
                      {isPremium ? 'Analyze with AI' : 'Analyze (Premium)'}
                    </span>
                    <span className="xs:hidden">Analyze</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Info Banner */}
          <div className="mt-6 bg-slate-700/30 border border-slate-600 rounded-lg p-4">
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-blue-400">💡 Tip:</span>
              {isPremium
                ? ' Use AI analysis to get instant feedback, or just save notes to review later!'
                : ' Upgrade to Premium to unlock AI analysis!'}
            </p>
          </div>
        </div>

        {/* Analysis Results */}
        {analysis && <AnalysisResult analysis={analysis} />}
        <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
      </div>
    </div>
  );
}
