// ============================================================
// SuperAdmin API client (vía /api/proxy → BE)
// ============================================================

const API_BASE = "/api/proxy/superadmin"

function token() {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("superadmin_token") || localStorage.getItem("superadmin_pending_token") || ""
}

async function call<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as any),
  }
  const t = token()
  if (t) headers.Authorization = `Bearer ${t}`

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.success === false) {
    throw new Error(data.error || `HTTP ${res.status}`)
  }
  return data
}

// Auth
export const saAuth = {
  requestOTP: (email: string, password: string) =>
    call<{ success: boolean; pendingToken: string; sentTo: string }>(`/auth/request-otp`, {
      method: "POST", body: JSON.stringify({ email, password }),
    }),
  verifyOTP: (code: string) =>
    call<{ success: boolean; token: string; superAdmin: any; mustChangePassword: boolean }>(`/auth/verify-otp`, {
      method: "POST", body: JSON.stringify({ code }),
    }),
  changePassword: (currentPassword: string, newPassword: string) =>
    call<{ success: boolean }>(`/auth/change-password`, {
      method: "POST", body: JSON.stringify({ currentPassword, newPassword }),
    }),
  logout: () => call<{ success: boolean }>(`/auth/logout`, { method: "POST" }),
  me: () => call<{ success: boolean; superAdmin: any }>(`/me`),
}

// Dashboard
export const saDashboard = {
  get: () => call<{
    success: boolean
    revenue: { mrr: number; arr: number; growth: number | null }
    brokers: { total: number; activos: number; free: number; pro: number; proMensual: number; proAnual: number; vencidos: number }
    signups: { ultimos30: number; previos30: number; growthPct: number | null; daily: { date: string; count: number }[] }
    churn: { cancelados30d: number; rate: number }
    proximasVencer: { en7dias: number; en30dias: number }
    totales: { users: number; polizas: number }
    topBrokers: { _id: string; polizas: number; nombre: string; plan: string; planStatus: string }[]
    pagosRecientes: any[]
  }>(`/dashboard`),
}

// Aseguradoras
export const saAseguradoras = {
  list: (params: Record<string, string | number> = {}) => {
    const qs = new URLSearchParams(params as any).toString()
    return call<{ success: boolean; aseguradoras: any[]; total: number; page: number; totalPages: number }>(`/aseguradoras?${qs}`)
  },
  detail: (id: string) => call<{
    success: boolean; aseguradora: any; uso: any; pagosRecientes: any[]; adminUsers: any[]
  }>(`/aseguradoras/${id}`),
  forzarPlan: (id: string, body: { plan?: string; planTipo?: string | null; planStatus?: string; planVencimiento?: string; motivo?: string }) =>
    call<{ success: boolean; aseguradora: any }>(`/aseguradoras/${id}/plan`, { method: "PUT", body: JSON.stringify(body) }),
  // Variante semántica del endpoint anterior. Acción: PROMO_3M | PRO_MENSUAL |
  // PRO_ANUAL | EXTENDER_TRIAL | CORTAR. El BE setea planCodigo + plan +
  // planStatus + planVencimiento + promoFinaliza/trialFinaliza coherentes.
  asignarPlanAccion: (id: string, body: { accion: "PROMO_3M" | "PRO_MENSUAL" | "PRO_ANUAL" | "EXTENDER_TRIAL" | "CORTAR"; dias?: number; motivo: string }) =>
    call<{ success: boolean; aseguradora: any }>(`/aseguradoras/${id}/plan`, { method: "PUT", body: JSON.stringify(body) }),
  suspend: (id: string, motivo?: string) =>
    call<{ success: boolean; aseguradora: any }>(`/aseguradoras/${id}/suspend`, { method: "PUT", body: JSON.stringify({ motivo }) }),
  reactivate: (id: string) =>
    call<{ success: boolean; aseguradora: any }>(`/aseguradoras/${id}/reactivate`, { method: "PUT" }),
  impersonate: (id: string) =>
    call<{ success: boolean; token: string; user: any; aseguradora: any }>(`/aseguradoras/${id}/impersonate`, { method: "POST" }),
  create: (body: any) => call<{ success: boolean; aseguradora: any; adminUser: any }>(`/aseguradoras`, { method: "POST", body: JSON.stringify(body) }),
  remove: (id: string) =>
    call<{ success: boolean; deleted: Record<string, any> }>(`/aseguradoras/${id}`, { method: "DELETE" }),
  resetUserPassword: (id: string, userId: string) =>
    call<{ success: boolean; tempPassword: string }>(`/aseguradoras/${id}/reset-user-password`, { method: "POST", body: JSON.stringify({ userId }) }),

  // Multi-delete con 2FA por email.
  requestDeleteBatchOtp: (aseguradoraIds: string[]) =>
    call<{ success: boolean; email: string; cantidad: number; sentTo: string }>(
      `/aseguradoras/delete-batch/request-otp`,
      { method: "POST", body: JSON.stringify({ aseguradoraIds }) }
    ),
  confirmDeleteBatch: (aseguradoraIds: string[], code: string) =>
    call<{
      success: boolean
      eliminados: number
      fallidos: number
      detalles: Array<{ aseguradoraId: string; nombre?: string; ok: boolean; error?: string; borrados?: any }>
    }>(`/aseguradoras/delete-batch/confirm`, {
      method: "POST", body: JSON.stringify({ aseguradoraIds, code }),
    }),
}

