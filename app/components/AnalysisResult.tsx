'use client';

import React, { useState } from 'react';
import type { AnalysisResponse } from '@/app/lib/types';

interface AnalysisResultProps {
  analysis: AnalysisResponse;
}

export default function AnalysisResult({ analysis }: AnalysisResultProps) {
  const [revealedQuiz, setRevealedQuiz] = useState<Set<number>>(new Set());

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
      {/* Score + Difficulty Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 backdrop-blur-sm">
          <p className="text-slate-400 text-xs mb-1">Understanding Score</p>
          <span className="text-4xl font-bold text-blue-400">{analysis.accuracy_score}%</span>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 backdrop-blur-sm">
          <p className="text-slate-400 text-xs mb-1">Difficulty</p>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${difficultyColor}`}
          >
            {analysis.difficulty}
          </span>
        </div>
      </div>

      {/* Cleaned Explanation */}
      {analysis.cleaned_explanation && (
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-5 backdrop-blur-sm">
          <h3 className="text-sm font-bold text-blue-300 mb-2 flex items-center gap-2">
            ✏️ Cleaned Explanation
          </h3>
          <p className="text-slate-200 text-sm leading-relaxed">{analysis.cleaned_explanation}</p>
        </div>
      )}

      {/* Key Points Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-xl p-5 backdrop-blur-sm">
          <h3 className="text-sm font-bold text-emerald-300 mb-3">✓ What You Got Right</h3>
          <ul className="space-y-1.5">
            {analysis.key_points_understood.map((point, i) => (
              <li key={i} className="text-emerald-100 text-sm leading-relaxed">
                • {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-orange-900/20 border border-orange-700/50 rounded-xl p-5 backdrop-blur-sm">
          <h3 className="text-sm font-bold text-orange-300 mb-3">⚠ Areas to Improve</h3>
          <ul className="space-y-1.5">
            {analysis.missing_or_unclear_points.map((point, i) => (
              <li key={i} className="text-orange-100 text-sm leading-relaxed">
                • {point}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-white mb-2">📋 Summary</h3>
        <p className="text-slate-300 text-sm leading-relaxed">{analysis.simple_summary}</p>
      </div>

      {/* Next Concepts */}
      {analysis.next_concepts_to_learn?.length > 0 && (
        <div className="bg-purple-900/20 border border-purple-700/50 rounded-xl p-5 backdrop-blur-sm">
          <h3 className="text-sm font-bold text-purple-300 mb-3">🚀 What to Learn Next</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.next_concepts_to_learn.map((concept, i) => (
              <span
                key={i}
                className="bg-purple-800/40 text-purple-200 text-xs px-3 py-1.5 rounded-full border border-purple-700/50"
              >
                {concept}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quiz */}
      {analysis.quick_quiz?.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 backdrop-blur-sm">
          <h3 className="text-sm font-bold text-white mb-4">🧠 Quick Quiz</h3>
          <div className="space-y-4">
            {analysis.quick_quiz.map((item, i) => (
              <div key={i} className="border border-slate-600 rounded-lg overflow-hidden">
                <div className="p-3 bg-slate-700/50">
                  <p className="text-slate-200 text-sm font-medium">
                    Q{i + 1}: {item.q}
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
                      Reveal Answer
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
