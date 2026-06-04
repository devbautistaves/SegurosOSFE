"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { saAuth } from "@/lib/superadmin-api"
import { Mail, Loader2, AlertTriangle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SuperAdminOTPPage() {
  const router = useRouter()
  const [digits, setDigits] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sentTo, setSentTo] = useState("")
  const refs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const pending = localStorage.getItem("superadmin_pending_token")
    if (!pending) {
      router.replace("/superadmin/login")
      return
    }
    setSentTo(localStorage.getItem("superadmin_otp_sent_to") || "")
    refs.current[0]?.focus()
  }, [router])

  const handleChange = (i: number, val: string) => {
    if (val && !/^\d$/.test(val)) return
    const next = [...digits]
    next[i] = val
    setDigits(next)
    if (val && i < 5) refs.current[i + 1]?.focus()

    // Auto-submit cuando se completa
    if (i === 5 && val && next.every(d => d !== "")) {
      submit(next.join(""))
    }
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (text.length === 6) {
      const next = text.split("")
      setDigits(next)
      submit(text)
    }
  }

  const submit = async (code: string) => {
    setError("")
    setLoading(true)
    try {
      const res = await saAuth.verifyOTP(code)
      localStorage.setItem("superadmin_token", res.token)
      localStorage.setItem("superadmin_user", JSON.stringify(res.superAdmin))
      localStorage.removeItem("superadmin_pending_token")
      localStorage.removeItem("superadmin_otp_sent_to")

      if (res.mustChangePassword) {
        router.replace("/superadmin/change-password")
      } else {
        router.replace("/superadmin")
      }
    } catch (e: any) {
      setError(e.message || "Código incorrecto")
      setDigits(["", "", "", "", "", ""])
      refs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        <Link href="/superadmin/login" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-6">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Mail className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Verificación 2FA</h1>
              {sentTo && <p className="text-xs text-slate-400">Código enviado a {sentTo}</p>}
            </div>
          </div>

          <p className="text-sm text-slate-300 mb-6">
            Ingresá el código de 6 dígitos que te llegó por email.
          </p>

          <div className="flex gap-2 justify-center mb-4" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { refs.current[i] = el }}
                type="text" inputMode="numeric" maxLength={1}
                value={d}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                disabled={loading}
                className="w-12 h-14 text-center text-2xl font-bold bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 disabled:opacity-50"
              />
            ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 text-sm text-blue-300 mb-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Verificando código...
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 mb-4">
              <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}

          <p className="text-[11px] text-slate-500 text-center">
            El código expira en 10 minutos.
            <button onClick={() => router.push("/superadmin/login")} className="ml-1 text-blue-400 hover:text-blue-300 underline">
              ¿Pedir otro?
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
