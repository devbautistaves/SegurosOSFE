"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { saAuth } from "@/lib/superadmin-api"
import { Shield, Loader2, Lock, AlertTriangle } from "lucide-react"

export default function SuperAdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await saAuth.requestOTP(email.trim(), password)
      localStorage.setItem("superadmin_pending_token", res.pendingToken)
      localStorage.setItem("superadmin_otp_sent_to", res.sentTo)
      router.push("/superadmin/otp")
    } catch (e: any) {
      setError(e.message || "Error de autenticación")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Glow rojo de fondo */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/30">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-[0.3em] text-red-400">SEGUROS</div>
              <div className="text-xl font-black tracking-wider">SUPERADMIN</div>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-2xl">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 mb-6">
            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-200">
              Acceso restringido. Tu solicitud queda registrada en el audit log.
              Si no sos personal autorizado, salí de esta página.
            </p>
          </div>

          <h1 className="text-xl font-bold mb-1">Acceso interno</h1>
          <p className="text-sm text-slate-400 mb-6">Solo dueños y operadores de SegurOS.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <input
                type="email" autoFocus required
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-3 py-2.5 bg-black/30 border border-white/10 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Contraseña</label>
              <input
                type="password" required
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2.5 bg-black/30 border border-white/10 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}

            <button
              type="submit" disabled={loading || !email || !password}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {loading ? "Verificando..." : "Continuar con 2FA"}
            </button>

            <p className="text-[11px] text-slate-500 text-center pt-2">
              Se enviará un código de 6 dígitos a tu email.
            </p>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          © SegurOS · Panel interno
        </p>
      </div>
    </div>
  )
}
