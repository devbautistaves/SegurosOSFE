"use client"

// Contenido de las "lecciones" / reveals de SegurOS. Una sola fuente de verdad
// que reusan el onboarding (wizard) y la Academia (/admin/aprender).
// Cada lección enseña lo que el producto hace SOLO (crons de vigencias) o las
// funciones que más rinden y cuesta descubrir (avisos branded, cobranzas,
// renovación, siniestros). El contenido espeja el comportamiento REAL del BE.

import { RevealCard } from "./reveal-card"
import { EmailMockup, EmailButton } from "./email-mockup"
import { CronTimeline } from "./cron-timeline"
import {
  ShieldAlert, MailCheck, CalendarClock, RefreshCw, AlertTriangle,
  Clock, CheckCircle2, XCircle, FileWarning, CreditCard, MousePointerClick,
  MessageCircle,
  type LucideIcon,
} from "lucide-react"

// ── Reveal: avisos de vencimiento branded ────────────────────────────────────
export function AvisosReveal({ brokerNombre = "tu broker" }: { brokerNombre?: string }) {
  return (
    <RevealCard
      icon={<MailCheck className="h-4 w-4" />}
      eyebrow="Cómo se usa"
      title="Avisás vencimientos con tu marca y un solo click"
      subtitle="SegurOS arma la lista de quién vence y vos disparás el aviso. El mail sale con tu logo, tu color y tu nombre."
    >
      <div className="space-y-4">
        <EmailMockup
          from={brokerNombre}
          to="tu asegurado"
          subject={`Su seguro está PRÓXIMO A VENCER — ${brokerNombre}`}
          badge="Con tu marca"
        >
          <p>Estimado/a cliente,</p>
          <p>Le informamos que su póliza <b>vence en los próximos días</b>. Para continuar con su cobertura sin interrupciones, le pedimos regularizar el pago a la brevedad.</p>
          <EmailButton>Ver detalle</EmailButton>
          <p style={{ fontSize: 12, color: "var(--turnos-muted)" }}>💡 Circular sin seguro vigente puede traer consecuencias legales y económicas.</p>
        </EmailMockup>

        <CronTimeline
          steps={[
            { icon: <CalendarClock className="h-3.5 w-3.5" />, tone: "accent", title: "SegurOS detecta los vencimientos", detail: "Arma 3 grupos automáticamente: próximo a vencer, vence hoy y vencido." },
            { icon: <MousePointerClick className="h-3.5 w-3.5" />, tone: "accent", title: "Vos elegís a quién avisar", detail: "Desde Cobranzas, mandás el aviso a uno o a todo el grupo con un click." },
            { icon: <MailCheck className="h-3.5 w-3.5" />, tone: "ok", title: "Sale con tu marca", detail: "Tu logo, tu color y tu nombre. SegurOS no aparece en el mail del cliente." },
          ]}
        />
        <div className="rounded-lg p-3 text-[12.5px] flex items-start gap-2" style={{ background: "color-mix(in srgb, var(--turnos-accent) 10%, transparent)", color: "var(--turnos-accent-ink)" }}>
          <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
          <span>El mismo aviso tiene 3 tonos según el caso: <b>próximo a vencer</b>, <b>vence hoy</b> y <b>vencido</b>. SegurOS elige el texto correcto por vos.</span>
        </div>
      </div>
    </RevealCard>
  )
}

// ── Reveal: el cron de vigencias (lo invisible) ──────────────────────────────
export function VigenciasReveal() {
  return (
    <RevealCard
      icon={<RefreshCw className="h-4 w-4" />}
      eyebrow="Lo que pasa detrás"
      title="Tus pólizas cambian de estado solas"
      subtitle="Una vez por día SegurOS revisa las fechas y mueve cada póliza al estado que corresponde. No tenés que tocar nada."
    >
      <div className="space-y-4">
        <CronTimeline
          steps={[
            { icon: <CheckCircle2 className="h-3.5 w-3.5" />, tone: "ok", title: "VIGENTE", detail: "Mientras falten más de 7 días para el vencimiento." },
            { icon: <Clock className="h-3.5 w-3.5" />, tone: "accent", title: "→ A RENOVAR", detail: "Cuando faltan 7 días o menos. Aparece en tus tableros para que la trabajes." },
            { icon: <XCircle className="h-3.5 w-3.5" />, tone: "danger", title: "→ NO VIGENTE", detail: "Apenas pasa la fecha de fin. Pólizas ANULADA o PENDIENTE no se tocan." },
            { icon: <FileWarning className="h-3.5 w-3.5" />, tone: "danger", title: "Cuotas → VENCIDA", detail: "Las cuotas en efectivo/cupón impagas se marcan vencidas solas cada día." },
          ]}
        />
        <div className="rounded-lg p-3 text-[12.5px] flex items-start gap-2" style={{ background: "color-mix(in srgb, var(--turnos-accent) 10%, transparent)", color: "var(--turnos-accent-ink)" }}>
          <RefreshCw className="h-4 w-4 mt-0.5 shrink-0" />
          <span>Por eso tu tablero de <b>A renovar</b> y tus cuotas vencidas están siempre al día sin que cargues nada a mano.</span>
        </div>
      </div>
    </RevealCard>
  )
}