// Pagos
export const saPagos = {
  list: (params: Record<string, string | number> = {}) => {
    const qs = new URLSearchParams(params as any).toString()
    return call<{ success: boolean; pagos: any[]; total: number; page: number; totalPages: number }>(`/pagos?${qs}`)
  },
  refund: (id: string, motivo: string) =>
    call<{ success: boolean; pago: any }>(`/pagos/${id}/refund`, { method: "POST", body: JSON.stringify({ motivo }) }),
}

// Broadcast
export const saBroadcast = {
  email: (body: { subject: string; html: string; targetPlan?: string; targetRole?: string }) =>
    call<{ success: boolean; destinatarios: number; enviados: number; fallidos: number }>(`/broadcast/email`, { method: "POST", body: JSON.stringify(body) }),
  banner: (body: { activo: boolean; texto?: string; color?: string }) =>
    call<{ success: boolean; config: any }>(`/broadcast/banner`, { method: "PUT", body: JSON.stringify(body) }),
  // Pricing v2 Fase E: blast PROMO de lanzamiento.
  promoLanzamiento: (body: { dryRun?: boolean } = {}) =>
    call<{
      success: boolean
      dryRun?: boolean
      total: number
      ok?: number; fail?: number
      muestra?: Array<{ nombre: string; email: string; plan?: string; planCodigo?: string }>
      fails?: Array<{ aseguradoraId: string; email: string; error: string }>
    }>(`/blast/promo-lanzamiento`, { method: "POST", body: JSON.stringify(body) }),
}

// Audit log
export const saAuditLog = {
  list: (params: Record<string, string | number> = {}) => {
    const qs = new URLSearchParams(params as any).toString()
    return call<{ success: boolean; logs: any[]; total: number; page: number; totalPages: number }>(`/audit-log?${qs}`)
  },
}

// Health
export const saHealth = {
  get: () => call<{ success: boolean; health: any }>(`/health`),
}

// Config
export const saConfig = {
  get: () => call<{ success: boolean; config: any }>(`/config`),
  update: (patch: Record<string, any>) => call<{ success: boolean; config: any }>(`/config`, { method: "PUT", body: JSON.stringify(patch) }),
}

// Search
export const saSearch = {
  query: (q: string) => call<{ success: boolean; results: { type: string; id: string; label: string; sub: string }[] }>(`/search?q=${encodeURIComponent(q)}`),
}
