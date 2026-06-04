"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authAPI, RegisterAseguradoraData } from "@/lib/api"
import { Shield, Loader2, ArrowRight, Check } from "lucide-react"

export default function RegistroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [form, setForm] = useState<RegisterAseguradoraData>({
    aseguradoraNombre: "",
    aseguradoraTelefono: "",
    aseguradoraEmail: "",
    name: "",
    email: "",
    password: "",
  })

  const set = <K extends keyof RegisterAseguradoraData>(k: K, v: RegisterAseguradoraData[K]) =>
    setForm(prev => ({ ...prev, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    if (!form.aseguradoraNombre || !form.aseguradoraTelefono || !form.name || !form.email || !form.password) {
      setErr("Faltan campos obligatorios"); return
    }
    if (form.password.length < 6) { setErr("La contraseña debe tener al menos 6 caracteres"); return }
    setLoading(true)
    try {
      const r = await authAPI.registerAseguradora({
        ...form,
        aseguradoraEmail: form.aseguradoraEmail || form.email,
      })
      localStorage.setItem("token", r.token)
      localStorage.setItem("user", JSON.stringify(r.user))
      localStorage.setItem("aseguradora", JSON.stringify(r.aseguradora))
      router.replace("/admin")
    } catch (e: any) {
      setErr(e.message || "Error al crear la cuenta")
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
            Empezá gratis en 1 minuto. Sin tarjeta. Tu cartera, tus catálogos, tus reglas.
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

          <h2 className="text-2xl font-bold tracking-tight">Creá tu cuenta gratis</h2>
          <p className="text-sm text-muted-foreground mb-6">Tardás menos de 1 minuto. Plan FREE para siempre.</p>

          <form onSubmit={submit} className="space-y-3.5">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tu broker / agencia</label>
              <div className="space-y-2 mt-1">
                <input className="w-full h-10 rounded-md border bg-background px-3 text-sm" placeholder="Nombre del broker (ej: Pérez Seguros)" value={form.aseguradoraNombre} onChange={e => set("aseguradoraNombre", e.target.value)} required />
                <input className="w-full h-10 rounded-md border bg-background px-3 text-sm" type="tel" placeholder="Teléfono del broker" value={form.aseguradoraTelefono} onChange={e => set("aseguradoraTelefono", e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tu usuario admin</label>
              <div className="space-y-2 mt-1">
                <input className="w-full h-10 rounded-md border bg-background px-3 text-sm" placeholder="Tu nombre" value={form.name} onChange={e => set("name", e.target.value)} required autoComplete="name" />
                <input className="w-full h-10 rounded-md border bg-background px-3 text-sm" type="email" placeholder="Tu email" value={form.email} onChange={e => set("email", e.target.value)} required autoComplete="email" />
                <input className="w-full h-10 rounded-md border bg-background px-3 text-sm" type="password" placeholder="Contraseña (mín 6 caracteres)" value={form.password} onChange={e => set("password", e.target.value)} required minLength={6} autoComplete="new-password" />
              </div>
            </div>

            {err && <p className="text-sm text-red-600">{err}</p>}

            <button type="submit" disabled={loading} className="w-full h-11 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Crear cuenta gratis <ArrowRight className="h-4 w-4" /></>}
            </button>

            <p className="text-xs text-center text-muted-foreground">
              ¿Ya tenés cuenta? <Link href="/login" className="text-blue-600 font-medium hover:underline">Iniciar sesión</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
