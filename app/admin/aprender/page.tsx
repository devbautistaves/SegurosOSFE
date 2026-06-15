"use client"

// Academia SegurOS — hub reabrible de lecciones cortas. Reusa el contenido
// educativo del onboarding (components/learn/lessons): lo invisible (crons de
// vigencias) + cómo se usan las funciones clave (avisos branded, cobranzas,
// renovación, siniestros). El progreso (qué lecciones vio) se persiste en
// Aseguradora.onboarding.academia.vistas.

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { aseguradoraAPI, onboardingAPI, type Aseguradora } from "@/lib/api"
import { LESSONS, LessonContent } from "@/components/learn/lessons"
import { GraduationCap, Check, X, Clock, ArrowRight, Loader2 } from "lucide-react"

export default function AprenderPage() {
  return (
    <DashboardLayout requiredRole={["admin", "admin_seguros"]}>
      <Academia />
    </DashboardLayout>
  )
}

function Academia() {
  const [aseg, setAseg] = useState<Aseguradora | null>(null)
  const [vistas, setVistas] = useState<string[]>([])
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token") || ""
    if (!token) { setLoading(false); return }
    Promise.all([
      aseguradoraAPI.getMe(token).then(r => setAseg(r.aseguradora)).catch(() => {}),
      onboardingAPI.state(token).then(r => setVistas(r.onboarding?.academia?.vistas || [])).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const ctx = useMemo(() => ({ nombre: aseg?.nombre || "tu broker" }), [aseg])

  const marcarVista = (key: string) => {
    setVistas(prev => {
      if (prev.includes(key)) return prev
      const next = [...prev, key]
      const token = localStorage.getItem("token") || ""
      if (token) onboardingAPI.advance(token, { academiaVistas: next }).catch(() => {})
      return next
    })
  }

  const abrir = (key: string) => { setOpenKey(key); marcarVista(key) }

  const completadas = vistas.filter(v => LESSONS.some(l => l.key === v)).length
  const openLesson = LESSONS.find(l => l.key === openKey)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 rounded-2xl grid place-items-center text-white shrink-0" style={{ background: "var(--turnos-accent)" }}>
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: "var(--turnos-accent)" }}>Academia</p>
          <h1 className="text-2xl font-bold leading-tight" style={{ color: "var(--turnos-ink)" }}>Sacale todo el jugo a SegurOS</h1>
          <p className="text-sm mt-1" style={{ color: "var(--turnos-muted)" }}>
            Lecciones cortas sobre lo que el sistema hace solo y las funciones que más rinden.
          </p>
        </div>
      </div>

      {/* Progreso */}
      <div className="rounded-2xl border p-4 flex items-center gap-4 bg-card" style={{ borderColor: "var(--turnos-line)" }}>
        <div className="flex-1">
          <div className="flex items-center justify-between text-[12px] mb-1.5" style={{ color: "var(--turnos-muted)" }}>
            <span>Tu progreso</span>
            <span>{completadas}/{LESSONS.length}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--turnos-line)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${(completadas / LESSONS.length) * 100}%`, background: "var(--turnos-accent)" }} />
          </div>
        </div>
      </div>

      {/* Grilla de lecciones */}
      {loading ? (
        <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--turnos-accent)" }} /></div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {LESSONS.map((l) => {
            const Icon = l.icon
            const vista = vistas.includes(l.key)
            return (
              <button
                key={l.key}
                onClick={() => abrir(l.key)}
                className="rounded-2xl border p-4 text-left transition-all hover:shadow-md group bg-card"
                style={{ borderColor: "var(--turnos-line)" }}
              >
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl grid place-items-center shrink-0"
                    style={{ background: "color-mix(in srgb, var(--turnos-accent) 14%, transparent)", color: "var(--turnos-accent)" }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[15px] leading-tight" style={{ color: "var(--turnos-ink)" }}>{l.title}</p>
                      {vista && <Check className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--turnos-accent)" }} />}
                    </div>
                    <p className="text-[12.5px] mt-1" style={{ color: "var(--turnos-muted)" }}>{l.summary}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px]" style={{ color: "var(--turnos-muted)" }}>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {l.minutos} min</span>
                      <span className="inline-flex items-center gap-1 font-medium group-hover:gap-1.5 transition-all" style={{ color: "var(--turnos-accent-ink)" }}>
                        {vista ? "Repasar" : "Ver lección"} <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Modal de lección */}
      {openLesson && (
        <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={() => setOpenKey(null)}>
          <div className="w-full max-w-2xl my-auto" onClick={(e) => e.stopPropagation()}>
            <div className="rounded-2xl border p-5 sm:p-6 space-y-4 bg-card" style={{ borderColor: "var(--turnos-line)" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <openLesson.icon className="h-5 w-5" style={{ color: "var(--turnos-accent)" }} />
                  <h2 className="text-xl font-bold" style={{ color: "var(--turnos-ink)" }}>{openLesson.title}</h2>
                </div>
                <button onClick={() => setOpenKey(null)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted transition-colors" style={{ color: "var(--turnos-muted)" }}>
                  <X className="h-4 w-4" />
                </button>
              </div>
              <LessonContent lessonKey={openLesson.key} ctx={ctx} />
              <div className="flex justify-end pt-1">
                <button onClick={() => setOpenKey(null)} className="px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "var(--turnos-ink)" }}>
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