// ── Lección: cobranzas en efectivo ───────────────────────────────────────────
export function CobranzasLesson() {
  const items = [
    { t: "Se crean solas", d: "Cuando una póliza usa medio de pago Efectivo o Cupón, SegurOS le genera la fila de cobranza automáticamente." },
    { t: "Marcás los pagos", d: "Registrás cada cuota como pagada. Lo que queda impago se marca vencido solo." },
    { t: "Avisás con un click", d: "Desde Cobranzas mandás el recordatorio de pago branded al asegurado." },
    { t: "Pólizas de aseguradora", d: "Si la póliza la cobra directo la compañía (tarjeta/CBU), no genera cobranza acá." },
  ]
  return (
    <RevealCard
      icon={<CreditCard className="h-4 w-4" />}
      eyebrow="Cómo se usa"
      title="Cobranzas en efectivo, ordenadas"
      subtitle="SegurOS te lleva el control de las cuotas que cobrás vos, sin planillas sueltas."
    >
      <div className="grid sm:grid-cols-2 gap-2.5">
        {items.map((i) => (
          <div key={i.t} className="rounded-lg border p-3" style={{ borderColor: "var(--turnos-line)" }}>
            <p className="text-[13px] font-semibold" style={{ color: "var(--turnos-ink)" }}>{i.t}</p>
            <p className="text-[12px] mt-0.5" style={{ color: "var(--turnos-muted)" }}>{i.d}</p>
          </div>
        ))}
      </div>
    </RevealCard>
  )
}

// ── Lección: renovación ──────────────────────────────────────────────────────
export function RenovacionLesson() {
  return (
    <RevealCard
      icon={<RefreshCw className="h-4 w-4" />}
      eyebrow="Cómo se usa"
      title="Renovar una póliza, sin recargar todo"
      subtitle="Cuando una póliza pasa a A RENOVAR, la renovás en un paso y arranca un nuevo período de vigencia."
    >
      <ul className="space-y-2 text-[13px]" style={{ color: "var(--turnos-ink)" }}>
        <li className="flex gap-2"><Clock className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--turnos-accent)" }} /> Las pólizas a 7 días o menos del vencimiento aparecen como <b>A renovar</b>.</li>
        <li className="flex gap-2"><RefreshCw className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--turnos-accent)" }} /> Desde la póliza tocás <b>Renovar</b> y definís la nueva vigencia, sin recargar los datos del asegurado.</li>
        <li className="flex gap-2"><MailCheck className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--turnos-accent)" }} /> Combinalo con los avisos de vencimiento para que ningún cliente se te caiga.</li>
      </ul>
      <p className="text-[12px] mt-3" style={{ color: "var(--turnos-muted)" }}>Una póliza <b>ANULADA</b> no se puede renovar: ahí se carga una nueva.</p>
    </RevealCard>
  )
}

// ── Lección: siniestros y seguimiento ────────────────────────────────────────
export function SiniestrosLesson() {
  return (
    <RevealCard
      icon={<AlertTriangle className="h-4 w-4" />}
      eyebrow="Cómo se usa"
      title="Siniestros y seguimiento en un solo lugar"
      subtitle="Cargás el siniestro, lo seguís hasta cerrarlo y queda todo el historial del cliente junto."
    >
      <ul className="space-y-2 text-[13px]" style={{ color: "var(--turnos-ink)" }}>
        <li className="flex gap-2"><AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--turnos-accent)" }} /> Registrás el siniestro con su tipo (robo, choque, granizo, cristales…) y lo seguís <b>en trámite</b> hasta resolverlo.</li>
        <li className="flex gap-2"><CalendarClock className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--turnos-accent)" }} /> En <b>Seguimiento</b> anotás cada gestión y pendiente, para no perder el hilo de ningún caso.</li>
        <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--turnos-accent)" }} /> Todo queda asociado al asegurado: cuando te llama, tenés el contexto a mano.</li>
      </ul>
    </RevealCard>
  )
}

