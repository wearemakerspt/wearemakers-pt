// WEAREMAKERS.PT — Service Worker
// Handles push notifications and PWA caching

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))

// ── Push notification handler ──────────────────────────────
self.addEventListener('push', event => {
  if (!event.data) return

  const data = event.data.json()
  const { title, body, url, icon } = data

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: icon || '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: url || '/' },
      tag: 'wam-checkin',
      renotify: true,
      requireInteraction: false,
      vibrate: [100, 50, 100],
    })
  )
})

// ── Notification click — open the brand page ───────────────
self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clients => {
        // Focus existing window if open
        for (const client of clients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus()
            client.navigate(url)
            return
          }
        }
        // Open new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(url)
        }
      })
  )
})
