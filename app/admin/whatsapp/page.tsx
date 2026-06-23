"use client"

// SegurOS — WhatsApp: conectá el número del broker escaneando un QR.
// Conexión (estado / QR / cerrar / reconectar) + mensaje de prueba + historial.
// Habla con /api/whatsapp/* (proxy al whatsapp-gateway).

import { useCallback, useEffect, useRef, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { whatsappAPI, type WaStatus, type WaMessageLog } from "@/lib/api"
import {
  MessageCircle, Smartphone, QrCode, RefreshCw, LogOut, Send,
  CheckCircle2, XCircle, Loader2, ShieldCheck, AlertTriangle, Gauge, History,
} from "lucide-react"

const ACCENT = "#0E9F6E"
const INK = "#0f172a"

const ESTADOS: Record<WaStatus, { label: string; tone: "ok" | "warn" | "bad" | "idle"; desc: string }> = {
  connected:    { label: "Conectado",      tone: "ok",   desc: "Tu WhatsApp está enlazado y listo para enviar." },
  qr_pending:   { label: "Esperando QR",   tone: "warn", desc: "Escaneá el código con tu teléfono para enlazar." },
  connecting:   { label: "Conectando…",    tone: "warn", desc: "Estableciendo la conexión con WhatsApp." },
  expired:      { label: "Sesión cerrada", tone: "bad",  desc: "Se cerró la sesión. Volvé a conectar para escanear de nuevo." },
  banned:       { label: "Bloqueado",      tone: "bad",  desc: "WhatsApp bloqueó este número." },
  disconnected: { label: "Desconectado",   tone: "idle", desc: "Todavía no conectaste ningún número." },
}
const toneStyle = (tone: string) =>
  tone === "ok"   ? { bg: "rgba(14,159,110,.12)", fg: "#0E9F6E" } :
  tone === "warn" ? { bg: "rgba(176,138,62,.14)", fg: "#9A6B16" } :
  tone === "bad"  ? { bg: "rgba(192,73,47,.12)",  fg: "#C0492F" } :
                    { bg: "rgba(15,23,42,.06)",   fg: "#5B6B63" }

export default function WhatsAppPage() {
  const [token, setToken] = useState("")
  const [status, setStatus] = useState<WaStatus>("disconnected")
  const [qr, setQr] = useState<string | null>(null)
  const [phone, setPhone] = useState<string | null>(null)
  const [lastError, setLastError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)

  const [to, setTo] = useState("")
  const [sending, setSending] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null)

  const [history, setHistory] = useState<WaMessageLog[]>([])
  const [usage, setUsage] = useState<{ enviados: number; limite: number } | null>(null)

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => { setToken(localStorage.getItem("token") || "") }, [])

  const refresh = useCallback(async (tk: string) => {
    try {
      const r = await whatsappAPI.status(tk)
      setStatus(r.status); setQr(r.qr || null); setPhone(r.phone || null); setLastError(r.lastError || null)
      return r.status
    } catch { return null }
  }, [])

  const loadHistory = useCallback(async (tk: string) => {
    try {
      const [h, u] = await Promise.all([whatsappAPI.history(tk), whatsappAPI.usage(tk)])
      if (h.ok) setHistory(h.items || [])
      if (u.ok) setUsage({ enviados: u.enviados, limite: u.limite })
    } catch { /* silencioso */ }
  }, [])

  useEffect(() => {
    if (!token) return
    ;(async () => { await refresh(token); await loadHistory(token); setLoading(false) })()
  }, [token, refresh, loadHistory])

  useEffect(() => {
    const activo = status === "qr_pending" || status === "connecting"
    if (activo && token) {
      if (!pollRef.current) pollRef.current = setInterval(() => { refresh(token) }, 2500)
    } else if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    return () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null } }
  }, [status, token, refresh])

  const conectar = async () => {
    setActing(true); setTestResult(null)
    try { const r = await whatsappAPI.connect(token); setStatus(r.status); setQr(r.qr || null); setLastError(r.lastError || null) }
    catch (e: any) { setLastError(e?.message || "error") } finally { setActing(false) }
  }
  const reconectar = async () => {
    setActing(true); setTestResult(null)
    try { const r = await whatsappAPI.reconnect(token); setStatus(r.status); setQr(r.qr || null) }
    catch (e: any) { setLastError(e?.message || "error") } finally { setActing(false) }
  }
  const cerrar = async () => {
    if (!confirm("¿Cerrar la sesión de WhatsApp? Vas a tener que volver a escanear el QR.")) return
    setActing(true); setTestResult(null)
    try { await whatsappAPI.logout(token); setStatus("disconnected"); setQr(null); setPhone(null) }
    catch (e: any) { setLastError(e?.message || "error") } finally { setActing(false) }
  }
  const enviarPrueba = async () => {
    if (!to.trim()) return
    setSending(true); setTestResult(null)
    try {
      const r = await whatsappAPI.test(token, to.trim())
      if (r.ok) setTestResult({ ok: true, msg: "¡Mensaje enviado! Revisá ese WhatsApp." })
      else setTestResult({ ok: false, msg: errLabel(r.error) })
      await loadHistory(token)
    } catch (e: any) { setTestResult({ ok: false, msg: e?.message || "No se pudo enviar." }) }
    finally { setSending(false) }
  }

  const st = ESTADOS[status] || ESTADOS.disconnected
  const tone = toneStyle(st.tone)
  const isConnected = status === "connected"

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-1 py-2">
        <div className="flex items-start gap-3 mb-6">
          <div className="h-11 w-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: ACCENT }}>
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: INK }}>WhatsApp</h1>
            <p className="text-sm text-slate-500 mt-0.5">Conectá el WhatsApp del broker para enviar avisos de vencimiento y recordatorios.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-400 py-16 justify-center"><Loader2 className="h-5 w-5 animate-spin" /> Cargando estado…</div>
        ) : (
          <>
            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #eef1ee" }}>
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Estado de conexión</p>
                    <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: tone.bg, color: tone.fg }}>
                      {st.tone === "ok" && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {st.tone === "warn" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      {st.tone === "bad" && <XCircle className="h-3.5 w-3.5" />}
                      {st.label}
                    </span>
                  </div>
                </div>
                {phone && isConnected && (
                  <div className="text-right">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Número</p>
                    <p className="font-mono text-sm font-semibold" style={{ color: INK }}>+{phone}</p>
                  </div>
                )}
              </div>

              <div className="px-5 py-5">
                <p className="text-sm text-slate-600 mb-4">{st.desc}</p>

                {(status === "qr_pending" || (status === "connecting" && qr)) && qr && (
                  <div className="flex flex-col items-center gap-3 py-2">
                    <div className="p-3 rounded-2xl border bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qr} alt="QR de WhatsApp" className="h-60 w-60" />
                    </div>
                    <ol className="text-xs text-slate-500 space-y-1 max-w-xs">
                      <li>1. Abrí <strong>WhatsApp</strong> en tu teléfono.</li>
                      <li>2. Tocá <strong>Ajustes → Dispositivos vinculados</strong>.</li>
                      <li>3. <strong>Vincular un dispositivo</strong> y escaneá este código.</li>
                    </ol>
                    <p className="flex items-center gap-1.5 text-[11px] text-slate-400"><RefreshCw className="h-3 w-3 animate-spin" /> El código se actualiza solo…</p>
                  </div>
                )}

                {status === "connecting" && !qr && (
                  <div className="flex items-center justify-center gap-2 text-slate-400 py-8"><Loader2 className="h-5 w-5 animate-spin" /> Generando código…</div>
                )}

                {isConnected && (
                  <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ background: "rgba(14,159,110,.08)" }}>
                    <ShieldCheck className="h-5 w-5" style={{ color: ACCENT }} />
                    <p className="text-sm" style={{ color: "#0b6b4a" }}>Tu número está enlazado. Mantené el teléfono con internet para que siga conectado.</p>
                  </div>
                )}

                {lastError && status !== "connected" && status !== "qr_pending" && (
                  <div className="flex items-center gap-2 text-xs text-amber-700 mt-3"><AlertTriangle className="h-3.5 w-3.5" /> Detalle técnico: {lastError}</div>
                )}

                <div className="flex flex-wrap gap-2 mt-5">
                  {!isConnected && status !== "qr_pending" && status !== "connecting" && (
                    <button onClick={conectar} disabled={acting} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: ACCENT }}>
                      {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />} Conectar WhatsApp
                    </button>
                  )}
                  {(status === "qr_pending" || status === "connecting") && (
                    <button onClick={reconectar} disabled={acting} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border text-slate-600 disabled:opacity-60">
                      <RefreshCw className={`h-4 w-4 ${acting ? "animate-spin" : ""}`} /> Generar nuevo QR
                    </button>
                  )}
                  {isConnected && (
                    <button onClick={reconectar} disabled={acting} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border text-slate-600 disabled:opacity-60">
                      <RefreshCw className={`h-4 w-4 ${acting ? "animate-spin" : ""}`} /> Reconectar
                    </button>
                  )}
                  {(isConnected || status === "qr_pending" || status === "connecting" || status === "expired") && (
                    <button onClick={cerrar} disabled={acting} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-red-200 text-red-600 disabled:opacity-60">
                      <LogOut className="h-4 w-4" /> Cerrar sesión
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white shadow-sm mt-5 px-5 py-5">
              <div className="flex items-center gap-2 mb-1"><Send className="h-4 w-4 text-slate-400" /><h2 className="font-bold text-lg" style={{ color: INK }}>Mensaje de prueba</h2></div>
              <p className="text-sm text-slate-500 mb-4">Enviá un mensaje a tu propio número para confirmar que todo funciona.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input value={to} onChange={(e) => setTo(e.target.value)} disabled={!isConnected || sending} placeholder="Ej: 11 2345 6789"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border text-sm disabled:bg-slate-50 disabled:text-slate-400 outline-none focus:ring-2"
                  style={{ ["--tw-ring-color" as any]: ACCENT }} />
                <button onClick={enviarPrueba} disabled={!isConnected || sending || !to.trim()} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: ACCENT }}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Enviar
                </button>
              </div>
              {!isConnected && <p className="text-xs text-slate-400 mt-2">Conectá tu WhatsApp primero para poder enviar.</p>}
              {testResult && (
                <div className={`flex items-center gap-2 text-sm mt-3 ${testResult.ok ? "text-emerald-700" : "text-red-600"}`}>
                  {testResult.ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />} {testResult.msg}
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-white shadow-sm mt-5 px-5 py-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><History className="h-4 w-4 text-slate-400" /><h2 className="font-bold text-lg" style={{ color: INK }}>Historial de envíos</h2></div>
                {usage && (
                  <div className="flex items-center gap-2 text-xs text-slate-500"><Gauge className="h-3.5 w-3.5" /><span className="font-mono">{usage.enviados}/{usage.limite}</span><span className="hidden sm:inline">en los últimos 15 min</span></div>
                )}
              </div>
              {usage && (
                <div className="h-1.5 w-full rounded-full bg-slate-100 mb-4 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (usage.enviados / usage.limite) * 100)}%`, background: usage.enviados >= usage.limite ? "#C0492F" : ACCENT }} />
                </div>
              )}
              {history.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">Todavía no enviaste mensajes.</p>
              ) : (
                <div className="divide-y">
                  {history.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 py-2.5 text-sm">
                      <span className="flex-shrink-0">{m.status === "sent" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-red-500" />}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-xs text-slate-600 truncate">{m.to}</p>
                        <p className="text-slate-500 text-xs truncate">{m.body}</p>
                      </div>
                      <span className="flex-shrink-0 text-[10px] uppercase tracking-wide font-mono text-slate-400">{m.origin}</span>
                      <span className="flex-shrink-0 text-[11px] text-slate-400">{new Date(m.createdAt).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
              Usá esta conexión solo para escribirles a tus propios clientes. Enviar mensajes masivos o a contactos que no te
              conocen puede hacer que WhatsApp bloquee tu número. Por seguridad, el sistema limita los envíos a {usage?.limite ?? 50} cada 15 minutos.
            </p>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

function errLabel(err?: string) {
  if (err === "no_session") return "No hay sesión conectada. Reconectá e intentá de nuevo."
  if (err === "not_on_whatsapp") return "Ese número no tiene WhatsApp (revisá el formato)."
  if (err === "missing_to") return "Ingresá un número."
  return err || "No se pudo enviar el mensaje."
}
