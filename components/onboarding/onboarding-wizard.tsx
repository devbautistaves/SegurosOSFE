"use client"

// Shell del onboarding interactivo de SegurOS (jun 2026).
// 4 fases: branding → poliza → cobranza → done.
// Estado vive en Aseguradora.onboarding (BE). El FE persiste también en
// localStorage para sobrevivir reloads sin pegarle al BE cada vez.
//
// Trigger: lo monta `OnboardingTrigger` en `/app/admin/layout.tsx` cuando detecta
// !completedAt && !skippedAt. Una vez que termina, el broker queda en el panel
// normal. (El tour viejo de driver.js fue removido.)

import { useEffect, useState } from "react"
import Link from "next/link"
import confetti from "canvas-confetti"
import { onboardingAPI, segurosAPI, type OnboardingState, type OnboardingStep } from "@/lib/api"
import { FaseBranding } from "./fase-branding"
import { FasePrimerPoliza } from "./fase-primer-poliza"
import { FaseEmailCobranza } from "./fase-email-cobranza"
import { Sparkles, Check, Clock, FileText, CreditCard, Palette, Trophy, Trash2, Loader2, Gift, ArrowRight, ShieldCheck, GraduationCap } from "lucide-react"

interface Props {
  onClose: () => void
  initialState?: OnboardingState | null
}

const FASES: { key: OnboardingStep; label: string; icon: any; desc: string }[] = [
  { key: "branding", label: "Personalización", icon: Palette,    desc: "Hacelo tuyo" },
  { key: "poliza",   label: "Primera póliza",  icon: FileText,   desc: "Datos reales" },
  { key: "cobranza", label: "Email cobranza",  icon: CreditCard, desc: "Notificá al cliente" },
  { key: "done",     label: "Listo",           icon: Trophy,     desc: "A volar" },
]

