'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SignInButton, useAuth } from '@clerk/nextjs';
import { DynamicUserButton } from '@/app/components/DynamicUserButton';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useSubscription } from '@/app/hooks/useSubscription';
import { ArrowLeft, CheckCircle2, Check, X, Sparkles } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { Button } from '@/app/components/ui/button';
import { Separator } from '@/app/components/ui/separator';
import { Input } from '@/app/components/ui/input';
import { DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PricingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isSignedIn } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: subscriptionStatus, refetch: refetchSubscription } = useSubscription();
  const [isRestoring, setIsRestoring] = useState(false);
  const [showManualRestore, setShowManualRestore] = useState(false);
  const [manualSubId, setManualSubId] = useState('');

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
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleUpgrade = async () => {
    if (!isSignedIn) {
      // Not logged in — the SignInButton wrapper handles this case; this is a safety net
      router.push('/sign-in');
      return;
    }

    if (!window.Razorpay) {
      setError('Payment system is loading. Please wait a moment and try again.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: selectedPlan }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        subscriptionId?: string;
        razorpayKeyId?: string;
        error?: string;
        alreadyPremium?: boolean;
      };

      if (!response.ok) {
        if (data.alreadyPremium) {
          // User already has premium — sync state and redirect
          await queryClient.invalidateQueries({ queryKey: ['subscription'] });
          await refetchSubscription();
          toast.success('You are already on Premium!');
          return;
        }
        throw new Error(data.error ?? 'Failed to start payment. Please try again.');
      }

      const { subscriptionId, razorpayKeyId } = data;
      if (!subscriptionId || !razorpayKeyId) {
        throw new Error('Invalid response from payment server. Please try again.');
      }

      const capturedPlan = selectedPlan; // Capture at open time to avoid closure staleness

      const options = {
        key: razorpayKeyId,
        subscription_id: subscriptionId,
        name: 'MemoMind Premium',
        description: `${capturedPlan === 'monthly' ? 'Monthly' : 'Yearly'} Subscription`,
        handler: async function (rzpResponse: {
          razorpay_subscription_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          try {
            const verifyResponse = await fetch('/api/subscription/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_subscription_id: rzpResponse.razorpay_subscription_id,
                razorpay_payment_id: rzpResponse.razorpay_payment_id,
                razorpay_signature: rzpResponse.razorpay_signature,
                planType: capturedPlan,
              }),
            });

            const verifyData = (await verifyResponse.json().catch(() => ({}))) as {
              success?: boolean;
              error?: string;
              recoverable?: boolean;
            };

            if (verifyResponse.ok && verifyData.success) {
              await queryClient.invalidateQueries({ queryKey: ['subscription'] });
              toast.success('Welcome to Pro! AI features are now unlocked.');
              router.push('/dashboard');
            } else if (verifyData.recoverable) {
              // Payment charged but DB failed — guide to restore
              setError(
                'Your payment was received by Razorpay, but we had trouble activating your account. ' +
                  'Click "Restore Subscription" below — no charge will be made.',
              );
            } else {
              setError(
                verifyData.error ??
                  'Verification failed. If you were charged, use "Restore Subscription" below.',
              );
            }
          } catch {
            // Network failure after successful Razorpay payment
            setError(
              'Network error during verification. If Razorpay charged you, click "Restore Subscription" below — you will NOT be charged again.',
            );
          }
        },
        modal: {
          // Re-enable button only when modal closes, not when checkout opens
          ondismiss: () => {
            setIsProcessing(false);
          },
          escape: false, // Prevent accidental dismiss
        },
        prefill: { name: '', email: '' },
        theme: { color: '#cd7a4f' },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      // Button stays disabled until ondismiss fires — prevents double-subscription
      return;
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to initiate payment. Please try again.',
      );
    }
    setIsProcessing(false); // Only reached on pre-checkout errors
  };

  const handleRestore = async (subscriptionId?: string) => {
    setIsRestoring(true);
    try {
      const res = await fetch('/api/subscription/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscriptionId || undefined }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        alreadyActive?: boolean;
        notFound?: boolean;
        error?: string;
      };

      if (res.ok && data.success) {
        await queryClient.invalidateQueries({ queryKey: ['subscription'] });
        toast.success('Subscription restored. You are now on Pro.');
        router.push('/dashboard');
      } else if (res.ok && data.alreadyActive) {
        await queryClient.invalidateQueries({ queryKey: ['subscription'] });
        toast.success('Your subscription is already active!');
        router.push('/dashboard');
      } else if (data.notFound) {
        // Automatic search failed — ask for manual ID
        setShowManualRestore(true);
        toast.error('Auto-search failed. Please enter your Razorpay Subscription ID below.');
      } else {
        toast.error(data.error ?? 'Could not restore subscription. Please contact support.');
      }
    } catch {
      toast.error('Restore failed. Please try again or contact support.');
    } finally {
      setIsRestoring(false);
    }
  };

  if (subscriptionStatus?.isPremium) {
    return (
      <div className="theme-paper min-h-screen bg-background py-12 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <DynamicUserButton />
        </div>

        <div className="bg-card border border-border/60 rounded-3xl p-12 max-w-md mx-auto text-center mt-20 shadow-elevation-2">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/12 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">You&apos;re on Pro</h1>
          <p className="text-muted-foreground mt-2 mb-8">Enjoy every premium feature.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:bg-primary/90 transition-colors shadow-elevation-1"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-paper min-h-screen bg-background py-6 sm:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-14">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <DynamicUserButton />
        </div>

        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="text-primary font-bold text-xs tracking-[0.2em] uppercase">Pricing</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mt-3 tracking-tight text-balance">
            Simple, transparent pricing
          </h1>
          <p className="text-muted-foreground text-lg mt-4 text-pretty">
            Unlock AI-powered learning and never forget again.
          </p>
        </div>

        <div className="flex gap-1 justify-center mb-6 bg-secondary rounded-full p-1 w-fit mx-auto">
          <button
            onClick={() => setCurrency('INR')}
            className={cn(
              'px-5 py-2 text-sm font-semibold rounded-full transition-all',
              currency === 'INR'
                ? 'bg-card shadow-elevation-1 text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            INR (₹)
          </button>
          <button
            onClick={() => setCurrency('USD')}
            className={cn(
              'px-5 py-2 text-sm font-semibold rounded-full transition-all',
              currency === 'USD'
                ? 'bg-card shadow-elevation-1 text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            USD ($)
          </button>
        </div>

        <div className="flex gap-1 justify-center mb-12 bg-secondary rounded-full p-1 w-fit mx-auto">
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={cn(
              'px-5 py-2 text-sm font-semibold rounded-full transition-all',
              selectedPlan === 'monthly'
                ? 'bg-card shadow-elevation-1 text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedPlan('yearly')}
            className={cn(
              'relative px-5 py-2 text-sm font-semibold rounded-full transition-all',
              selectedPlan === 'yearly'
                ? 'bg-card shadow-elevation-1 text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Yearly
            <span className="absolute -top-2.5 -right-2 bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none whitespace-nowrap">
              Save {pricing[currency].symbol}
              {pricing[currency].yearlyDiscount}
            </span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          <div className="rounded-3xl border border-border/60 bg-card p-8 flex flex-col shadow-elevation-1">
            <div>
              <p className="text-lg font-bold text-foreground">Free</p>
              <p className="text-4xl font-extrabold text-foreground mt-3">
                {pricing[currency].symbol}0
              </p>
              <p className="text-sm text-muted-foreground mt-1">Free forever</p>
            </div>

            <Separator className="mt-6 mb-6" />

            <ul className="space-y-3.5 flex-1">
              {[
                { text: 'Create unlimited notes', included: true },
                { text: 'View and edit notes', included: true },
                { text: 'AI Analysis', included: false },
                { text: 'Daily Practice', included: false },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-3">
                  {item.included ? (
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                  )}
                  <span
                    className={cn(
                      'text-sm',
                      item.included ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            </div>
          </div>

          <div className="relative p-[1.5px] rounded-3xl bg-gradient-to-br from-primary/60 via-primary/25 to-amber-500/40 flex flex-col shadow-elevation-2">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 bg-primary text-primary-foreground text-xs px-3.5 py-1 rounded-full font-bold shadow-elevation-1">
              Most Popular
            </span>

            <div className="rounded-[calc(1.5rem-1.5px)] bg-card p-8 flex flex-col h-full">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold text-foreground">Premium</p>
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <p className="text-4xl font-extrabold text-foreground mt-3">
                  {pricing[currency].symbol}
                  {selectedPlan === 'monthly'
                    ? pricing[currency].monthly
                    : pricing[currency].yearly}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedPlan === 'monthly' ? 'per month' : 'per year'}
                </p>
              </div>

              <Separator className="mt-6 mb-6" />

              <ul className="space-y-3.5 flex-1">
                {[
                  'Everything in Free',
                  'AI Analysis — instant feedback',
                  'Daily Practice with flip cards',
                  'Review tracking & statistics',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {isSignedIn ? (
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={handleUpgrade}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Upgrade Now'}
                  </Button>
                ) : (
                  <SignInButton mode="modal">
                    <Button variant="default" className="w-full">
                      Sign in to Upgrade
                    </Button>
                  </SignInButton>
                )}
                <p className="text-xs text-muted-foreground text-center mt-3">Cancel anytime</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 max-w-4xl mx-auto pb-12">
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevation-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Already paid but showing Free?
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  If your Razorpay payment succeeded but the app didn&apos;t activate — click
                  Restore. No charge.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRestore()}
                disabled={isRestoring}
                className="flex-shrink-0 whitespace-nowrap"
              >
                {isRestoring ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Restoring…
                  </span>
                ) : (
                  'Restore Subscription'
                )}
              </Button>
            </div>

            {showManualRestore && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground mb-3">
                  Enter your{' '}
                  <span className="font-semibold text-foreground">Razorpay Subscription ID</span>{' '}
                  from your payment receipt email (starts with{' '}
                  <code className="text-primary text-xs">sub_</code>):
                </p>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={manualSubId}
                    onChange={(e) => setManualSubId(e.target.value)}
                    placeholder="sub_xxxxxxxxxxxxxxxxxx"
                    className="flex-1"
                  />
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      if (manualSubId.trim()) handleRestore(manualSubId.trim());
                    }}
                    disabled={isRestoring || !manualSubId.trim()}
                    className="whitespace-nowrap"
                  >
                    {isRestoring ? 'Restoring…' : 'Restore'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Find this in your Razorpay receipt email or at razorpay.com → Dashboard →
                  Subscriptions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/70 backdrop-blur-md"
            onClick={() => setError(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-border/60 bg-card shadow-elevation-3 p-6 animate-scale-in">
            <DialogHeader className="p-0 pb-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-destructive/12 flex items-center justify-center flex-shrink-0">
                  <X className="w-4 h-4 text-destructive" />
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-foreground">Issue with Payment</DialogTitle>
                  <DialogDescription className="mt-1 text-sm leading-relaxed">
                    {error}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-2">
              {(error.toLowerCase().includes('razorpay') ||
                error.toLowerCase().includes('charged') ||
                error.toLowerCase().includes('restore')) && (
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => {
                    setError(null);
                    handleRestore();
                  }}
                  disabled={isRestoring}
                >
                  {isRestoring ? 'Restoring…' : 'Restore Subscription (No Charge)'}
                </Button>
              )}
              <Button variant="outline" className="w-full" onClick={() => setError(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
