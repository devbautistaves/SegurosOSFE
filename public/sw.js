// Service Worker mínimo para PWA — SegurOS
// Habilita "Add to home screen" en Android e iOS sin caching agresivo.
// El FE es Next.js con SSR/SSG → fetch goes network-first y cae a cache solo
// si el cliente está offline. Los iconos sí son cache-first (estáticos).

const CACHE_VERSION = "segurosos-v1"
const STATIC_ASSETS = ["/icons/seguros-icon.svg"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const req = event.request
  if (req.method !== "GET") return
  const url = new URL(req.url)
  if (url.origin !== location.origin) return

  // Cache-first para iconos
  if (url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        const clone = res.clone()
        caches.open(CACHE_VERSION).then((c) => c.put(req, clone))
        return res
      }))
    )
    return
  }

  // Network-first con fallback a cache si el cliente está offline
  event.respondWith(fetch(req).catch(() => caches.match(req)))
})
