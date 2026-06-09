"use client"

// Registra el Service Worker e inyecta el manifest solo en las rutas donde se
// monta este componente (montado en `/admin/layout.tsx` y no en la landing).
//
// Sin esto el navegador NO dispara `beforeinstallprompt`, así que
// <InstallAppPrompt /> nunca se activa en Android. La landing pública
// queda intacta — no aparece "Instalar app" hasta que el broker está logueado.

import { useEffect } from "react"

export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return

    const manifestHref = "/manifest-seguros.webmanifest"
    const iconHref = "/icons/seguros-icon.svg"
    const appTitle = "SegurOS"
    const themeColor = "#0f172a"

    // Limpieza preventiva (si por algún motivo hubiera tags pegados de otra ruta)
    document.querySelectorAll("[data-pwa]").forEach(el => el.remove())

    const add = (tag: "link" | "meta", attrs: Record<string, string>) => {
      const el = document.createElement(tag)
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
      el.setAttribute("data-pwa", "true")
      document.head.appendChild(el)
    }

    add("link", { rel: "manifest", href: manifestHref })
    add("meta", { name: "theme-color", content: themeColor })

    // iOS Safari: las metas viejas siguen siendo las que hacen el "Add to Home Screen" pulido.
    add("meta", { name: "apple-mobile-web-app-capable", content: "yes" })
    add("meta", { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" })
    add("meta", { name: "apple-mobile-web-app-title", content: appTitle })
    add("link", { rel: "apple-touch-icon", href: iconHref })
    add("link", { rel: "icon", type: "image/svg+xml", href: iconHref })

    // SW solo en producción (en dev con next dev a veces interfiere con HMR)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // silently fail: la app sigue funcionando aunque no se instale
      })
    }

    // ── Auto-recovery ante chunk mismatch ───────────────────────────────
    // Cuando se publica un deploy nuevo, los chunks JS cambian de hash. Si
    // el browser tiene un HTML viejo (de la pestaña ya abierta) y pide un
    // chunk con hash viejo, Next dispara "Loading chunk X failed" o
    // "Cannot read properties of undefined (reading 'key')" al hidratar.
    // Solución: detectarlo y recargar fuerte una sola vez.
    const onChunkError = (msg: string) => {
      if (typeof window === "undefined") return
      const k = "_chunk_reload_done"
      if (sessionStorage.getItem(k)) return // ya recargamos una vez en esta sesión, evitamos loop
      const looksLikeChunkError =
        msg.includes("Loading chunk") ||
        msg.includes("ChunkLoadError") ||
        msg.includes("Failed to fetch dynamically imported module") ||
        msg.includes("undefined (reading 'key')")
      if (!looksLikeChunkError) return
      sessionStorage.setItem(k, "1")
      // Limpia cache del browser y SW antes de recargar.
      if ("caches" in window) caches.keys().then(ks => ks.forEach(k => caches.delete(k)))
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()))
      }
      window.location.reload()
    }
    const errHandler = (e: ErrorEvent) => onChunkError(e.message || "")
    const rejHandler = (e: PromiseRejectionEvent) => onChunkError(String(e.reason?.message || e.reason || ""))
    window.addEventListener("error", errHandler)
    window.addEventListener("unhandledrejection", rejHandler)
    const teardown = () => {
      window.removeEventListener("error", errHandler)
      window.removeEventListener("unhandledrejection", rejHandler)
    }

    return () => {
      // Al salir de /admin (logout, navegar a /, etc.) limpiamos los tags PWA.
      // No removemos el SW registrado — sigue corriendo y la app instalada sigue
      // siendo "instalable" hasta que el usuario la cierre.
      document.querySelectorAll("[data-pwa]").forEach(el => el.remove())
      teardown()
    }
  }, [])

  return null
}
