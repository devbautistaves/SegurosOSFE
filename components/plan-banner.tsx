"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { suscripcionAPI, SuscripcionEstado } from "@/lib/api"
import { Crown, X } from "lucide-react"

const DISMISS_KEY = "segurosos_plan_banner_dismissed_at"
const REMIND_AFTER_MS = 1000 * 60 * 60 * 24 // 24h

export function PlanBanner() {
  const [estado, setEstado] = useState<SuscripcionEstado | null>(null)
  const [hidden, setHidden] = useState(true)

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0)
    if (dismissedAt && Date.now() - dismissedAt < REMIND_AFTER_MS) return
    suscripcionAPI.estado(token).then(r => {
      setEstado(r)
      setHidden(false)
    }).catch(() => {})
  }, [])

  if (hidden || !estado || estado.plan !== "FREE") return null

  const cercaLimite = (["polizas", "cobranzas", "siniestros", "usuarios"] as const).some(k => {
    const limit = estado.limites[k]
    return limit && estado.uso[k] / limit >= 0.8
  })

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setHidden(true)
  }

  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-2 text-sm ${cercaLimite ? "bg-amber-50 border-b border-amber-200" : "bg-blue-50 border-b border-blue-200"}`}>
      <div className="flex items-center gap-2 min-w-0">
        <Crown className={`h-4 w-4 flex-shrink-0 ${cercaLimite ? "text-amber-600" : "text-blue-600"}`} />
        <span className={cercaLimite ? "text-amber-900" : "text-blue-900"}>
          {cercaLimite
            ? <>Te estás acercando al límite del plan FREE. <Link href="/admin/suscripcion" className="font-semibold underline">Pasate a PRO</Link> para uso ilimitado.</>
            : <>Estás en el plan FREE. <Link href="/admin/suscripcion" className="font-semibold underline">Conocé el plan PRO</Link></>
          }
        </span>
      </div>
      <button onClick={dismiss} className="text-muted-foreground hover:text-foreground flex-shrink-0">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
