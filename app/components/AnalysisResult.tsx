import React from 'react';
import type { AnalysisResponse } from '@/app/lib/types';

interface AnalysisResultProps {
  analysis: AnalysisResponse;
}

export default function AnalysisResult({ analysis }: AnalysisResultProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Accuracy Score */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">Your Understanding:</span>
          <span className="text-3xl font-bold text-blue-400">{analysis.accuracy_score}%</span>
        </div>
      </div>

      {/* Key Points */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* What You Got Right */}
        <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-emerald-200 mb-3">✓ What You Got Right</h3>
          <ul className="space-y-2">
            {analysis.key_points_understood.map((point, index) => (
              <li key={index} className="text-emerald-100 text-sm">
                • {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Areas to Improve */}
        <div className="bg-orange-900/20 border border-orange-700/50 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-orange-200 mb-3">⚠ Areas to Improve</h3>
          <ul className="space-y-2">
            {analysis.missing_or_unclear_points.map((point, index) => (
              <li key={index} className="text-orange-100 text-sm">
                • {point}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-bold text-white mb-2">Summary</h3>
        <p className="text-slate-300">{analysis.simple_summary}</p>
      </div>
    </div>
  );
}
