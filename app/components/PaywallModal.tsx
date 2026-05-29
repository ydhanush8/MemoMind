'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Check, Zap } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const features = [
  'AI Analysis — instant feedback on your understanding',
  'Daily Practice — spaced repetition flip cards',
  'Review tracking — never forget what you learned',
];

export default function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    setIsProcessing(true);
    router.push('/pricing');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Pro Feature</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Upgrade to Pro</h2>
          <p className="text-slate-400 text-sm">Unlock AI-powered learning tools</p>
        </div>

        {/* Features */}
        <ul className="space-y-2.5 mb-6">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
              <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              {f}
            </li>
          ))}
        </ul>

        {/* Pricing */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Monthly</span>
            <span className="text-lg font-bold text-white">₹99</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Yearly</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">₹999</span>
              <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">Save ₹189</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleUpgrade}
          disabled={isProcessing}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50 text-sm"
        >
          {isProcessing ? 'Loading...' : 'View pricing'}
        </button>

        <p className="text-xs text-slate-600 text-center mt-3">
          Cancel anytime. No questions asked.
        </p>
      </div>
    </div>
  );
}
