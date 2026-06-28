/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

declare let self: ServiceWorkerGlobalScope

// Precache static assets injected by vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json() as {
    title?: string
    body?: string
    url?: string
    tag?: string
    timestamp?: number
  }

  const title = data.title || 'Day To Us'
  const options: NotificationOptions = {
    body: data.body || '',
    icon: '/pwa-192x192.svg',
    badge: '/pwa-192x192.svg',
    tag: data.tag,
    data: { url: data.url || '/' },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Notification click handler — open or focus the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = (event.notification.data?.url as string) || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return self.clients.openWindow(url)
    })
  )
})
