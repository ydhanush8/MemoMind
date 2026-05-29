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
      ? 'text-green-400 bg-green-900/20 border-green-700/50'
      : analysis.difficulty === 'Hard'
        ? 'text-red-400 bg-red-900/20 border-red-700/50'
        : 'text-yellow-400 bg-yellow-900/20 border-yellow-700/50';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 animate-fadeIn">

      {/* Score + Difficulty */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <p className="text-slate-400 text-xs mb-1">Understanding Score</p>
          <span className="text-4xl font-bold text-blue-400">{analysis.accuracy_score}%</span>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <p className="text-slate-400 text-xs mb-1">Difficulty</p>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${difficultyColor}`}>
            {analysis.difficulty}
          </span>
        </div>
      </div>

      {/* Cleaned Explanation */}
      {analysis.cleaned_explanation && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <Pencil className="w-4 h-4 text-blue-400" />
            Cleaned Explanation
          </h3>
          <p className="text-slate-200 text-sm leading-relaxed">{analysis.cleaned_explanation}</p>
        </div>
      )}

      {/* Key Points Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-emerald-300 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            What You Got Right
          </h3>
          <ul className="space-y-1.5">
            {keyPoints.map((point, i) => (
              <li key={i} className="text-emerald-100 text-sm leading-relaxed flex gap-2">
                <span className="text-emerald-500 mt-0.5 shrink-0">–</span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-orange-900/20 border border-orange-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-orange-300 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Areas to Improve
          </h3>
          <ul className="space-y-1.5">
            {missingPoints.map((point, i) => (
              <li key={i} className="text-orange-100 text-sm leading-relaxed flex gap-2">
                <span className="text-orange-500 mt-0.5 shrink-0">–</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          Summary
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed">{analysis.simple_summary}</p>
      </div>

      {/* Next Concepts */}
      {nextConcepts.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-blue-400" />
            What to Learn Next
          </h3>
          <div className="flex flex-wrap gap-2">
            {nextConcepts.map((concept, i) => (
              <span
                key={i}
                className="bg-slate-700/60 text-slate-200 text-xs px-3 py-1.5 rounded-md border border-slate-600"
              >
                {concept}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quiz */}
      {quiz.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            Quick Quiz
          </h3>
          <div className="space-y-3">
            {quiz.map((item, i) => (
              <div key={i} className="border border-slate-700 rounded-lg overflow-hidden">
                <div className="p-3 bg-slate-700/40">
                  <p className="text-slate-200 text-sm font-medium">
                    {i + 1}. {item.q}
                  </p>
                </div>
                <div className="p-3">
                  {revealedQuiz.has(i) ? (
                    <p className="text-green-300 text-sm">{item.answer}</p>
                  ) : (
                    <button
                      onClick={() => toggleQuiz(i)}
                      className="text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
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
