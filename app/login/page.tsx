"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { authAPI } from "@/lib/api"
import { Shield, Loader2, ArrowRight, Check } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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
      const role = r.user.role
      router.replace(role === "admin" || role === "admin_seguros" ? "/admin" : "/seller")
    } catch (e: any) {
      setErr(e?.message || "Credenciales incorrectas")
    } finally { setLoading(false) }
  }

  const beneficios = [
    "Pólizas, cobranzas y siniestros ilimitados (plan PRO)",
    "Multi-usuario con roles y permisos",
    "Notificaciones automáticas de vencimientos",
    "Catálogos de aseguradoras y ramos personalizables",
    "Dashboard con métricas en tiempo real",
  ]

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-slate-950 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 40%)" }} />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">SegurOS</span>
        </div>
        <div className="relative space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            El CRM para brokers<br />de seguros que crecen.
          </h1>
          <p className="text-lg text-white/70 max-w-md">
            Entrá a tu cuenta y seguí gestionando tu cartera donde la dejaste.
          </p>
          <ul className="space-y-2.5">
            {beneficios.map(b => (
              <li key={b} className="flex items-start gap-2.5 text-sm text-white/80">
                <Check className="h-5 w-5 flex-shrink-0 text-blue-400 mt-0.5" />
                {b}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/40">© {new Date().getFullYear()} SegurOS — by TusVentas.</p>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">SegurOS</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight">Iniciá sesión</h2>
          <p className="text-sm text-muted-foreground mb-6">Ingresá con tu email y contraseña.</p>

          <form onSubmit={submit} className="space-y-3.5">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</label>
              <input
                className="mt-1 w-full h-10 rounded-md border bg-background px-3 text-sm"
                type="email"
                placeholder="vos@broker.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contraseña</label>
              <input
                className="mt-1 w-full h-10 rounded-md border bg-background px-3 text-sm"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {err && <p className="text-sm text-red-600">{err}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Ingresar <ArrowRight className="h-4 w-4" /></>}
            </button>

            <p className="text-xs text-center text-muted-foreground">
              ¿No tenés cuenta?{" "}
              <Link href="/registro" className="text-blue-600 font-medium hover:underline">
                Creá tu broker gratis
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
