"use client"

// FASE 3 del onboarding: mandá tu PRIMER email de aviso de vencimiento con tu
// branding (logo + color + nombre que configuraste en Fase 1) al cliente de la
// póliza que cargaste en Fase 2.
//
// Flujo:
//   1. Buscamos la cobranza que el BE creó automáticamente para la primera póliza
//      (vinculada por polizaId). Solo existe si medioDePago ∈ {EFECTIVO, CUPON}.
//   2. Mostramos un preview del email branded (mismo look que el template real).
//   3. Botón "Enviar aviso" → POST /api/seguros/cobranzas/:id/notificacion
//      { tipo: "proximo_vencer", mes }. Al éxito guardamos primerEmailEnviadoEn.
//
// Casos borde:
//   - Sin cobranza (medio ≠ efectivo/cupón) → explicamos y dejamos saltar.
//   - Cobranza sin email → avisamos que ese cliente no tiene mail.
//   - Si el broker usó su propio mail (primerPolizaEsPrueba) → le recordamos
//     abrir su inbox para verlo llegar.

import { useEffect, useState } from "react"
import { CreditCard, Mail, AlertCircle, CheckCircle2, Send, Inbox, Loader2 } from "lucide-react"
import { aseguradoraAPI, segurosAPI, type Aseguradora, type CobranzaEfectivo } from "@/lib/api"
import { VigenciasReveal } from "@/components/learn/lessons"

interface Props {
  primerPolizaId: string | null
  primerPolizaEsPrueba: boolean
  onEmailEnviado: (fechaIso: string) => void
  onSkipFase: () => void
  onPrevFase: () => void
}

function mesActualKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"]
function mesLabelDe(mes: string) {
  const [y, m] = mes.split("-").map(Number)
  if (!y || !m) return ""
  return `${MESES[m - 1]} ${y}`
}

