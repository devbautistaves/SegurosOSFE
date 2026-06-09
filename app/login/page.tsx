"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { authAPI } from "@/lib/api"
import { Shield, Loader2, ArrowRight, Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    if (!email || !password) { setErr("Email y contraseña son obligatorios"); return }
    setLoading(true)
    try {
      const r = await authAPI.loginMT(email, password)
      localStorage.setItem("token", r.token)
      localStorage.setItem("user", JSON.stringify(r.user))
      if (r.aseguradora) localStorage.setItem("aseguradora", JSON.stringify(r.aseguradora))
      localStorage.setItem("selectedCompanyId", "seguros")
      toast({ title: "Bienvenido", description: `Hola ${r.user.name}!` })
      const role = String(r.user.role)
      router.replace(role === "admin" || role === "admin_seguros" ? "/admin" : "/seller")
    } catch (e: any) {
      setErr(e?.message || "Credenciales incorrectas")
    } finally { setLoading(false) }
  }

  return (
    <AuthShell>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">SegurOS</span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-7 shadow-2xl shadow-black/40">
          <h2 className="text-2xl font-bold tracking-tight text-white text-center">Iniciá sesión</h2>
          <p className="text-sm text-slate-400 mb-6 text-center">Ingresá con tu email y contraseña.</p>

          <form onSubmit={submit} className="space-y-4">
            <Field icon={<Mail className="h-4 w-4" />} label="Email">
              <input
                className={inputCls}
                type="email"
                placeholder="vos@broker.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </Field>

            <Field icon={<Lock className="h-4 w-4" />} label="Contraseña">
              <input
                className={inputCls + " pr-10"}
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </Field>

            {err && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{err}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Ingresar <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          {/* Separador */}
          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[11px] uppercase tracking-widest text-slate-500">o</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* CTA registro destacado */}
          <Link href="/registro"
            className="group w-full h-11 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-semibold transition-all flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" />
            Creá gratis tu panel de seguros
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <p className="text-[11px] text-center text-slate-500 mt-2">7 días de prueba · sin tarjeta</p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">© {new Date().getFullYear()} SegurOS — by TusVentas.</p>
      </div>
    </AuthShell>
  )
}

// ── Shell tecnológico compartido ──────────────────────────────────────────────
const inputCls = "w-full h-11 rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-colors"

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">{label}</label>
      <div className="relative mt-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>
        {children}
      </div>
    </div>
  )
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-slate-950 overflow-hidden">
      {/* Fondo decorativo tech */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 opacity-[0.15]" style={{
          backgroundImage: "linear-gradient(to right, rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.12) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 40%, #000 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 40%, #000 30%, transparent 100%)",
        }} />
        <div className="absolute -top-40 -left-32 h-[34rem] w-[34rem] rounded-full bg-blue-600/25 blur-[120px]" />
        <div className="absolute -bottom-40 -right-32 h-[34rem] w-[34rem] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[26rem] w-[40rem] rounded-full bg-purple-600/10 blur-[140px]" />
      </div>
      <div className="relative z-10 w-full flex justify-center">{children}</div>
    </div>
  )
}
