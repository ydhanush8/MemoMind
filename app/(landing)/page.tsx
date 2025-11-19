import Link from 'next/link';
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/10 blur-3xl rounded-full" />

        {/* Navigation */}
        <nav className="relative border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
                <span className="text-xl font-bold text-white">
                  Memo<span className="text-blue-400">Mind</span>
                </span>
              </div>

              <div className="flex items-center gap-4">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="text-slate-300 hover:text-white transition-colors px-4 py-2">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all shadow-lg shadow-blue-900/50">
                      Get Started
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link
                    href="/dashboard"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all shadow-lg shadow-blue-900/50"
                  >
                    Go to Dashboard
                  </Link>
                </SignedIn>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Master Any Topic with
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {' '}
                AI-Powered{' '}
              </span>
              Learning Notes
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Track your learning journey, get instant AI feedback, and never forget what
              you&apos;ve learned with intelligent spaced repetition.
            </p>

            <div className="flex gap-4 justify-center">
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-lg transition-all shadow-xl shadow-blue-900/50 transform hover:scale-105">
                    Start Learning Free
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-lg transition-all shadow-xl shadow-blue-900/50 transform hover:scale-105 inline-block"
                >
                  Go to Dashboard
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-16">
            Everything You Need to Learn Better
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Smart Notes</h3>
              <p className="text-slate-400">
                Create learning notes with topics and your understanding. Organize all your
                knowledge in one place.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 hover:border-purple-500/50 transition-all">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-purple-400"
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
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI Analysis</h3>
              <p className="text-slate-400">
                Get instant feedback on your understanding. AI identifies gaps and suggests what to
                learn next.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 hover:border-green-500/50 transition-all">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Daily Practice</h3>
              <p className="text-slate-400">
                Test your memory with daily random recalls. Prevent forgetting through spaced
                repetition.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Coming Soon</h2>
            <p className="text-slate-400">Features we&apos;re building for you</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <span className="text-yellow-400">🎯</span>
                Spaced Repetition
              </h4>
              <p className="text-slate-400 text-sm">
                Intelligent review scheduling based on forgetting curves
              </p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <span className="text-yellow-400">📊</span>
                Progress Analytics
              </h4>
              <p className="text-slate-400 text-sm">
                Track your learning journey with detailed insights
              </p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <span className="text-yellow-400">🤝</span>
                Study Groups
              </h4>
              <p className="text-slate-400 text-sm">
                Collaborate with others learning the same topics
              </p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <span className="text-yellow-400">🎙️</span>
                Voice Notes
              </h4>
              <p className="text-slate-400 text-sm">
                Record your thoughts and automatically convert to text
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Your Learning?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of learners mastering new skills every day.
          </p>

          <SignedOut>
            <SignUpButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-lg transition-all shadow-xl shadow-blue-900/50 transform hover:scale-105">
                Get Started for Free
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-lg transition-all shadow-xl shadow-blue-900/50 transform hover:scale-105 inline-block"
            >
              Go to Dashboard
            </Link>
          </SignedIn>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
          <p>&copy; 2025 MemoMind. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
