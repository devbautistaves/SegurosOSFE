"use client"

// CronTimeline — explica una automatización temporal (un cron) como una línea
// de tiempo de pasos. Ej: "cliente reserva → recibe email → si no paga en 1h,
// el turno se cancela solo (revisamos cada 10 min)".
// Reusable: cada paso lleva su icono y un tono (default/accent/danger/ok).

import type { ReactNode } from "react"

export interface CronStep {
  icon: ReactNode
  title: ReactNode
  detail?: ReactNode
  tone?: "default" | "accent" | "danger" | "ok"
}

const TONE: Record<NonNullable<CronStep["tone"]>, { dot: string; ring: string }> = {
  default: { dot: "var(--turnos-muted)", ring: "var(--turnos-line)" },
  accent:  { dot: "var(--turnos-accent)", ring: "color-mix(in srgb, var(--turnos-accent) 35%, transparent)" },
  danger:  { dot: "var(--turnos-danger, #dc2626)", ring: "color-mix(in srgb, var(--turnos-danger, #dc2626) 35%, transparent)" },
  ok:      { dot: "#16a34a", ring: "rgba(22,163,74,.35)" },
}

export function CronTimeline({ steps }: { steps: CronStep[] }) {
  return (
    <ol className="relative space-y-3.5">
      {steps.map((s, i) => {
        const tone = TONE[s.tone || "default"]
        const last = i === steps.length - 1
        return (
          <li key={i} className="relative flex gap-3">
            {/* línea conectora */}
            {!last && (
              <span
                className="absolute left-[13px] top-7 bottom-[-14px] w-px"
                style={{ background: "var(--turnos-line-strong)" }}
              />
            )}
            <span
              className="relative z-10 h-7 w-7 shrink-0 rounded-full grid place-items-center text-white"
              style={{ background: tone.dot, boxShadow: `0 0 0 4px ${tone.ring}` }}
            >
              {s.icon}
            </span>
            <div className="pt-0.5 min-w-0">
              <p className="text-[13px] font-semibold leading-tight" style={{ color: "var(--turnos-ink)" }}>{s.title}</p>
              {s.detail && <p className="text-[12px] mt-0.5" style={{ color: "var(--turnos-muted)" }}>{s.detail}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
