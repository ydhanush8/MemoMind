/// <reference lib="webworker" />

import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

declare global {
  interface ServiceWorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();

self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;

  try {
    const data = event.data.json() as {
      title?: string;
      body?: string;
      icon?: string;
      badge?: string;
      url?: string;
    };

    const options: NotificationOptions = {
      body: data.body ?? 'New message from MemoMind',
      icon: data.icon ?? '/icon-192x192.png',
      badge: data.badge ?? '/icon-192x192.png',
      data: { url: data.url ?? '/dashboard' },
    };

    event.waitUntil(self.registration.showNotification(data.title ?? 'MemoMind', options));
  } catch {
    // Malformed push payload — ignore
  }
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  const targetUrl: string =
    (event.notification.data as { url?: string } | null)?.url ?? '/dashboard';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList: readonly WindowClient[]) => {
        // If a tab is already on the target URL, focus it without navigating away
        const match = clientList.find(
          (c: WindowClient) =>
            new URL(c.url).pathname === new URL(targetUrl, self.location.origin).pathname,
        );
        if (match) return match.focus();
        // No matching tab — open a new window rather than hijacking an existing one
        return self.clients.openWindow(targetUrl);
      }),
  );
});
