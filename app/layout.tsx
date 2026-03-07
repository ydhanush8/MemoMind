import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import PostHogProvider from './components/PostHogProvider';
import InstallPWA from './components/InstallPWA';
import NotificationPermission from './components/NotificationPermission';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'MemoMind - Track Your Learning',
  description: 'AI-powered learning notes tracker to help you master any topic.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MemoMind',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="manifest" href="/manifest.json" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <meta name="theme-color" content="#3b82f6" />
        </head>
        <body className="antialiased">
          <PostHogProvider>
            {children}
            <InstallPWA />
            <NotificationPermission />
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1e293b',
                  color: '#fff',
                  border: '1px solid #334155',
                },
                success: {
                  iconTheme: {
                    primary: '#3b82f6',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
