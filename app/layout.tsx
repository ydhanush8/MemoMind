import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import InstallPWA from './components/InstallPWA';
import NotificationPermission from './components/NotificationPermission';
import Providers from './providers';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'MemoMind — AI Learning Tracker',
  description: 'Never forget what you learn. AI-powered notes with spaced repetition.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
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
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#121316' },
    { media: '(prefers-color-scheme: light)', color: '#F7F5F0' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#cd7a4f',
          colorBackground: '#191b1e',
          colorInputBackground: '#23262b',
          colorInputText: '#f0ece3',
          colorText: '#f0ece3',
          colorTextSecondary: '#9aa0a8',
          colorDanger: '#e05656',
          colorSuccess: '#3fae74',
          colorNeutral: '#23262b',
          borderRadius: '0.75rem',
          fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
        },
        elements: {
          card: 'shadow-2xl shadow-black/60',
          formButtonPrimary: 'bg-[#cd7a4f] hover:bg-[#c26e42] text-[#1a120c] font-semibold',
          footerActionLink: 'text-[#d98a5f] hover:text-[#e5a077]',
          userButtonPopoverCard: 'shadow-2xl shadow-black/60',
        },
      }}
    >
      <html lang="en" suppressHydrationWarning className={jakarta.variable}>
        <head>
          <link rel="icon" href="/icon.svg" type="image/svg+xml" />
          <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
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
            <ErrorBoundary>{children}</ErrorBoundary>
            <InstallPWA />
            <NotificationPermission />
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  boxShadow: 'var(--elevation-3)',
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-sans), system-ui, sans-serif',
                  padding: '10px 14px',
                },
                success: {
                  iconTheme: {
                    primary: 'hsl(var(--primary))',
                    secondary: 'hsl(var(--primary-foreground))',
                  },
                },
                error: {
                  iconTheme: {
                    primary: 'hsl(var(--destructive))',
                    secondary: 'hsl(var(--destructive-foreground))',
                  },
                },
              }}
            />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
