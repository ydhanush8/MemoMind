'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';

export default function NotificationPermission() {
  const { user } = useUser();
  const [showPrompt, setShowPrompt] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if user has already interacted in this session
    const hasInteracted = sessionStorage.getItem('memoMind_notification_prompt_hidden');
    if (hasInteracted === 'true') {
      setShowPrompt(false);
      setChecking(false);
      return;
    }
    checkSubscriptionStatus();
  }, [user]);

  const hidePromptPermanently = () => {
    sessionStorage.setItem('memoMind_notification_prompt_hidden', 'true');
    setShowPrompt(false);
  };

  const checkSubscriptionStatus = async () => {
    if (!user) {
      setChecking(false);
      return;
    }

    try {
      const response = await fetch('/api/notifications/subscribe');
      if (!response.ok) throw new Error('API failed');

      const data = await response.json();
      
      if (data.subscribed) {
        setSubscribed(true);
        setShowPrompt(false);
      } else {
        // Only show prompt after 5 seconds if not already hidden
        setTimeout(() => {
          const stillHidden = sessionStorage.getItem('memoMind_notification_prompt_hidden');
          if (stillHidden !== 'true') {
            setShowPrompt(true);
          }
        }, 5000);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setChecking(false);
    }
  };

  const requestPermission = async () => {
    try {
      if (!('Notification' in window)) {
        toast.error('Your browser does not support notifications');
        hidePromptPermanently();
        return;
      }

      if (!('serviceWorker' in navigator)) {
        toast.error('Service Worker not supported');
        hidePromptPermanently();
        return;
      }

      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        toast.error('Notification permission denied. You can enable it later in settings.');
        hidePromptPermanently();
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      if (response.ok) {
        setSubscribed(true);
        hidePromptPermanently();
        
        // Use registration.showNotification for better reliability
        registration.showNotification('MemoMind Notifications Enabled!', {
          body: "We'll remind you about your daily practice 🎉",
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
        });
      } else {
        throw new Error('Server returned error');
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      toast.error('Failed to enable notifications. Please try again.');
      hidePromptPermanently(); 
    }
  };

  if (checking || !showPrompt || subscribed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-slate-800 border border-blue-500 rounded-lg p-4 shadow-lg z-50 animate-fadeIn">
      <button
        onClick={hidePromptPermanently}
        className="absolute top-2 right-2 text-slate-400 hover:text-white"
      >
        ✕
      </button>

      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-1">🔔 Enable Daily Reminders?</h3>
          <p className="text-slate-300 text-sm">
            Get notified about your daily practice and never break your streak!
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={requestPermission}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
        >
          Enable
        </button>
        <button
          onClick={hidePromptPermanently}
          className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
        >
          Later
        </button>
      </div>
    </div>
  );
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
