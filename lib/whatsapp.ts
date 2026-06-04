// Helper para enviar recordatorios por WhatsApp via wa.me.
// No usa la API oficial de WhatsApp Business — abre el link en una pestaña
// nueva y el usuario manda el mensaje desde su propio WhatsApp.

export type RecordatorioTipo = "proximo_vencer" | "vence_hoy" | "vencido" | "personalizado"

export interface RecordatorioInput {
  cliente: string
  aseguradora?: string
  ramo?: string
  patente?: string
  datosRiesgo?: string
  diaVto?: number
  mesLabel?: string
  nombreBroker?: string
}

function bullet(label: string, value?: string | number | null) {
  if (value === undefined || value === null || value === "") return ""
  return `• ${label}: ${value}\n`
}

export function buildRecordatorioTexto(tipo: RecordatorioTipo, x: RecordatorioInput): string {
  const broker = x.nombreBroker ? ` — ${x.nombreBroker}` : ""
  const detalle =
    bullet("Aseguradora", x.aseguradora) +
    bullet("Ramo",        x.ramo) +
    bullet("Patente",     x.patente) +
    bullet("Riesgo",      x.datosRiesgo)

  if (tipo === "proximo_vencer") {
    const cuando = x.diaVto ? `el ${x.diaVto} de ${x.mesLabel || "este mes"}` : "próximamente"
    return `Hola ${x.cliente}, te recordamos que tu seguro vence ${cuando}.

${detalle}
Si ya pagaste, ignorá este mensaje. Cualquier duda, avisanos.

Gracias!${broker}`
  }
  if (tipo === "vence_hoy") {
    return `Hola ${x.cliente}, *tu seguro vence HOY*.

${detalle}
Te pedimos que regularices el pago para no perder la cobertura.

Gracias!${broker}`
  }
  if (tipo === "vencido") {
    return `Hola ${x.cliente}, *tu cuota está vencida*.

${detalle}
Por favor regularizá el pago a la brevedad para mantener tu cobertura activa.

Gracias!${broker}`
  }
  return `Hola ${x.cliente},\n\n${detalle}\n\n${broker}`
}

export function buildWhatsAppLink(telefono: string, texto: string): string {
  const num = telefono.replace(/[^0-9]/g, "")
  // Asume Argentina si no empieza con 54
  const numFull = num.startsWith("54") ? num : `54${num}`
  return `https://wa.me/${numFull}?text=${encodeURIComponent(texto)}`
}

export function abrirWhatsApp(telefono: string, tipo: RecordatorioTipo, x: RecordatorioInput) {
  const texto = buildRecordatorioTexto(tipo, x)
  const url = buildWhatsAppLink(telefono, texto)
  window.open(url, "_blank")
}
