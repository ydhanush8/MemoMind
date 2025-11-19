import Link from 'next/link';
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <span className="text-xl font-bold text-white">
              <span className="text-blue-400">Memo</span>Mind
            </span>

            <div className="flex items-center gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-slate-300 hover:text-white transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all">
                    Get Started
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
                >
                  Dashboard
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-4">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute top-40 right-0 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 blur-3xl rounded-full" />
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-blue-400 text-sm font-medium">AI-Powered Learning Platform</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Never Forget
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              What You Learn
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Transform your learning with AI-powered insights and spaced repetition.
            <br className="hidden sm:block" />
            Master any topic, retain more, achieve your goals.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-4 rounded-xl font-bold transition-all shadow-2xl shadow-blue-900/50 transform hover:scale-105">
                  Start Learning Free
                  <svg className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </SignUpButton>
              <Link href="/pricing" className="border-2 border-slate-600 hover:border-slate-500 text-white text-lg px-8 py-4 rounded-xl font-bold transition-all">
                View Pricing
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-4 rounded-xl font-bold transition-all shadow-2xl shadow-blue-900/50">
                Go to Dashboard →
              </Link>
            </SignedIn>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-slate-400 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Free to start
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Cancel anytime
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-slate-400">
              Powerful features to supercharge your learning
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 rounded-2xl p-8 transition-all hover:transform hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Smart Notes</h3>
              <p className="text-slate-400 leading-relaxed">
                Create, organize, and manage your learning notes. Track your understanding with ease.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-slate-800/50 border border-slate-700 hover:border-purple-500/50 rounded-2xl p-8 transition-all hover:transform hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">AI Analysis</h3>
              <p className="text-slate-400 leading-relaxed">
                Get instant AI feedback on your understanding. Identify gaps and improve faster.
              </p>
              <span className="inline-block mt-4 bg-purple-500/20 text-purple-400 text-xs px-3 py-1 rounded-full font-semibold">
                Premium
              </span>
            </div>

            {/* Feature 3 */}
            <div className="group bg-slate-800/50 border border-slate-700 hover:border-green-500/50 rounded-2xl p-8 transition-all hover:transform hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-green-500/50 transition-all">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Daily Practice</h3>
              <p className="text-slate-400 leading-relaxed">
                Spaced repetition flashcards. Never forget what you've learned with smart reviews.
              </p>
              <span className="inline-block mt-4 bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full font-semibold">
                Premium
              </span>
            </div>

            {/* Feature 4 */}
            <div className="group bg-slate-800/50 border border-slate-700 hover:border-pink-500/50 rounded-2xl p-8 transition-all hover:transform hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-pink-500/50 transition-all">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Track Progress</h3>
              <p className="text-slate-400 leading-relaxed">
                Monitor review counts, completion stats, and daily challenge tracker.
              </p>
              <span className="inline-block mt-4 bg-pink-500/20 text-pink-400 text-xs px-3 py-1 rounded-full font-semibold">
                Premium
              </span>
            </div>

            {/* Feature 5 */}
            <div className="group bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 rounded-2xl p-8 transition-all hover:transform hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Mobile Ready</h3>
              <p className="text-slate-400 leading-relaxed">
                Learn anywhere, anytime. Fully responsive design works on all devices.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group bg-slate-800/50 border border-slate-700 hover:border-orange-500/50 rounded-2xl p-8 transition-all hover:transform hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-orange-500/50 transition-all">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Secure & Private</h3>
              <p className="text-slate-400 leading-relaxed">
                Your data is encrypted and secure. Only you can access your learning notes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Teaser */}
      <div className="relative py-24 px-4 bg-gradient-to-b from-slate-900/50 to-slate-900">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-slate-400 mb-12">
            Start free, upgrade when you're ready
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-slate-800/50 border-2 border-slate-700 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
              <div className="text-4xl font-bold text-white mb-6">₹0</div>
              <ul className="space-y-3 text-left mb-8">
                <li className="flex items-center gap-3 text-slate-300">
                  <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Unlimited Notes
                </li>
                <li className="flex items-center gap-3 text-slate-500">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  No AI Analysis
                </li>
                <li className="flex items-center gap-3 text-slate-500">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  No Daily Practice
                </li>
              </ul>
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold transition-all">
                    Start Free
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/" className="block w-full text-center bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold transition-all">
                  Dashboard
                </Link>
              </SignedIn>
            </div>

            {/* Premium Plan */}
            <div className="relative bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-2 border-blue-500 rounded-2xl p-8">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                POPULAR
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
              <div className="text-4xl font-bold text-white mb-2">₹99<span className="text-lg text-slate-400">/mo</span></div>
              <div className="text-slate-400 text-sm mb-6">or ₹999/year (save 17%)</div>
              <ul className="space-y-3 text-left mb-8">
                <li className="flex items-center gap-3 text-white">
                  <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Everything in Free +
                </li>
                <li className="flex items-center gap-3 text-white">
                  <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  AI-Powered Analysis
                </li>
                <li className="flex items-center gap-3 text-white">
                  <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Daily Practice Cards
                </li>
                <li className="flex items-center gap-3 text-white">
                  <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Progress Tracking
                </li>
              </ul>
              <Link href="/pricing" className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all shadow-lg">
                Upgrade Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Master Your Learning?
          </h2>
          <p className="text-xl text-slate-300 mb-10">
            Join learners who never forget what they study.
          </p>
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-10 py-4 rounded-xl font-bold transition-all shadow-2xl shadow-blue-900/50 transform hover:scale-105">
                Start Free Today
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/" className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-10 py-4 rounded-xl font-bold transition-all shadow-2xl shadow-blue-900/50 transform hover:scale-105">
              Go to Dashboard
            </Link>
          </SignedIn>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-slate-400">
              <span className="font-bold text-white"><span className="text-blue-400">Memo</span>Mind</span>
              <span className="mx-2">•</span>
              &copy; 2025 All rights reserved
            </div>
            <div className="flex items-center gap-6 text-slate-400">
              <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="hover:text-white transition-colors">Sign In</button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/" className="hover:text-white transition-colors">Dashboard</Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
