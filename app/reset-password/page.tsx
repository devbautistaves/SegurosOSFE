"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { authAPI } from "@/lib/api"
import { AuthShell } from "@/app/login/page"
import { Shield, Loader2, ArrowRight, ArrowLeft, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react"

const inputCls = "w-full h-11 rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-colors"

function ResetForm() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    if (!token) { setErr("El enlace es inválido. Pedí uno nuevo desde 'Olvidé mi contraseña'."); return }
    if (password.length < 6) { setErr("La contraseña debe tener al menos 6 caracteres"); return }
    if (password !== confirm) { setErr("Las contraseñas no coinciden"); return }
    setLoading(true)
    try {
      await authAPI.resetPassword(token, password)
      setDone(true)
      setTimeout(() => router.replace("/login"), 2500)
    } catch (e: any) {
      setErr(e?.message || "No se pudo restablecer la contraseña")
    } finally { setLoading(false) }
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15">
          <CheckCircle2 className="h-6 w-6 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white">¡Listo!</h2>
        <p className="text-sm text-slate-400 mt-2">Tu contraseña se actualizó. Te llevamos al inicio de sesión…</p>
        <Link href="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300">
          <ArrowLeft className="h-4 w-4" /> Ir al inicio de sesión
        </Link>
      </div>
    )
  }

  return (
    <>
      <h2 className="text-2xl font-bold tracking-tight text-white text-center">Nueva contraseña</h2>
      <p className="text-sm text-slate-400 mb-6 text-center">Elegí una contraseña nueva para tu cuenta.</p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Nueva contraseña</label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Lock className="h-4 w-4" /></span>
            <input className={inputCls} type={showPass ? "text" : "password"} placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
            <button type="button" onClick={() => setShowPass(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Repetir contraseña</label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Lock className="h-4 w-4" /></span>
            <input className={inputCls} type={showPass ? "text" : "password"} placeholder="••••••••" value={confirm}
              onChange={e => setConfirm(e.target.value)} required autoComplete="new-password" />
          </div>
        </div>

        {err && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{err}</p>}

        <button type="submit" disabled={loading}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Guardar contraseña <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>

      <div className="text-center mt-5">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200">
          <ArrowLeft className="h-4 w-4" /> Volver al inicio de sesión
        </Link>
      </div>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <AuthShell>
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">SegurOS</span>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-7 shadow-2xl shadow-black/40">
          <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>}>
            <ResetForm />
          </Suspense>
        </div>
        <p className="text-center text-xs text-slate-600 mt-6">© {new Date().getFullYear()} SegurOS — by TusVentas.</p>
      </div>
    </AuthShell>
  )
}
