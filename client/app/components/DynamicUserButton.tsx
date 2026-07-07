'use client';

import dynamic from 'next/dynamic';

/**
 * Clerk's UserButton causes a hydration mismatch when pre-rendered on the
 * server because ClerkHostRenderer mounts an empty DOM node server-side and
 * fills it client-side. Wrapping with ssr:false prevents pre-rendering so
 * React never tries to hydrate a mismatched node.
 */
export const DynamicUserButton = dynamic(
  () => import('@clerk/nextjs').then((mod) => ({ default: mod.UserButton })),
  {
    ssr: false,
    loading: () => <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />,
  },
);
