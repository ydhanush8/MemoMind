'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  BookOpen,
  Pencil,
} from 'lucide-react';
import type { AnalysisResponse } from '@/app/lib/types';

interface AnalysisResultProps {
  analysis: AnalysisResponse;
}

function safeArray<T>(val: unknown): T[] {
  return Array.isArray(val) ? (val as T[]) : [];
}

export default function AnalysisResult({ analysis }: AnalysisResultProps) {
  const [revealedQuiz, setRevealedQuiz] = useState<Set<number>>(new Set());

  const keyPoints = safeArray<string>(analysis.key_points_understood);
  const missingPoints = safeArray<string>(analysis.missing_or_unclear_points);
  const nextConcepts = safeArray<string>(analysis.next_concepts_to_learn);
  const quiz = safeArray<{ q: string; answer: string }>(analysis.quick_quiz);

  const toggleQuiz = (index: number) => {
    setRevealedQuiz((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const difficultyColor =
    analysis.difficulty === 'Easy'
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
      : analysis.difficulty === 'Hard'
        ? 'bg-destructive/15 text-red-400 border-destructive/30'
        : 'bg-amber-500/15 text-amber-400 border-amber-500/30';

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-4">

      {/* Score + Difficulty row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <p className="text-xs text-muted-foreground mb-1">Understanding Score</p>
          <span className="text-3xl font-bold text-primary">{analysis.accuracy_score}%</span>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <p className="text-xs text-muted-foreground mb-1">Difficulty</p>
          <span
            className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${difficultyColor}`}
          >
            {analysis.difficulty}
          </span>
        </div>
      </div>

      {/* Cleaned Explanation */}
      {analysis.cleaned_explanation && (
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Pencil className="w-4 h-4 text-primary" />
            Improved Explanation
          </h3>
          <p className="text-sm text-foreground leading-relaxed">{analysis.cleaned_explanation}</p>
        </div>
      )}

      {/* Key points grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            What You Got Right
          </h3>
          <ul className="space-y-1.5">
            {keyPoints.map((point, i) => (
              <li key={i} className="text-sm text-foreground/80 leading-relaxed flex gap-2">
                <span className="text-emerald-400 mt-0.5 shrink-0">–</span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            Areas to Improve
          </h3>
          <ul className="space-y-1.5">
            {missingPoints.map((point, i) => (
              <li key={i} className="text-sm text-foreground/80 leading-relaxed flex gap-2">
                <span className="text-amber-400 mt-0.5 shrink-0">–</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-card border border-border/50 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          Summary
        </h3>
        <p className="text-sm text-foreground leading-relaxed">{analysis.simple_summary}</p>
      </div>

      {/* Next Concepts */}
      {nextConcepts.length > 0 && (
        <div className="bg-card border border-border/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-primary" />
            What to Learn Next
          </h3>
          <div className="flex flex-wrap gap-2">
            {nextConcepts.map((concept, i) => (
              <span
                key={i}
                className="bg-secondary text-foreground text-xs px-3 py-1.5 rounded-md border border-border font-medium"
              >
                {concept}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quiz */}
      {quiz.length > 0 && (
        <div className="bg-card border border-border/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Quick Quiz
          </h3>
          <div className="space-y-3">
            {quiz.map((item, i) => (
              <div key={i} className="border border-border/50 rounded-lg overflow-hidden">
                <div className="bg-secondary/50 p-3">
                  <p className="text-sm font-medium text-foreground">
                    {i + 1}. {item.q}
                  </p>
                </div>
                <div className="p-3">
                  {revealedQuiz.has(i) ? (
                    <p className="text-sm text-foreground">{item.answer}</p>
                  ) : (
                    <button
                      onClick={() => toggleQuiz(i)}
                      className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      Reveal answer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
