'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { identifyUser, resetUser } from '@/app/lib/analytics';

/**
 * PostHog Provider - Identifies users with Clerk
 * Add this to your root layout
 */
export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        // User is signed in - identify them
        identifyUser(user.id, {
          isPremium: false, // Will be updated when subscription status is checked
          createdAt: user.createdAt ? new Date(user.createdAt) : undefined,
        });
      } else {
        // User is signed out - reset
        resetUser();
      }
    }
  }, [user, isLoaded]);

  return <>{children}</>;
}
