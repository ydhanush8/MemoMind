'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminAnalyticsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      // Check if user is admin (you can customize this check)
      // Option 1: Check Clerk metadata
      const isAdmin = user?.publicMetadata?.role === 'admin';
      
      // Option 2: Check specific user ID
      // const isAdmin = user?.id === 'your-admin-user-id';
      
      if (!isAdmin) {
        router.push('/'); // Redirect non-admins
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, isLoaded, router]);

  if (!isLoaded || !isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-4"
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

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">📊 Analytics Dashboard</h1>
              <p className="text-slate-400">Admin-only analytics and insights</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Total Users</span>
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-white">Loading...</div>
            <p className="text-xs text-slate-500 mt-1">All time</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Premium Users</span>
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-white">Loading...</div>
            <p className="text-xs text-slate-500 mt-1">Active subscriptions</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Notes Created</span>
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-white">Loading...</div>
            <p className="text-xs text-slate-500 mt-1">Total count</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Conversion Rate</span>
              <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-white">Loading...</div>
            <p className="text-xs text-slate-500 mt-1">Free → Premium</p>
          </div>
        </div>

        {/* PostHog Embedded Dashboard */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">PostHog Analytics</h2>
          
          <div className="space-y-4">
            <div className="bg-slate-900/50 rounded-lg p-6 text-center">
              <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">View Full Analytics</h3>
              <p className="text-slate-400 mb-4">
                Access detailed analytics, funnels, and session replays in PostHog
              </p>
              <a
                href={`https://app.posthog.com/project/${process.env.NEXT_PUBLIC_POSTHOG_KEY?.split('_')[1]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all"
              >
                Open PostHog Dashboard
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            {/* Quick Links */}
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <a
                href="https://app.posthog.com/insights"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-900/50 hover:bg-slate-900 border border-slate-700 rounded-lg p-4 transition-all"
              >
                <h4 className="font-semibold text-white mb-1">📈 Insights</h4>
                <p className="text-sm text-slate-400">View trends and graphs</p>
              </a>

              <a
                href="https://app.posthog.com/funnels"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-900/50 hover:bg-slate-900 border border-slate-700 rounded-lg p-4 transition-all"
              >
                <h4 className="font-semibold text-white mb-1">🎯 Funnels</h4>
                <p className="text-sm text-slate-400">Conversion analysis</p>
              </a>

              <a
                href="https://app.posthog.com/replay"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-900/50 hover:bg-slate-900 border border-slate-700 rounded-lg p-4 transition-all"
              >
                <h4 className="font-semibold text-white mb-1">🎬 Replays</h4>
                <p className="text-sm text-slate-400">Watch user sessions</p>
              </a>
            </div>
          </div>
        </div>

        {/* Key Metrics Guide */}
        <div className="mt-8 bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">📊 Recommended Metrics to Track</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-blue-400 mb-3">Acquisition</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  Sign-ups per day/week/month
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  Traffic sources
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  Landing page conversion
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-blue-400 mb-3">Engagement</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  DAU / WAU / MAU
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  Notes created per user
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  AI analyses per user
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-blue-400 mb-3">Retention</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  Day 1, 7, 30 retention
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  Weekly retention cohorts
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  Churn rate
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-blue-400 mb-3">Revenue</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  Conversion rate (Free → Premium)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  MRR (Monthly Recurring Revenue)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  Average subscription lifetime
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