export function OnboardingWizard({ onClose, initialState }: Props) {
  const [state, setState] = useState<OnboardingState | null>(initialState || null)
  const [confirmSkip, setConfirmSkip] = useState(false)

  // Sync con BE al montar si no nos pasaron state
  useEffect(() => {
    if (initialState) return
    const token = localStorage.getItem("token") || ""
    if (!token) return
    onboardingAPI.state(token).then(r => setState(r.onboarding)).catch(() => {})
  }, [initialState])

  if (!state) {
    return (
      <div className="fixed inset-0 z-[200] bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Preparando tu onboarding...</div>
      </div>
    )
  }

  const advance = async (patch: Partial<OnboardingState>) => {
    const token = localStorage.getItem("token") || ""
    if (!token) return
    try {
      const r = await onboardingAPI.advance(token, patch as any)
      setState(r.onboarding)
    } catch (e) {
      // Si falla el BE, igual avanzamos local — el sync se reintentará después
      setState(prev => prev ? { ...prev, ...patch } as OnboardingState : prev)
    }
  }

  const doSkip = async () => {
    const token = localStorage.getItem("token") || ""
    if (!token) return
    try { await onboardingAPI.skip(token) } catch {}
    onClose()
  }

  const doComplete = async () => {
    const token = localStorage.getItem("token") || ""
    if (!token) return
    try { await onboardingAPI.complete(token) } catch {}
    onClose()
  }

  const currentIdx = FASES.findIndex(f => f.key === state.currentStep)
  const isDone = state.currentStep === "done" || !!state.completedAt
  const goNextFase = (faseDestino: OnboardingStep, subStep = 0) => advance({ currentStep: faseDestino, subStep })

  // ── Defensa contra subStep fuera de rango ────────────────────────────────
  // El subStep se persiste en BE y es compartido entre fases. Si por algún
  // motivo (bug histórico, race condition, retoma vieja) el subStep guardado
  // supera el largo del array SUB_STEPS de la fase actual, el render explota
  // con `Cannot read properties of undefined (reading 'key')` y bloquea
  // todo /admin. Capamos por fase aquí + clamp adicional dentro de cada
  // componente como cinturón y tiradores.
  const SUB_STEP_MAX: Record<string, number> = {
    branding: 6,   // 7 sub-steps (logo..mediosPago)
    poliza:   3,   // 4 sub-steps (asegurado..cobranza)
    cobranza: 0,   // pantalla única
    done:     0,
  }
  const safeSubStep = Math.max(0, Math.min(state.subStep || 0, SUB_STEP_MAX[state.currentStep] ?? 0))

  // Pantalla de bienvenida: solo la PRIMERA vez (nunca arrancó el setup).
  // Al reabrir el tour, startedAt ya existe → no se muestra de nuevo.
  const notStarted = !state.startedAt && !isDone && state.currentStep !== "done"
  const activarPrueba = () => advance({ currentStep: "branding", subStep: 0 })

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 overflow-y-auto">
      {/* Fondo decorativo */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Base gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        {/* Grilla sutil */}
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.12) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)",
          }}
        />
        {/* Blobs de color */}
        <div className="absolute -top-40 -left-32 h-[34rem] w-[34rem] rounded-full bg-blue-600/25 blur-[120px]" />
        <div className="absolute top-1/3 -right-32 h-[30rem] w-[30rem] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/4 h-[28rem] w-[28rem] rounded-full bg-emerald-500/15 blur-[120px]" />
        {/* Glow superior central */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-[42rem] rounded-full bg-blue-500/20 blur-[140px]" />
      </div>

      {notStarted ? (
        <WelcomeGate
          brokerNombre={typeof window !== "undefined" ? (() => { try { return JSON.parse(localStorage.getItem("aseguradora") || "{}")?.nombre || "" } catch { return "" } })() : ""}
          onActivar={activarPrueba}
          onSkip={() => setConfirmSkip(true)}
        />
      ) : (
      <>
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-slate-950/70 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-bold text-white">Setup de tu broker</span>
            <span className="text-xs text-slate-500 hidden sm:inline">· ~5 minutos</span>
          </div>
          <button onClick={() => setConfirmSkip(true)}
            className="text-sm font-medium text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-colors">
            <Clock className="h-3.5 w-3.5" /> Hacelo después
          </button>
        </div>

        {/* Stepper */}
        <div className="max-w-5xl mx-auto px-4 lg:px-8 pb-4">
          <div className="flex items-center gap-2">
            {FASES.map((f, i) => {
              const done = i < currentIdx || isDone
              const active = i === currentIdx && !isDone
              const Icon = f.icon
              return (
                <div key={f.key} className="flex-1 flex items-center gap-2">
                  <div className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    done   ? "bg-emerald-500 text-white" :
                    active ? "bg-blue-500 text-white ring-4 ring-blue-500/30" :
                             "bg-white/[0.04] text-slate-500 border border-white/10"
                  }`}>
                    {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <div className="hidden md:block min-w-0">
                    <p className={`text-xs font-semibold truncate ${done || active ? "text-white" : "text-slate-500"}`}>{f.label}</p>
                    <p className="text-[10px] text-slate-500 truncate">{f.desc}</p>
                  </div>
                  {i < FASES.length - 1 && <div className={`flex-1 h-px ${done ? "bg-emerald-500/50" : "bg-white/5"}`} />}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 lg:px-8 py-8">
        {state.currentStep === "branding" && (
          <FaseBranding
            initialSubStep={safeSubStep}
            onSubStepChange={(subStep) => advance({ subStep })}
            onFaseCompleted={() => goNextFase("poliza", 0)}
          />
        )}
        {state.currentStep === "poliza" && (
          <FasePrimerPoliza
            initialSubStep={safeSubStep}
            onSubStepChange={(subStep) => advance({ subStep })}
            onPolizaCreada={(polizaId, esPrueba) => {
              advance({
                currentStep: "cobranza",
                subStep: 0,
                primerPolizaId: polizaId,
                primerPolizaEsPrueba: esPrueba,
              })
            }}
            onPrevFase={() => goNextFase("branding", 0)}
          />
        )}
        {state.currentStep === "cobranza" && (
          <FaseEmailCobranza
            primerPolizaId={state.primerPolizaId}
            primerPolizaEsPrueba={!!state.primerPolizaEsPrueba}
            onEmailEnviado={(fechaIso) => advance({ primerEmailEnviadoEn: fechaIso })}
            onSkipFase={() => goNextFase("done", 0)}
            onPrevFase={() => goNextFase("poliza", 0)}
          />
        )}
        {(state.currentStep === "done" || isDone) && (
          <DoneScreen
            primerPolizaId={state.primerPolizaId}
            primerEmailEnviadoEn={state.primerEmailEnviadoEn}
            primerPolizaEsPrueba={!!state.primerPolizaEsPrueba}
            onClose={doComplete}
          />
        )}
      </div>
      </>
      )}

      {/* Modal de "hacelo después" con friction */}
      {confirmSkip && (
        <div className="fixed inset-0 z-[210] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-xl p-6 space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-white font-bold">¿Seguro que querés saltarte el setup?</h3>
                <p className="text-xs text-slate-400 mt-1">En 5 minutos te dejamos el panel listo con tu marca y tu primera póliza. Si lo saltás, podés reabrirlo después desde el header.</p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={doSkip} className="flex-1 px-3 py-2 rounded-lg border border-white/10 text-sm text-slate-300 hover:bg-white/5">
                Saltarlo igual
              </button>
              <button onClick={() => setConfirmSkip(false)}
                className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold">
                Seguir el setup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-pantallas ────────────────────────────────────────────────────────────

function WelcomeGate({ brokerNombre, onActivar, onSkip }: { brokerNombre: string; onActivar: () => void; onSkip: () => void }) {
  const [activando, setActivando] = useState(false)
  const handle = async () => { setActivando(true); try { await onActivar() } finally { setActivando(false) } }
  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg text-center space-y-7">
        <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 items-center justify-center shadow-lg shadow-blue-500/30">
          <Gift className="h-8 w-8 text-white" />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Bienvenido{brokerNombre ? ` a ${brokerNombre}` : ""}</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            Activá tu prueba gratuita<br />de <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">7 días</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Accedé a todo SegurOS sin tarjeta. En 5 minutos te dejamos el panel con tu marca, tu primera póliza cargada y un email enviado a un cliente.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left space-y-2.5">
          {[
            "Panel 100% con tu logo, color y nombre",
            "Pólizas, cobranzas y siniestros ilimitados durante la prueba",
            "Avisos de vencimiento por email con tu marca",
          ].map((t) => (
            <div key={t} className="flex items-center gap-2.5 text-sm text-slate-200">
              <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Check className="h-3 w-3" />
              </div>
              {t}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <button onClick={handle} disabled={activando}
            className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 disabled:opacity-60 transition">
            {activando ? <><Loader2 className="h-5 w-5 animate-spin" /> Activando...</> : <>Activar prueba gratuita de 7 días <ArrowRight className="h-5 w-5" /></>}
          </button>
          <button onClick={onSkip} disabled={activando}
            className="text-xs text-slate-500 hover:text-slate-300">
            Prefiero explorar por mi cuenta
          </button>
          <p className="text-[11px] text-slate-600 flex items-center justify-center gap-1.5 pt-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Sin tarjeta · Sin compromiso · Cancelás cuando quieras
          </p>
        </div>
      </div>
    </div>
  )
}

function DoneScreen({ primerPolizaId, primerEmailEnviadoEn, primerPolizaEsPrueba, onClose }:
  { primerPolizaId: string | null; primerEmailEnviadoEn: string | null; primerPolizaEsPrueba: boolean; onClose: () => void }) {
  // Datos de la póliza de prueba (para ofrecer borrarla)
  const [pruebaNombre, setPruebaNombre] = useState<string | null>(null)
  const [cobranzaId, setCobranzaId] = useState<string | null>(null)
  const [borrando, setBorrando] = useState(false)
  const [borrada, setBorrada] = useState(false)
  const [borrarErr, setBorrarErr] = useState("")

  // Confetti real (canvas-confetti) en un par de ráfagas
  useEffect(() => {
    const fire = (particleRatio: number, opts: confetti.Options) =>
      confetti({ origin: { y: 0.6 }, ...opts, particleCount: Math.floor(220 * particleRatio) })
    fire(0.25, { spread: 26, startVelocity: 55 })
    fire(0.2, { spread: 60 })
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
    fire(0.1, { spread: 120, startVelocity: 45 })
  }, [])

  // Si la primera póliza fue de prueba, buscamos su cobranza vinculada para
  // poder ofrecer borrar ambas con el nombre real en el botón.
  useEffect(() => {
    if (!primerPolizaEsPrueba || !primerPolizaId) return
    const token = localStorage.getItem("token") || ""
    if (!token) return
    segurosAPI.getCobranzas(token)
      .then(r => {
        const c = (r.cobranzas || []).find(x => x.polizaId === primerPolizaId)
        if (c) { setPruebaNombre(c.nombreApellido); setCobranzaId(c._id) }
      })
      .catch(() => {})
  }, [primerPolizaEsPrueba, primerPolizaId])

  const borrarPrueba = async () => {
    if (!primerPolizaId) return
    setBorrando(true); setBorrarErr("")
    try {
      const token = localStorage.getItem("token") || ""
      if (!token) throw new Error("Sin sesión")
      if (cobranzaId) { try { await segurosAPI.deleteCobranza(token, cobranzaId) } catch {} }
      await segurosAPI.deletePoliza(token, primerPolizaId)
      setBorrada(true)
    } catch (e: any) {
      setBorrarErr(e?.message || "No se pudo borrar la póliza de prueba")
    } finally {
      setBorrando(false)
    }
  }

  return (
    <div className="relative max-w-lg mx-auto text-center space-y-6 py-12">
      <div className="inline-flex h-20 w-20 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 items-center justify-center shadow-lg shadow-blue-500/30">
        <Trophy className="h-10 w-10 text-white" />
      </div>
      <div>
        <h2 className="text-3xl font-bold text-white">¡Listo! 🎉</h2>
        <p className="text-sm text-slate-400 mt-2">Tu panel ya está configurado. A partir de ahora, todo lo que cargues queda en tu base.</p>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left space-y-2 text-sm">
        <Logro done={true} label="Panel personalizado con tu marca" />
        <Logro done={!!primerPolizaId} label="Primera póliza cargada con datos reales" />
        <Logro done={!!primerEmailEnviadoEn} label="Primer email enviado a un cliente" />
      </div>

      {/* Borrar póliza de prueba */}
      {primerPolizaEsPrueba && !borrada && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-left space-y-2">
          <p className="text-sm text-amber-100">
            ¿La póliza{pruebaNombre ? <> de <b>{pruebaNombre}</b></> : null} era solo de prueba? Borrala y arrancá con tu base limpia.
          </p>
          {borrarErr && <p className="text-xs text-red-300">{borrarErr}</p>}
          <button onClick={borrarPrueba} disabled={borrando}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 text-xs font-semibold hover:bg-red-500/20 disabled:opacity-50">
            {borrando ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Borrando...</> : <><Trash2 className="h-3.5 w-3.5" /> Borrar {pruebaNombre ? `"${pruebaNombre}"` : "la póliza de prueba"}</>}
          </button>
        </div>
      )}
      {borrada && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200 flex items-center justify-center gap-2">
          <Check className="h-4 w-4" /> Póliza de prueba eliminada. Tu base quedó limpia.
        </div>
      )}

      {/* Academia: lo que el sistema hace solo + cómo rinde cada función. */}
      <Link
        href="/admin/aprender"
        onClick={onClose}
        className="block rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 text-left hover:bg-blue-500/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">¿Querés exprimir SegurOS?</p>
            <p className="text-xs text-slate-400">Pasá por la <b className="text-blue-300">Academia</b>: lecciones cortas sobre lo que el sistema hace solo y las funciones que más rinden.</p>
          </div>
          <ArrowRight className="h-4 w-4 text-blue-300 flex-shrink-0 ml-auto" />
        </div>
      </Link>

      <button onClick={onClose} className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white text-base font-semibold">
        Empezar a usar SegurOS →
      </button>
    </div>
  )
}

function Logro({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-5 w-5 rounded-full flex items-center justify-center ${done ? "bg-emerald-500" : "bg-white/5 border border-white/10"}`}>
        {done && <Check className="h-3 w-3 text-white" />}
      </div>
      <span className={done ? "text-white" : "text-slate-500"}>{label}</span>
    </div>
  )
}
