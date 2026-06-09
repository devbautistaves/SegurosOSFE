"use client"

// Shell del onboarding interactivo de SegurOS (jun 2026).
// 4 fases: branding → poliza → cobranza → done.
// Estado vive en Aseguradora.onboarding (BE). El FE persiste también en
// localStorage para sobrevivir reloads sin pegarle al BE cada vez.
//
// Trigger: lo monta `OnboardingTrigger` en `/app/admin/layout.tsx` cuando detecta
// !completedAt && !skippedAt. Una vez que termina, el broker queda en el panel
// normal. El tour viejo (driver.js) coexiste pero queda cortocircuitado.

import { useEffect, useState } from "react"
import { onboardingAPI, type OnboardingState, type OnboardingStep } from "@/lib/api"
import { FaseBranding } from "./fase-branding"
import { FasePrimerPoliza } from "./fase-primer-poliza"
import { FaseEmailCobranza } from "./fase-email-cobranza"
import { Sparkles, X, Check, Clock, FileText, CreditCard, Palette, Trophy } from "lucide-react"

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

  return (
    <div className="fixed inset-0 z-[200] bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur bg-slate-950/80 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-bold text-white">Setup de tu broker</span>
            <span className="text-xs text-slate-500 hidden sm:inline">· ~5 minutos</span>
          </div>
          <button onClick={() => setConfirmSkip(true)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/5">
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
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
        {state.currentStep === "branding" && (
          <FaseBranding
            initialSubStep={state.subStep || 0}
            onSubStepChange={(subStep) => advance({ subStep })}
            onFaseCompleted={() => goNextFase("poliza", 0)}
          />
        )}
        {state.currentStep === "poliza" && (
          <FasePrimerPoliza
            initialSubStep={state.subStep || 0}
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
            onClose={doComplete}
          />
        )}
      </div>

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

function DoneScreen({ primerPolizaId, primerEmailEnviadoEn, onClose }: { primerPolizaId: string | null; primerEmailEnviadoEn: string | null; onClose: () => void }) {
  useEffect(() => {
    // Mini confetti casero (sin librerias todavía — Fase 4 lo polish)
    const target = document.getElementById("done-celebrate")
    if (!target) return
    const colors = ["#3b82f6","#a855f7","#10b981","#f59e0b","#ef4444"]
    const pieces = Array.from({ length: 50 }, (_, i) => {
      const el = document.createElement("div")
      el.style.position = "absolute"
      el.style.left = `${Math.random() * 100}%`
      el.style.top = "-10px"
      el.style.width = "8px"
      el.style.height = "8px"
      el.style.background = colors[i % colors.length]
      el.style.borderRadius = "2px"
      el.style.transform = `rotate(${Math.random() * 360}deg)`
      el.style.transition = "all 2.5s ease-out"
      target.appendChild(el)
      setTimeout(() => {
        el.style.top = "100%"
        el.style.transform = `rotate(${Math.random() * 720}deg) translateX(${(Math.random() - 0.5) * 200}px)`
        el.style.opacity = "0"
      }, 50 + Math.random() * 200)
      return el
    })
    return () => { pieces.forEach(p => p.remove()) }
  }, [])

  return (
    <div id="done-celebrate" className="relative max-w-lg mx-auto text-center space-y-6 py-12 overflow-hidden">
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
