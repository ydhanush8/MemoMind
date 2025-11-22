// PostHog initialization for Next.js 15 App Router
import posthog from 'posthog-js';

if (typeof window !== 'undefined') {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (posthogKey && posthogHost) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      person_profiles: 'identified_only', // Only create profiles for identified users
      capture_pageview: true, // Automatic page view tracking
      capture_pageleave: true, // Track when users leave
      session_recording: {
        maskAllInputs: false, // Don't mask inputs (we're privacy-safe)
        recordCrossOriginIframes: false,
      },
      autocapture: {
        dom_event_allowlist: ['click'], // Only auto-capture clicks
        url_allowlist: [], // Track all URLs
        element_allowlist: ['button', 'a'], // Only track buttons and links
      },
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('PostHog initialized');
          posthog.debug(); // Enable debug mode in development
        }
      },
    });
  } else if (process.env.NODE_ENV === 'development') {
    console.warn('PostHog not initialized: Missing API key or host');
  }
}

export default posthog;
