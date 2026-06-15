"use client"

// EmailMockup — réplica visual (NO funcional, no envía nada) de un email que
// el sistema manda solo. Sirve para que el dueño VEA el correo automático que
// recibe su cliente (seña pendiente, recordatorio de turno, etc.).
// El cuerpo del mail espeja el HTML real del BE (lib/turnosMail / crons).

import type { ReactNode } from "react"
import { Mail } from "lucide-react"

interface Props {
  from: string
  to?: string
  subject: string
  accent?: string
  /** Líneas/bloques del cuerpo. */
  children: ReactNode
  /** Etiqueta tipo "Automático" arriba a la derecha. */
  badge?: string
}

export function EmailMockup({
  from,
  to = "tu cliente",
  subject,
  accent = "var(--turnos-accent)",
  children,
  badge = "Enviado automáticamente",
}: Props) {
  return (
    <div className="rounded-xl overflow-hidden border bg-white shadow-sm" style={{ borderColor: "var(--turnos-line)" }}>
      {/* Barra de cliente de correo */}
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "var(--turnos-line)", background: "var(--turnos-tint, #f6f5f1)" }}>
        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--turnos-muted)" }}>
          <Mail className="h-3.5 w-3.5" /> Bandeja de entrada
        </div>
        {badge && (
          <span
            className="text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full text-white"
            style={{ background: accent }}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Encabezados */}
      <div className="px-4 pt-3 pb-2 border-b" style={{ borderColor: "var(--turnos-line)" }}>
        <p className="text-[13px] font-semibold leading-snug" style={{ color: "var(--turnos-ink)" }}>{subject}</p>
        <div className="mt-1.5 flex items-center gap-2 text-[11px]" style={{ color: "var(--turnos-muted)" }}>
          <span className="h-5 w-5 rounded-full text-white grid place-items-center text-[9px] font-bold shrink-0" style={{ background: accent }}>
            {(from || "?").trim().charAt(0).toUpperCase()}
          </span>
          <span className="truncate"><b style={{ color: "var(--turnos-ink)" }}>{from}</b> · para {to}</span>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="px-4 py-4 text-[13px] space-y-3" style={{ color: "var(--turnos-ink)" }}>
        {children}
      </div>
    </div>
  )
}

/** Botón ficticio (no navega) que imita el CTA del email. */
export function EmailButton({ children, accent = "var(--turnos-accent)" }: { children: ReactNode; accent?: string }) {
  return (
    <div className="py-1">
      <span
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-[12.5px] font-semibold select-none"
        style={{ background: accent }}
      >
        {children}
      </span>
    </div>
  )
}
