"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authAPI, RegisterAseguradoraData } from "@/lib/api"
import { AuthShell } from "../login/page"
import {
  Shield, Loader2, ArrowRight, ArrowLeft, Check, Building2, User, Mail, Lock,
  Eye, EyeOff, Sparkles, Phone, Palette, FileText, CreditCard,
} from "lucide-react"

const PASOS = [
  { key: "broker",  titulo: "¿Cómo se llama tu broker?", sub: "Lo vas a poder personalizar con tu logo y color después." },
  { key: "usuario", titulo: "Creá tu usuario admin",      sub: "Con esta cuenta vas a entrar y administrar todo." },
  { key: "listo",   titulo: "¡Último paso!",              sub: "Aceptá los términos y arrancamos tu setup." },
] as const

const inputCls = "w-full h-11 rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-colors"

export default function RegistroPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [showPass, setShowPass] = useState(false)
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [form, setForm] = useState<RegisterAseguradoraData>({
    aseguradoraNombre: "", aseguradoraTelefono: "", aseguradoraEmail: "",
    name: "", email: "", password: "",
  })
  const set = <K extends keyof RegisterAseguradoraData>(k: K, v: RegisterAseguradoraData[K]) =>
    setForm(prev => ({ ...prev, [k]: v }))

  const validar = (s: number): string | null => {
    if (s === 0) {
      if (!form.aseguradoraNombre.trim()) return "Indicá el nombre de tu broker"
      if (!form.aseguradoraTelefono.trim()) return "Indicá un teléfono de contacto"
    }
    if (s === 1) {
      if (!form.name.trim()) return "Tu nombre es obligatorio"
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Email inválido"
      if (form.password.length < 6) return "La contraseña debe tener al menos 6 caracteres"
    }
    return null
  }

  const next = () => {
    const v = validar(step)
    if (v) { setErr(v); return }
    setErr(null)
    setStep(s => Math.min(s + 1, PASOS.length - 1))
  }
  const back = () => { setErr(null); setStep(s => Math.max(0, s - 1)) }

  const submit = async () => {
    if (!aceptaTerminos) { setErr("Tenés que aceptar los Términos y Condiciones"); return }
    setErr(null); setLoading(true)
    try {
      const r = await authAPI.registerAseguradora({
        ...form,
        aseguradoraEmail: form.aseguradoraEmail || form.email,
        terminosAceptados: true,
      } as any)
      localStorage.setItem("token", r.token)
      localStorage.setItem("user", JSON.stringify(r.user))
      localStorage.setItem("aseguradora", JSON.stringify(r.aseguradora))
      router.replace("/admin")
    } catch (e: any) {
      setErr(e.message || "Error al crear la cuenta")
    } finally { setLoading(false) }
  }

  const current = PASOS[step]

  return (
    <AuthShell>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">SegurOS</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-7 shadow-2xl shadow-black/40">
          {/* Progreso */}
          <div className="flex items-center gap-2 mb-5">
            {PASOS.map((p, i) => (
              <div key={p.key} className="flex-1 flex items-center gap-2">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${
                  i < step ? "bg-emerald-500 text-white" :
                  i === step ? "bg-blue-500 text-white ring-4 ring-blue-500/25" :
                  "bg-white/5 text-slate-500 border border-white/10"
                }`}>
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                {i < PASOS.length - 1 && <div className={`flex-1 h-px ${i < step ? "bg-emerald-500/50" : "bg-white/10"}`} />}
              </div>
            ))}
          </div>

          <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-widest">Paso {step + 1} de {PASOS.length}</p>
          <h2 className="text-xl font-bold tracking-tight text-white mt-0.5">{current.titulo}</h2>
          <p className="text-sm text-slate-400 mb-5">{current.sub}</p>

          {/* Paso 0 — broker */}
          {step === 0 && (
            <div className="space-y-3">
              <Field icon={<Building2 className="h-4 w-4" />} label="Nombre del broker / agencia">
                <input className={inputCls} placeholder="Ej: Pérez Seguros" value={form.aseguradoraNombre}
                  onChange={e => set("aseguradoraNombre", e.target.value)} autoFocus
                  onKeyDown={e => e.key === "Enter" && next()} />
              </Field>
              <Field icon={<Phone className="h-4 w-4" />} label="Teléfono de contacto">
                <input className={inputCls} type="tel" placeholder="Ej: 11 5888 3022" value={form.aseguradoraTelefono}
                  onChange={e => set("aseguradoraTelefono", e.target.value)}
                  onKeyDown={e => e.key === "Enter" && next()} />
              </Field>
            </div>
          )}

          {/* Paso 1 — usuario */}
          {step === 1 && (
            <div className="space-y-3">
              <Field icon={<User className="h-4 w-4" />} label="Tu nombre">
                <input className={inputCls} placeholder="Juan Pérez" value={form.name}
                  onChange={e => set("name", e.target.value)} autoFocus autoComplete="name"
                  onKeyDown={e => e.key === "Enter" && next()} />
              </Field>
              <Field icon={<Mail className="h-4 w-4" />} label="Tu email">
                <input className={inputCls} type="email" placeholder="vos@broker.com" value={form.email}
                  onChange={e => set("email", e.target.value)} autoComplete="email"
                  onKeyDown={e => e.key === "Enter" && next()} />
              </Field>
              <Field icon={<Lock className="h-4 w-4" />} label="Contraseña">
                <input className={inputCls + " pr-10"} type={showPass ? "text" : "password"} placeholder="Mín. 6 caracteres"
                  value={form.password} onChange={e => set("password", e.target.value)} autoComplete="new-password"
                  onKeyDown={e => e.key === "Enter" && next()} />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </Field>
            </div>
          )}

          {/* Paso 2 — confirmar */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-1.5 text-sm">
                <ResumenRow label="Broker" value={form.aseguradoraNombre} />
                <ResumenRow label="Admin" value={form.name} />
                <ResumenRow label="Email" value={form.email} />
              </div>

              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
                <p className="text-xs font-semibold text-blue-200 mb-2">Apenas entres, tu setup guiado te deja listo en 5 min:</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[{ i: Palette, t: "Tu marca" }, { i: FileText, t: "Tu 1ª póliza" }, { i: CreditCard, t: "Tu 1er email" }].map(({ i: Icon, t }) => (
                    <div key={t} className="rounded-lg bg-white/[0.03] py-2">
                      <Icon className="h-4 w-4 mx-auto text-blue-300" />
                      <p className="text-[10px] text-slate-300 mt-1">{t}</p>
                    </div>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-2 text-xs text-slate-400 cursor-pointer select-none">
                <input type="checkbox" checked={aceptaTerminos} onChange={e => setAceptaTerminos(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded accent-blue-500 cursor-pointer" />
                <span>
                  Acepto los <Link href="/terminos" target="_blank" className="text-blue-400 font-medium hover:underline">Términos y Condiciones</Link> y la Política de Privacidad (Ley 25.326). Mis datos quedan aislados de otros brokers y puedo darme de baja cuando quiera.
                </span>
              </label>
            </div>
          )}

          {err && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 mt-4">{err}</p>}

          {/* Navegación */}
          <div className="flex gap-2 mt-5">
            {step > 0 && (
              <button onClick={back} disabled={loading}
                className="px-4 h-11 rounded-xl border border-white/10 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-30 flex items-center gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Atrás
              </button>
            )}
            {step < PASOS.length - 1 ? (
              <button onClick={next}
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25">
                Siguiente <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={submit} disabled={loading || !aceptaTerminos}
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4" /> Crear mi panel gratis</>}
              </button>
            )}
          </div>

          <p className="text-[11px] text-center text-slate-500 mt-4">
            ¿Ya tenés cuenta? <Link href="/login" className="text-blue-400 font-medium hover:underline">Iniciar sesión</Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">7 días de prueba gratis · sin tarjeta · © {new Date().getFullYear()} SegurOS</p>
      </div>
    </AuthShell>
  )
}

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

function ResumenRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-white font-medium truncate">{value || "—"}</span>
    </div>
  )
}