export function FaseEmailCobranza({ primerPolizaId, primerPolizaEsPrueba, onEmailEnviado, onSkipFase, onPrevFase }: Props) {
  const [loading, setLoading] = useState(true)
  const [aseg, setAseg] = useState<Aseguradora | null>(null)
  const [cobranza, setCobranza] = useState<CobranzaEfectivo | null>(null)
  const [sending, setSending] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [err, setErr] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token") || ""
    if (!token) { setLoading(false); return }
    ;(async () => {
      try {
        const [me, cob] = await Promise.all([
          aseguradoraAPI.getMe(token).catch(() => null),
          segurosAPI.getCobranzas(token).catch(() => null),
        ])
        if (me?.aseguradora) setAseg(me.aseguradora)
        const lista = cob?.cobranzas || []
        // Match por la póliza de la Fase 2; si no la encontramos, tomamos la más
        // reciente con email (fallback robusto para no dejar al broker trabado).
        let target = primerPolizaId ? lista.find(c => c.polizaId === primerPolizaId) : null
        if (!target) target = [...lista].reverse().find(c => c.email) || lista[lista.length - 1] || null
        setCobranza(target || null)
      } catch (e: any) {
        setErr(e?.message || "No pudimos cargar tus cobranzas")
      } finally {
        setLoading(false)
      }
    })()
  }, [primerPolizaId])

  const color = aseg?.colorPrimario || "#2563eb"
  const brokerNombre = aseg?.nombre || "Tu broker"
  const mes = cobranza?.pagos?.[0]?.mes || mesActualKey()
  const mesLabel = cobranza?.pagos?.[0]?.mesLabel || mesLabelDe(mes)
  const clienteNombre = cobranza?.nombreApellido || "tu cliente"

  const enviar = async () => {
    if (!cobranza) return
    setSending(true); setErr("")
    try {
      const token = localStorage.getItem("token") || ""
      if (!token) throw new Error("Sin sesión")
      const r = await segurosAPI.enviarNotificacionIndividual(token, cobranza._id, "proximo_vencer", mes)
      if (!r.success) throw new Error("No se pudo enviar el email")
      setEnviado(true)
      onEmailEnviado(new Date().toISOString())
    } catch (e: any) {
      setErr(e?.message || "No se pudo enviar el email. Probá de nuevo.")
    } finally {
      setSending(false)
    }
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-sm gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Buscando la cobranza de tu primera póliza...
      </div>
    )
  }

  // ── Sin cobranza (medio de pago no genera cobranza) ──
  if (!cobranza) {
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <Header />
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 text-sm text-amber-100 space-y-2">
          <p className="font-semibold flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Todavía no hay una cobranza para notificar</p>
          <p className="text-amber-200/80">
            El sistema solo crea una fila de cobranza cuando el medio de pago es <b>Efectivo</b> o <b>Cupón</b>.
            Tu primera póliza usó otro medio (los maneja directo la aseguradora), así que no hay nada que avisar desde acá.
          </p>
          <p className="text-amber-200/60">Más adelante, cada póliza en efectivo/cupón te va a aparecer en <b>Cobranzas</b> para enviar el aviso con un clic.</p>
        </div>
        <Nav onPrevFase={onPrevFase} onSkipFase={onSkipFase} skipLabel="Continuar →" />
      </div>
    )
  }

  // ── Enviado OK ──
  if (enviado) {
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <Header />
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-3">
          <div className="inline-flex h-14 w-14 rounded-full bg-emerald-500 items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">¡Email enviado a {clienteNombre}! 🎉</h3>
          <p className="text-sm text-emerald-100/80">
            Saliò con tu marca <b>{brokerNombre}</b>, tu logo y tus colores. Así de profesional ve tu cliente cada aviso.
          </p>
          {primerPolizaEsPrueba && cobranza.email && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs text-emerald-100 flex items-start gap-2 text-left">
              <Inbox className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>Como pusiste tu propio mail (<b>{cobranza.email}</b>), revisá tu bandeja de entrada en unos segundos para verlo llegar.</span>
            </div>
          )}
        </div>

        {/* Reveal de lo invisible: SegurOS mantiene los estados al día solo. */}
        <VigenciasReveal />

        <Nav onPrevFase={onPrevFase} onSkipFase={onSkipFase} skipLabel="Terminar setup →" skipPrimary />
      </div>
    )
  }

  // ── Preview + enviar ──
  return (
    <div className="max-w-lg mx-auto space-y-5">
      <Header />

      {primerPolizaEsPrueba && cobranza.email && (
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-100 flex items-start gap-2">
          <Mail className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-300" />
          <span>Vas a enviarte este aviso a vos mismo (<b>{cobranza.email}</b>). Mandalo y revisá tu inbox para ver cómo le llega a tus clientes.</span>
        </div>
      )}

      {!cobranza.email && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-100 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>La cobranza de <b>{clienteNombre}</b> no tiene email cargado, así que no podemos enviarle el aviso. Podés saltar este paso o volver a la póliza y cargar un email.</span>
        </div>
      )}

      {/* Preview del email branded */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 px-1">Vista previa del email</p>
        <div className="rounded-lg overflow-hidden bg-white shadow-lg">
          {/* Header branded */}
          <div className="px-5 py-4 flex items-center gap-3" style={{ backgroundColor: color }}>
            {aseg?.logo
              ? <img src={aseg.logo} alt={brokerNombre} className="h-8 w-8 rounded object-contain bg-white/90 p-0.5" />
              : <div className="h-8 w-8 rounded bg-white/20 flex items-center justify-center text-white font-bold text-sm">{brokerNombre.charAt(0)}</div>}
            <span className="text-white font-bold text-sm">{brokerNombre}</span>
          </div>
          {/* Cuerpo */}
          <div className="px-5 py-4 space-y-2.5 text-slate-700 text-[13px] leading-relaxed">
            <p>Hola <b>{clienteNombre}</b>,</p>
            <p>Te recordamos que tu póliza{cobranza.aseguradora ? <> de <b>{cobranza.aseguradora}</b></> : null}{cobranza.patente ? <> ({cobranza.patente})</> : null} tiene un vencimiento próximo correspondiente a <b>{mesLabel}</b>.</p>
            <p>Por cualquier consulta, no dudes en escribirnos. ¡Gracias por confiar en nosotros!</p>
            <div className="pt-2">
              <span className="inline-block px-4 py-2 rounded-md text-white text-xs font-semibold" style={{ backgroundColor: color }}>
                Ver detalle
              </span>
            </div>
            <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">{brokerNombre} · Este es un aviso automático de vencimiento.</p>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 mt-2 px-1">
          Para: <b className="text-slate-300">{cobranza.email || "— sin email —"}</b> · Asunto: aviso de vencimiento {mesLabel}
        </p>
      </div>

      {err && (
        <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded p-2 flex items-start gap-2">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" /> {err}
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={onPrevFase} disabled={sending}
          className="px-4 py-2 rounded-lg border border-white/10 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-30">
          ← Atrás
        </button>
        {cobranza.email ? (
          <button onClick={enviar} disabled={sending}
            className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50">
            {sending ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</> : <>Enviar aviso de vencimiento <Send className="h-4 w-4" /></>}
          </button>
        ) : (
          <button onClick={onSkipFase}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold">
            Saltar este paso →
          </button>
        )}
      </div>
    </div>
  )
}

// ── Helpers visuales ──────────────────────────────────────────────────────────

function Header() {
  return (
    <div>
      <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-1">Fase 3 · Email de cobranza</p>
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <CreditCard className="h-6 w-6 text-blue-400" />
        Mandá tu primer aviso branded
      </h2>
      <p className="text-sm text-slate-400 mt-1">Así se ve un aviso de vencimiento con tu marca. Enviáselo a tu cliente con un clic.</p>
    </div>
  )
}

function Nav({ onPrevFase, onSkipFase, skipLabel, skipPrimary }: { onPrevFase: () => void; onSkipFase: () => void; skipLabel: string; skipPrimary?: boolean }) {
  return (
    <div className="flex gap-2">
      <button onClick={onPrevFase}
        className="px-4 py-2 rounded-lg border border-white/10 text-sm text-slate-300 hover:bg-white/5">← Atrás</button>
      <button onClick={onSkipFase}
        className={`flex-1 px-4 py-2 rounded-lg text-white text-sm font-semibold ${skipPrimary ? "bg-gradient-to-r from-blue-500 to-purple-500" : "bg-blue-500 hover:bg-blue-600"}`}>
        {skipLabel}
      </button>
    </div>
  )
}
