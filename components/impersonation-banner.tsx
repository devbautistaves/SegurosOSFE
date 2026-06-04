"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, LogOut } from "lucide-react"

interface ImpersonationData {
  startedAt: number
  aseguradora: { _id: string; nombre: string; slug?: string }
  adminUser: { email: string; name?: string }
}

const SESSION_MIN = 30 // BE firma JWT de 30min

export function ImpersonationBanner() {
  const [data, setData] = useState<ImpersonationData | null>(null)
  const [remaining, setRemaining] = useState<string>("")

  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem("impersonating")
        setData(raw ? JSON.parse(raw) : null)
      } catch { setData(null) }
    }
    read()
    window.addEventListener("storage", read)
    return () => window.removeEventListener("storage", read)
  }, [])

  useEffect(() => {
    if (!data) return
    const tick = () => {
      const elapsed = (Date.now() - data.startedAt) / 1000
      const left = Math.max(0, SESSION_MIN * 60 - elapsed)
      const m = Math.floor(left / 60)
      const s = Math.floor(left % 60)
      setRemaining(`${m}:${String(s).padStart(2, "0")}`)
    }
    tick()
    const i = setInterval(tick, 1000)
    return () => clearInterval(i)
  }, [data])

  if (!data) return null

  const stop = () => {
    if (!confirm("¿Salir de la sesión impersonada? Se va a cerrar este panel.")) return
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("aseguradora")
    localStorage.removeItem("impersonating")
    window.close()
    // Por si no fue abierta con window.open
    window.location.href = "/superadmin"
  }

  return (
    <div className="sticky top-0 z-[60] bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg">
      <div className="px-4 py-2 flex items-center gap-3 text-sm">
        <AlertTriangle className="h-4 w-4 flex-shrink-0 animate-pulse" />
        <div className="flex-1 min-w-0">
          <span className="font-bold">MODO IMPERSONACIÓN</span>
          <span className="mx-2 opacity-60">·</span>
          <span className="truncate">
            Operando como <span className="font-semibold">{data.adminUser.email}</span> en{" "}
            <span className="font-semibold">{data.aseguradora.nombre}</span>
          </span>
        </div>
        <span className="font-mono text-xs bg-black/30 px-2 py-0.5 rounded">expira en {remaining}</span>
        <button onClick={stop}
          className="px-2.5 py-1 rounded bg-white/20 hover:bg-white/30 text-xs font-semibold flex items-center gap-1">
          <LogOut className="h-3 w-3" /> Salir
        </button>
      </div>
    </div>
  )
}