// ── Reveal: avisos automáticos por WhatsApp ──────────────────────────────────
export function WhatsAppAvisosReveal() {
  return (
    <RevealCard
      icon={<MessageCircle className="h-4 w-4" />}
      eyebrow="Lo que pasa detrás"
      title="WhatsApp: avisos automáticos a tus asegurados"
      subtitle="Conectás tu WhatsApp una vez y SegurOS le escribe solo al asegurado en cada momento clave: pólizas, cuotas y siniestros."
    >
      <div className="space-y-4">
        <CronTimeline
          steps={[
            { icon: <ShieldAlert className="h-3.5 w-3.5" />, tone: "accent", title: "Pólizas por vencer", detail: "Aviso antes, el día que vence y si queda vencida." },
            { icon: <CreditCard className="h-3.5 w-3.5" />, tone: "accent", title: "Cuotas por vencer", detail: "El mismo esquema de 3 avisos, pero para cada cuota de cobranza." },
            { icon: <AlertTriangle className="h-3.5 w-3.5" />, tone: "ok", title: "Siniestros", detail: "Aviso automático cada vez que actualizás el estado de un siniestro." },
          ]}
        />
        <div className="rounded-lg p-3 text-[12.5px] flex items-start gap-2" style={{ background: "color-mix(in srgb, var(--turnos-accent) 10%, transparent)", color: "var(--turnos-accent-ink)" }}>
          <MessageCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>También manda <b>Pago confirmado</b>, <b>Bienvenida</b> a cada cliente nuevo, saludo de <b>Cumpleaños</b> y aviso de <b>Anulación</b> de póliza. Conectá tu WhatsApp y editá cada mensaje desde <b>WhatsApp</b> en el menú.</span>
        </div>
      </div>
    </RevealCard>
  )
}

// ── Registro de lecciones para la Academia ───────────────────────────────────
export interface LessonMeta {
  key: string
  title: string
  summary: string
  icon: LucideIcon
  minutos: number
}

export const LESSONS: LessonMeta[] = [
  { key: "avisos",     title: "Avisos de vencimiento", summary: "Cómo SegurOS arma los grupos de vencimiento y mandás el aviso branded con un click.", icon: MailCheck,     minutos: 2 },
  { key: "vigencias",  title: "Estados automáticos",   summary: "Lo que SegurOS hace solo: pólizas a A renovar / no vigente y cuotas vencidas.",       icon: RefreshCw,     minutos: 1 },
  { key: "cobranzas",  title: "Cobranzas en efectivo", summary: "Cómo se crean las cobranzas, marcás pagos y enviás recordatorios.",                   icon: CreditCard,    minutos: 2 },
  { key: "renovacion", title: "Renovar pólizas",       summary: "De A renovar a una nueva vigencia, sin recargar los datos del cliente.",              icon: Clock,         minutos: 1 },
  { key: "siniestros", title: "Siniestros y seguimiento", summary: "Cargá un siniestro, seguilo en trámite y mantené el historial del asegurado.",     icon: AlertTriangle, minutos: 2 },
  { key: "whatsapp",   title: "WhatsApp: avisos automáticos", summary: "Pólizas, cuotas, siniestros, pagos, bienvenida y cumpleaños: todo por WhatsApp solo.", icon: MessageCircle, minutos: 1 },
]

/** Render del contenido de una lección por key (reusado por la Academia). */
export function LessonContent({ lessonKey, ctx }: { lessonKey: string; ctx: { nombre: string } }) {
  switch (lessonKey) {
    case "avisos":     return <AvisosReveal brokerNombre={ctx.nombre} />
    case "vigencias":  return <VigenciasReveal />
    case "cobranzas":  return <CobranzasLesson />
    case "renovacion": return <RenovacionLesson />
    case "siniestros": return <SiniestrosLesson />
    case "whatsapp":   return <WhatsAppAvisosReveal />
    default:           return null
  }
}
