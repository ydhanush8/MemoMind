'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { trackSubscriptionStarted } from '@/app/lib/analytics';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PricingPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [isProcessing, setIsProcessing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Pricing data for both currencies
  const pricing = {
    INR: {
      monthly: 99,
      yearly: 999,
      symbol: '₹',
      yearlyDiscount: 189,
    },
    USD: {
      monthly: 1.99,
      yearly: 19.99,
      symbol: '$',
      yearlyDiscount: 3.89,
    },
  };

  useEffect(() => {
    checkSubscription();
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const checkSubscription = async () => {
    const response = await fetch('/api/subscription/status');
    if (response.ok) {
      const data = await response.json();
      setSubscriptionStatus(data);
    }
  };

  const handleUpgrade = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: selectedPlan }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to create subscription: ${response.status}`);
      }

      const data = await response.json();
      const { subscriptionId, razorpayKeyId } = data;

      if (!subscriptionId || !razorpayKeyId) {
        throw new Error('Invalid response from server');
      }

      const options = {
        key: razorpayKeyId,
        subscription_id: subscriptionId,
        name: 'MemoMind Premium',
        description: `${selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'} Subscription`,
        handler: async function (response: any) {
          const verifyResponse = await fetch('/api/subscription/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (verifyResponse.ok) {
            // Track subscription started
            trackSubscriptionStarted({
              planType: selectedPlan,
              amount: selectedPlan === 'monthly' ? pricing[currency].monthly : pricing[currency].yearly,
              currency: currency,
            });
            
            alert('🎉 Welcome to Premium! AI features are now unlocked!');
            router.push('/');
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: '',
          email: '',
        },
        theme: {
          color: '#3B82F6',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'Failed to initiate payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (subscriptionStatus?.isPremium) {
    return (
      <div className="min-h-screen bg-slate-900 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">You're Premium! 🎉</h1>
            <p className="text-slate-400 mb-6">Enjoy all premium features</p>
            <Link
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-6 sm:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </Link>
          <UserButton />
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Upgrade to <span className="text-blue-400">Premium</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 mb-6">
            Unlock AI-powered learning and never forget again
          </p>
          
          {/* Currency Toggle */}
          <div className="flex justify-center gap-2 mb-4">
            <button
              onClick={() => setCurrency('INR')}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                currency === 'INR'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
              }`}
            >
              🇮🇳 INR (₹)
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                currency === 'USD'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
              }`}
            >
              🌎 USD ($)
            </button>
          </div>
        </div>

        <div className="flex justify-center gap-3 mb-12">
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              selectedPlan === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedPlan('yearly')}
            className={`px-6 py-2 rounded-lg font-medium transition-all relative ${
              selectedPlan === 'yearly'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Yearly
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
              Save {pricing[currency].symbol}{pricing[currency].yearlyDiscount}
            </span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
            <div className="text-4xl font-bold text-white mb-6">{pricing[currency].symbol}0</div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3 text-slate-300">
                <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Create unlimited notes
              </li>
              <li className="flex items-start gap-3 text-slate-300">
                <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                View and edit notes
              </li>
              <li className="flex items-start gap-3 text-slate-500">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                No AI Analysis
              </li>
              <li className="flex items-start gap-3 text-slate-500">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                No Daily Practice
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-2 border-blue-500/50 rounded-2xl p-8 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
              Recommended
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
            <div className="mb-6">
              <div className="text-4xl font-bold text-white">
                {pricing[currency].symbol}{selectedPlan === 'monthly' ? pricing[currency].monthly : pricing[currency].yearly}
              </div>
              <div className="text-slate-400">
                {selectedPlan === 'monthly' ? 'per month' : 'per year'}
              </div>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3 text-white">
                <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Everything in Free +
              </li>
              <li className="flex items-start gap-3 text-white">
                <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                AI Analysis - Instant feedback
              </li>
              <li className="flex items-start gap-3 text-white">
                <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Daily Practice with flip cards
              </li>
              <li className="flex items-start gap-3 text-white">
                <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Review tracking & statistics
              </li>
            </ul>
            <button
              onClick={handleUpgrade}
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Upgrade Now'}
            </button>
            <p className="text-xs text-slate-400 text-center mt-4">Cancel anytime</p>
          </div>
        </div>
      </div>

      {/* Error Modal */}
      {error && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-red-500/50 rounded-2xl p-8 max-w-md w-full mx-4 animate-fadeIn">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Payment Error</h3>
                <p className="text-slate-300">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
