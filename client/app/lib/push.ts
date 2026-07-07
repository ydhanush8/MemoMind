'use client';

import { apiFetch } from '@/app/lib/api';

export type EnableResult =
  | { ok: true }
  | { ok: false; reason: 'unsupported' | 'unconfigured' | 'denied' | 'sw-timeout' | 'error' };

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from(rawData, (c) => c.charCodeAt(0));
}

function isSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export type PushEnv = 'ready' | 'ios-needs-install' | 'unsupported';

/** Whether push CAN work here, or why it can't (iOS needs the installed PWA). */
export function pushEnvironment(): PushEnv {
  if (isSupported()) return 'ready';
  if (typeof window === 'undefined') return 'unsupported';

  const ua = navigator.userAgent || '';
  const isIOS =
    /iphone|ipad|ipod/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isStandalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;

  // iOS Safari tabs expose no PushManager — must install to Home Screen first.
  if (isIOS && !isStandalone) return 'ios-needs-install';
  return 'unsupported';
}

// navigator.serviceWorker.ready never resolves when no SW is registered
// (e.g. dev, where serwist is disabled) — race it so callers don't hang.
async function readyRegistration(timeoutMs: number): Promise<ServiceWorkerRegistration | null> {
  try {
    return await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);
  } catch {
    return null;
  }
}

/** Whether THIS browser/device currently holds an active push subscription. */
export async function getThisDeviceSubscription(): Promise<PushSubscription | null> {
  if (!isSupported()) return null;
  const reg = await readyRegistration(3000);
  if (!reg) return null;
  try {
    return await reg.pushManager.getSubscription();
  } catch {
    return null;
  }
}

/** Subscribe THIS device and register its endpoint with the server. */
export async function enableThisDevice(): Promise<EnableResult> {
  if (!isSupported()) return { ok: false, reason: 'unsupported' };

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) return { ok: false, reason: 'unconfigured' };

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return { ok: false, reason: 'denied' };

  const reg = await readyRegistration(8000);
  if (!reg) return { ok: false, reason: 'sw-timeout' };

  try {
    const existing = await reg.pushManager.getSubscription();
    const sub =
      existing ??
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      }));

    const res = await apiFetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub),
    });
    if (!res.ok) return { ok: false, reason: 'error' };
    return { ok: true };
  } catch {
    return { ok: false, reason: 'error' };
  }
}

/** Turn notifications off for THIS device only (server + local). */
export async function disableThisDevice(): Promise<boolean> {
  const sub = await getThisDeviceSubscription();
  try {
    await apiFetch('/api/notifications/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub?.endpoint ? { endpoint: sub.endpoint } : {}),
    });
  } catch {
    return false;
  }
  if (sub) {
    try {
      await sub.unsubscribe();
    } catch {
      /* server record already removed — local cleanup is best-effort */
    }
  }
  return true;
}

export function enableErrorMessage(reason: Exclude<EnableResult, { ok: true }>['reason']): string {
  switch (reason) {
    case 'unsupported':
      return 'Push notifications are not supported in this browser.';
    case 'unconfigured':
      return 'Push notifications are not configured.';
    case 'denied':
      return 'Notification permission denied. Enable it in your browser settings.';
    case 'sw-timeout':
      return process.env.NODE_ENV === 'development'
        ? 'Run `next build && next start` to test push notifications locally.'
        : 'Notifications unavailable right now. Try refreshing the page.';
    default:
      return 'Failed to enable notifications. Please try again.';
  }
}
