"use client"

// RevealCard — contenedor "Lo que pasa detrás" del onboarding/academia.
// Muestra lo INVISIBLE del producto (mails automáticos, crons, etc.) con una
// entrada animada. Reusable entre TurnOS/TallerOS/SegurOS: el color de acento
// sale de las CSS vars del tema (--turnos-accent por defecto). Para otra app,
// pasá `accent`/`accentInk` o cambiá las vars del :root.

import { useEffect, useRef, useState, type ReactNode } from "react"
import { Eye } from "lucide-react"

interface Props {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  icon?: ReactNode
  children: ReactNode
  /** Si true, anima al entrar en viewport (academia). Si false, anima al montar. */
  revealOnView?: boolean
  accent?: string
  className?: string
}

export function RevealCard({
  eyebrow = "Lo que pasa detrás",
  title,
  subtitle,
  icon,
  children,
  revealOnView = false,
  accent = "var(--turnos-accent)",
  className = "",
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(!revealOnView)

  useEffect(() => {
    if (!revealOnView || shown) return
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined") { setShown(true); return }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect() } },
      { threshold: 0.25 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [revealOnView, shown])

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-500 ease-out ${
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${className}`}
      style={{
        borderColor: "color-mix(in srgb, " + accent + " 30%, transparent)",
        background: "color-mix(in srgb, " + accent + " 6%, var(--turnos-panel, #fff))",
      }}
    >
      {/* halo de acento */}
      <div
        className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full blur-[70px]"
        style={{ background: "color-mix(in srgb, " + accent + " 22%, transparent)" }}
      />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="h-7 w-7 rounded-lg flex items-center justify-center text-white shrink-0"
            style={{ background: accent }}
          >
            {icon || <Eye className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: accent }}>
              {eyebrow}
            </p>
            <p className="font-display text-[15px] leading-tight" style={{ color: "var(--turnos-ink)" }}>
              {title}
            </p>
          </div>
        </div>
        {subtitle && (
          <p className="text-[13px] mb-3" style={{ color: "var(--turnos-muted)" }}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  )
}
