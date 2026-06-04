"use client"

import { useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { driver, type Driver } from "driver.js"
import "driver.js/dist/driver.css"
import { authAPI } from "@/lib/api"

const STORAGE_KEY = "segurosos_tour_running"

export function OnboardingTour() {
  const router = useRouter()
  const pathname = usePathname()
  const driverRef = useRef<Driver | null>(null)
  const startedRef = useRef(false)

  const finish = async () => {
    sessionStorage.removeItem(STORAGE_KEY)
    driverRef.current?.destroy()
    driverRef.current = null
    const token = localStorage.getItem("token")
    if (token) {
      try { await authAPI.setOnboarding(token, false) } catch {}
    }
  }

  const startTour = (force = false) => {
    if (driverRef.current) return
    if (!force && sessionStorage.getItem(STORAGE_KEY)) return
    sessionStorage.setItem(STORAGE_KEY, "1")

    if (!pathname.startsWith("/admin")) {
      router.push("/admin")
      setTimeout(() => startTour(true), 600)
      return
    }

    const userRaw = localStorage.getItem("user")
    const user = userRaw ? JSON.parse(userRaw) : null
    const asegRaw = localStorage.getItem("aseguradora")
    const aseguradora = asegRaw ? JSON.parse(asegRaw) : null

    const d = driver({
      showProgress: true,
      allowClose: false,
      nextBtnText: "Siguiente →",
      prevBtnText: "← Atrás",
      doneBtnText: "¡Listo!",
      progressText: "Paso {{current}} de {{total}}",
      onCloseClick: finish,
      onDestroyed: () => { driverRef.current = null },
      steps: [
        {
          popover: {
            title: `¡Bienvenido a SegurOS${aseguradora?.nombre ? `, ${aseguradora.nombre}` : ""}! 🛡️`,
            description: "Te mostramos en 1 minuto cómo organizar tu cartera de seguros. Vas a poder cargar pólizas, gestionar cobranzas, registrar siniestros y mucho más.",
          },
        },
        { element: '[data-tour="nav-polizas"]',     popover: { title: "Pólizas", description: "El corazón del sistema. Cargá cada póliza con sus datos completos, asegurado, vehículo, vigencia y aseguradora." } },
        { element: '[data-tour="nav-cobranzas"]',   popover: { title: "Cobranzas", description: "Llevá el control mes a mes de cuáles cuotas se cobraron, cuáles vencieron, y enviá recordatorios por email automáticamente." } },
        { element: '[data-tour="nav-siniestros"]',  popover: { title: "Siniestros", description: "Registrá los siniestros con timeline, número, tipo y estado del trámite." } },
        { element: '[data-tour="nav-seguimiento"]', popover: { title: "Seguimiento", description: "Cargá prospectos que aún no son clientes y trackeá el avance hasta que emiten la póliza." } },
        { element: '[data-tour="nav-settings"]',    popover: { title: "Configuración", description: "Personalizá los catálogos de aseguradoras y ramos. Cada broker carga las suyas." } },
        { element: '[data-tour="nav-suscripcion"]', popover: { title: "Plan PRO 🚀", description: "Estás en plan FREE. Pasate a PRO cuando quieras para tener todo ilimitado. ¡Listo, ya podés empezar!" } },
      ],
      onDestroyStarted: () => { finish(); d.destroy() },
    })
    driverRef.current = d
    d.drive()
  }

  useEffect(() => {
    if (startedRef.current) return
    const userRaw = typeof window !== "undefined" ? localStorage.getItem("user") : null
    if (!userRaw) return
    try {
      const u = JSON.parse(userRaw)
      if (u?.onboardingPendiente) {
        startedRef.current = true
        setTimeout(() => startTour(), 800)
      }
    } catch {}
  }, [])

  useEffect(() => {
    const handler = () => startTour(true)
    window.addEventListener("segurosos:start-tour", handler)
    return () => window.removeEventListener("segurosos:start-tour", handler)
  }, [pathname])

  return null
}

export function triggerTour() {
  window.dispatchEvent(new Event("segurosos:start-tour"))
}
