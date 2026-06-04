"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { saAuth } from "@/lib/superadmin-api"
import { Lock, Loader2, AlertTriangle, Check, Eye, EyeOff } from "lucide-react"

export default function ChangePasswordPage() {
  const router = useRouter()
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!localStorage.getItem("superadmin_token")) router.replace("/superadmin/login")
  }, [router])

  const score = (() => {
    let s = 0
    if (next.length >= 10) s++
    if (next.length >= 14) s++
    if (/[A-Z]/.test(next)) s++
    if (/[0-9]/.test(next)) s++
    if (/[^A-Za-z0-9]/.test(next)) s++
    return s
  })()

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (next.length < 10) return setError("Mínimo 10 caracteres")
    if (next !== confirm) return setError("Las contraseñas no coinciden")
    setLoading(true)
    try {
      await saAuth.changePassword(current, next)
      router.replace("/superadmin")
    } catch (e: any) {
      setError(e.message || "Error al cambiar contraseña")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Lock className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Cambiá tu contraseña</h1>
              <p className="text-xs text-slate-400">Tu contraseña actual es temporal.</p>
            </div>
          </div>

          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Contraseña actual</label>
              <input
                type={showPass ? "text" : "password"} required autoFocus
                value={current} onChange={e => setCurrent(e.target.value)}
                className="w-full px-3 py-2.5 bg-black/30 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Nueva contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"} required
                  value={next} onChange={e => setNext(e.target.value)}
                  className="w-full px-3 py-2.5 bg-black/30 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50 pr-10"
                />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* strength bar */}
              <div className="flex gap-1 mt-2">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full ${
                    i < score ? (score <= 2 ? "bg-red-500" : score <= 3 ? "bg-amber-500" : "bg-emerald-500") : "bg-white/10"
                  }`} />
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Mínimo 10 caracteres. Recomendado: + mayúscula + número + símbolo.
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirmar nueva contraseña</label>
              <input
                type={showPass ? "text" : "password"} required
                value={confirm} onChange={e => setConfirm(e.target.value)}
                className="w-full px-3 py-2.5 bg-black/30 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {loading ? "Guardando..." : "Cambiar contraseña"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
