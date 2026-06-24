"use client"

// Onboarding — Paso WhatsApp: conectá el número del broker (QR) y mandate un
// mensaje de prueba para ver cómo le llegan los avisos a tus asegurados. Opcional:
// se puede continuar sin conectar (se configura después en Configuración → WhatsApp).

import { useCallback, useEffect, useRef, useState } from "react"
import { whatsappAPI, type WaStatus } from "@/lib/api"
import {
  MessageCircle, QrCode, RefreshCw, Loader2, CheckCircle2, XCircle, Send,
  ArrowRight, ArrowLeft, ShieldCheck, Smartphone, Check,
} from "lucide-react"

// Automatizaciones disponibles (se muestran como lista para que el broker vea
// todo lo que puede mandar solo). Se prenden/editan en Configuración → WhatsApp.
const AUTOMS_WA = [
  "Aviso de póliza por vencer",
  "Cuotas: próxima a vencer, vence hoy y vencida",
  "Cambios de estado de siniestros",
  "Pago confirmado / recibo",
  "Bienvenida con link a su legajo",
  "Saludo de cumpleaños",
]

export function FaseWhatsapp({ onPrev, onComplete }: { onPrev: () => void; onComplete: () => void }) {
  const [token, setToken] = useState("")
  const [status, setStatus] = useState<WaStatus>("disconnected")
  const [qr, setQr] = useState<string | null>(null)
  const [phone, setPhone] = useState<string | null>(null)
  const [acting, setActing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [to, setTo] = useState("")
  const [sending, setSending] = useState(false)
  const [testMsg, setTestMsg] = useState<{ ok: boolean; msg: string } | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => { setToken(localStorage.getItem("token") || "") }, [])

  const refresh = useCallback(async (tk: string) => {
    try { const r = await whatsappAPI.status(tk); setStatus(r.status); setQr(r.qr || null); setPhone(r.phone || null); return r.status }
    catch { return null }
  }, [])

  useEffect(() => { if (!token) return; (async () => { await refresh(token); setLoading(false) })() }, [token, refresh])

  useEffect(() => {
    const activo = status === "qr_pending" || status === "connecting"
    if (activo && token) { if (!pollRef.current) pollRef.current = setInterval(() => refresh(token), 2500) }
    else if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    return () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null } }
  }, [status, token, refresh])

  const conectar = async () => {
    setActing(true)
    try { const r = await whatsappAPI.connect(token); setStatus(r.status); setQr(r.qr || null) }
    catch { /* noop */ } finally { setActing(false) }
  }
  const enviarPrueba = async () => {
    if (!to.trim()) return
    setSending(true); setTestMsg(null)
    try {
      const r = await whatsappAPI.test(token, to.trim(), "✅ ¡Hola! Así le van a llegar a tus asegurados los avisos de vencimiento de SegurOS. La conexión funciona.")
      if (r.ok) setTestMsg({ ok: true, msg: "¡Enviado! Revisá ese WhatsApp." })
      else setTestMsg({ ok: false, msg: r.error === "not_on_whatsapp" ? "Ese número no tiene WhatsApp." : "No se pudo enviar." })
    } catch (e: any) { setTestMsg({ ok: false, msg: e?.message || "No se pudo enviar." }) }
    finally { setSending(false) }
  }

  const connected = status === "connected"

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 items-center justify-center shadow-lg shadow-emerald-500/30 mb-3">
          <MessageCircle className="h-7 w-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Conectá tu WhatsApp</h2>
        <p className="text-sm text-slate-400 mt-1.5 max-w-md mx-auto">
          Mandá avisos automáticos a tus asegurados desde tu propio número: vencimientos, cobranzas, siniestros, bienvenida y más. Conectalo ahora y probá cómo llegan.
        </p>
      </div>

      {/* Lista de automatizaciones disponibles */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 mb-4">
        <p className="text-xs font-semibold text-slate-300 mb-2.5">Lo que vas a poder mandar solo:</p>
        <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[13px] text-slate-300">
          {AUTOMS_WA.map((a) => (
            <li key={a} className="flex gap-2"><Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" /> {a}</li>
          ))}
        </ul>
        <p className="text-[11px] text-slate-500 mt-2.5">Vienen apagadas: prendés y editás las que quieras en Configuración → WhatsApp.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        {loading ? (
          <div className="flex items-center justify-center gap-2 text-slate-400 py-10"><Loader2 className="h-5 w-5 animate-spin" /> Cargando…</div>
        ) : connected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
              <ShieldCheck className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-emerald-300">WhatsApp conectado{phone ? ` · +${phone}` : ""}</p>
                <p className="text-xs text-slate-400">Tus avisos van a salir desde este número.</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5"><Send className="h-3.5 w-3.5" /> Probá cómo le llega a un asegurado</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Tu número: 11 2345 6789"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-emerald-500/40" />
                <button onClick={enviarPrueba} disabled={sending || !to.trim()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold disabled:opacity-50">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Enviar prueba
                </button>
              </div>
              {testMsg && (
                <p className={`flex items-center gap-1.5 text-sm mt-2 ${testMsg.ok ? "text-emerald-400" : "text-red-400"}`}>
                  {testMsg.ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />} {testMsg.msg}
                </p>
              )}
            </div>
          </div>
        ) : (status === "qr_pending" || (status === "connecting" && qr)) && qr ? (
          <div className="flex flex-col items-center gap-3 py-1">
            <div className="p-3 rounded-2xl bg-white"><img src={qr} alt="QR de WhatsApp" className="h-56 w-56" /></div>
            <ol className="text-xs text-slate-400 space-y-1 max-w-xs">
              <li>1. Abrí <strong className="text-slate-200">WhatsApp</strong> en tu teléfono.</li>
              <li>2. <strong className="text-slate-200">Ajustes → Dispositivos vinculados</strong>.</li>
              <li>3. <strong className="text-slate-200">Vincular un dispositivo</strong> y escaneá este código.</li>
            </ol>
            <p className="flex items-center gap-1.5 text-[11px] text-slate-500"><RefreshCw className="h-3 w-3 animate-spin" /> El código se actualiza solo…</p>
          </div>
        ) : status === "connecting" ? (
          <div className="flex items-center justify-center gap-2 text-slate-400 py-10"><Loader2 className="h-5 w-5 animate-spin" /> Generando código…</div>
        ) : (
          <div className="text-center py-6">
            <Smartphone className="h-9 w-9 text-slate-500 mx-auto mb-3" />
            <p className="text-sm text-slate-300 mb-4 max-w-sm mx-auto">Escaneás un QR con tu teléfono (como WhatsApp Web) y listo. Podés desconectarlo cuando quieras.</p>
            <button onClick={conectar} disabled={acting}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold disabled:opacity-60">
              {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />} Conectar WhatsApp
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-6">
        <button onClick={onPrev} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200">
          <ArrowLeft className="h-4 w-4" /> Atrás
        </button>
        <button onClick={onComplete}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-semibold">
          {connected ? "Continuar" : "Lo conecto después"} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <p className="text-center text-[11px] text-slate-600 mt-3">Podés conectarlo o cambiar los mensajes cuando quieras desde <strong className="text-slate-400">Configuración → WhatsApp</strong>.</p>
    </div>
  )
}
