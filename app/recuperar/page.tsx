"use client"

import { useState } from "react"
import Link from "next/link"
import { authAPI } from "@/lib/api"
import { AuthShell } from "@/app/login/page"
import { Loader2, ArrowRight, ArrowLeft, Mail, CheckCircle2 } from "lucide-react"

const inputCls = "w-full h-11 rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-colors"

export default function RecuperarPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    if (!email) { setErr("Ingresá tu email"); return }
    setLoading(true)
    try {
      await authAPI.forgotPassword(email)
      setSent(true)
    } catch (e: any) {
      setErr(e?.message || "No se pudo procesar el pedido")
    } finally { setLoading(false) }
  }

  return (
    <AuthShell>
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/seguros-512.png" alt="SegurOS" className="h-12 w-12 object-contain" />
          <span className="text-2xl font-bold tracking-tight text-white">SegurOS</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-7 shadow-2xl shadow-black/40">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Revisá tu email</h2>
              <p className="text-sm text-slate-400 mt-2">
                Si <strong className="text-slate-300">{email}</strong> está registrado, te enviamos un enlace para
                restablecer tu contraseña. Vence en 1 hora.
              </p>
              <Link href="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300">
                <ArrowLeft className="h-4 w-4" /> Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold tracking-tight text-white text-center">Recuperá tu cuenta</h2>
              <p className="text-sm text-slate-400 mb-6 text-center">Te enviaremos un enlace a tu email para crear una nueva contraseña.</p>

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Email</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Mail className="h-4 w-4" /></span>
                    <input className={inputCls} type="email" placeholder="vos@broker.com" value={email}
                      onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                  </div>
                </div>

                {err && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{err}</p>}

                <button type="submit" disabled={loading}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Enviar enlace <ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>

              <div className="text-center mt-5">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200">
                  <ArrowLeft className="h-4 w-4" /> Volver al inicio de sesión
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">© {new Date().getFullYear()} SegurOS — by TusVentas.</p>
      </div>
    </AuthShell>
  )
}
