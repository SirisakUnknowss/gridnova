/// <reference lib="WebWorker" />
// =====================================================================
// Custom Service Worker — injected by VitePWA (injectManifest mode)
// Handles workbox precaching + Web Push notification events
// =====================================================================
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// ── Push Notification Handler ───────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  let payload: { title?: string; body?: string; url?: string };
  try { payload = event.data.json(); }
  catch { payload = { title: 'GridNova', body: event.data.text() }; }

  event.waitUntil(
    self.registration.showNotification(payload.title ?? 'GridNova', {
      body: payload.body ?? "Today's puzzle is ready!",
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'gridnova-daily',
      data: { url: payload.url ?? '/' },
    } as NotificationOptions)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url: string = event.notification.data?.url ?? '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url === url && 'focus' in c);
      if (existing) return (existing as WindowClient).focus();
      return self.clients.openWindow(url);
    })
  );
});
