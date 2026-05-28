'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { identifyUser, resetUser } from '@/app/lib/analytics';
import { useSubscription } from '@/app/hooks/useSubscription';

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { data: subscription } = useSubscription();

  useEffect(() => {
    if (!isLoaded) return;

    if (user) {
      identifyUser(user.id, {
        isPremium: subscription?.isPremium ?? false,
        createdAt: user.createdAt ? new Date(user.createdAt) : undefined,
      });
    } else {
      resetUser();
    }
  }, [user, isLoaded, subscription?.isPremium]);

  return <>{children}</>;
}
