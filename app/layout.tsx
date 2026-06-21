import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import PostHogProvider from './components/PostHogProvider';
import InstallPWA from './components/InstallPWA';
import NotificationPermission from './components/NotificationPermission';
import Providers from './providers';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MemoMind — AI Learning Tracker',
  description: 'Never forget what you learn. AI-powered notes with spaced repetition.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
    shortcut: '/favicon.ico',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MemoMind',
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#09090B',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#6366f1',
          colorBackground: '#111113',
          colorInputBackground: '#1c1c1f',
          colorInputText: '#fafafa',
          colorText: '#fafafa',
          colorTextSecondary: '#a1a1aa',
          colorDanger: '#ef4444',
          colorSuccess: '#22c55e',
          colorNeutral: '#18181b',
          borderRadius: '0.5rem',
          fontFamily: 'Inter, system-ui, sans-serif',
        },
        elements: {
          // sign-in / sign-up modal
          card: 'shadow-2xl shadow-black/60',
          socialButtonsBlockButton: 'border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100',
          formButtonPrimary: 'bg-indigo-500 hover:bg-indigo-600 text-white',
          footerActionLink: 'text-indigo-400 hover:text-indigo-300',
          // UserButton popover
          userButtonPopoverCard: 'border border-zinc-800 shadow-2xl shadow-black/60',
          userButtonPopoverActionButton: 'hover:bg-zinc-800',
          userButtonPopoverActionButtonText: 'text-zinc-200',
          userButtonPopoverActionButtonIcon: 'text-zinc-400',
          userButtonPopoverFooter: 'border-t border-zinc-800/60',
          userPreviewMainIdentifier: 'text-zinc-100',
          userPreviewSecondaryIdentifier: 'text-zinc-400',
        },
      }}
    >
      <html lang="en" suppressHydrationWarning className={inter.variable}>
        <head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="icon" href="/icon-192x192.png" type="image/png" sizes="192x192" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/manifest.json" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          {/* Prevent theme flash — dark default, respect system preference */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.add('light')}else if(!t&&window.matchMedia('(prefers-color-scheme: light)').matches){document.documentElement.classList.add('light')}}catch(e){}})()`,
            }}
          />
        </head>
        <body className="antialiased">
          <Providers>
            <PostHogProvider>
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
              <InstallPWA />
              <NotificationPermission />
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'hsl(240, 6%, 6%)',
                    color: 'hsl(0, 0%, 98%)',
                    border: '1px solid hsl(240, 3.7%, 15.9%)',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontFamily: 'var(--font-inter), system-ui, sans-serif',
                  },
                  success: {
                    iconTheme: { primary: 'hsl(239, 84%, 67%)', secondary: 'hsl(0, 0%, 98%)' },
                  },
                  error: {
                    iconTheme: { primary: 'hsl(0, 72%, 51%)', secondary: 'hsl(0, 0%, 98%)' },
                  },
                }}
              />
            </PostHogProvider>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
