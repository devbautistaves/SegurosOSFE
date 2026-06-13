"use client"

// Trigger del onboarding interactivo.
// - Cuando se monta, lee /api/onboarding/state.
// - Si no está completed ni skipped → abre el OnboardingWizard fullscreen.
// - Si está skipped → muestra banner discreto para reabrirlo.
// - Si está completed → no muestra nada (el botón "Reabrir tour" del header
//   sirve para reabrirlo manualmente vía `reopen-onboarding` event).
//
// El componente convive con `OnboardingTour` (driver.js) viejo. Mientras esté
// abierto el wizard nuevo, el tour viejo no aparece (compite por z-index).

import { useEffect, useState } from "react"
import { onboardingAPI, type OnboardingState } from "@/lib/api"
import { OnboardingWizard } from "./onboarding-wizard"
import { Sparkles, X } from "lucide-react"

export function OnboardingTrigger() {
  const [state, setState] = useState<OnboardingState | null>(null)
  const [open, setOpen] = useState(false)
  const [dismissedBanner, setDismissedBanner] = useState(false)

  // Cargar state al montar
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return
    onboardingAPI.state(token)
      .then(r => {
        setState(r.onboarding)
        // Auto-abrir UNA sola vez por cuenta: solo si nunca se mostró (startedAt),
        // ni se completó ni se salteó. startedAt se persiste server-side al abrir,
        // así no se reabre en otro dispositivo. Reabrir = botón (evento).
        if (!r.onboarding.completedAt && !r.onboarding.skippedAt && !r.onboarding.startedAt) {
          onboardingAPI.seen(token).catch(() => {})
          setOpen(true)
        }
      })
      .catch(() => {})
  }, [])

  // Listener para que cualquier parte del panel reabra el tour
  useEffect(() => {
    const h = async () => {
      const token = localStorage.getItem("token") || ""
      if (!token) return
      try { await onboardingAPI.reopen(token, "branding") } catch {}
      const r = await onboardingAPI.state(token).catch(() => null)
      if (r) setState(r.onboarding)
      setOpen(true)
    }
    window.addEventListener("reopen-onboarding", h)
    return () => window.removeEventListener("reopen-onboarding", h)
  }, [])

  const close = () => {
    setOpen(false)
    // Refrescamos state local
    const token = localStorage.getItem("token") || ""
    if (token) onboardingAPI.state(token).then(r => setState(r.onboarding)).catch(() => {})
  }

  if (open && state) {
    return <OnboardingWizard initialState={state} onClose={close} />
  }

  // Banner para los que skippearon
  if (state?.skippedAt && !state.completedAt && !dismissedBanner) {
    return (
      <div className="fixed bottom-4 right-4 z-40 max-w-sm rounded-xl border border-blue-500/30 bg-gradient-to-br from-slate-900 to-blue-950 shadow-2xl shadow-blue-500/10 p-4">
        <button onClick={() => setDismissedBanner(true)}
          className="absolute top-2 right-2 text-slate-500 hover:text-white">
          <X className="h-3.5 w-3.5" />
        </button>
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">¿Terminás tu setup?</p>
            <p className="text-xs text-slate-400 mt-0.5">Te quedan unos minutos para dejar el panel a tu medida.</p>
            <button onClick={() => setOpen(true)}
              className="mt-2 text-xs font-semibold text-blue-400 hover:text-blue-300">
              Continuar →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
