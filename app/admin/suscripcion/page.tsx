"use client"

import { useEffect, useState } from "react"
import { suscripcionAPI, SuscripcionEstado } from "@/lib/api"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Crown, Check, Loader2, AlertCircle, ExternalLink, CreditCard } from "lucide-react"

function fmtMoney(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n)
}

// Funciones completas del plan PRO (todo ilimitado). Se usa en las tarjetas
// PROMO y PRO para que el detalle del plan sea real y claro.
const FEATURES_PRO = [
  "Pólizas, cobranzas y siniestros ilimitados",
  "Usuarios ilimitados para tu equipo",
  "Seguimiento de siniestros por estado (denunciado → finalizado)",
  "Cobranzas de cuotas con cupón y carga de comprobantes",
  "Página del cliente con QR: ve sus pólizas, cuotas y siniestros",
  "Automatizaciones por WhatsApp (vencimientos, cobranzas, siniestros, bienvenida y cumpleaños)",
  "Avisos automáticos por email a tus clientes",
  "Importación de cartera desde Excel",
  "Catálogos personalizables (compañías, ramos, medios de pago)",
  "Logo y marca propia",
  "Soporte prioritario",
]

// PRO + Multicotizador: todo lo de PRO más el módulo de cotización múltiple.
const FEATURES_MULTI = [
  "Todo lo del plan PRO, sin límites",
  "🔥 Multicotizador: cotizá en varias compañías a la vez",
  "Comparación de precios y coberturas lado a lado",
]

// Lo que incluye el plan FREE (gratis), con sus límites.
const FEATURES_FREE = [
  "Hasta 20 pólizas",
  "Hasta 20 cobranzas",
  "Hasta 10 siniestros",
  "1 usuario",
  "Página del cliente con QR",
]

export default function SuscripcionPage() {
  const [estado, setEstado] = useState<SuscripcionEstado | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [ciclo, setCiclo] = useState<"mensual" | "anual">("anual")
  const [err, setErr] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const load = async () => {
    const token = localStorage.getItem("token")
    if (!token) return
    setLoading(true)
    try {
      const r = await suscripcionAPI.estado(token)
      setEstado(r)
    } catch (e: any) { setErr(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  // Volvió del checkout MP con ?preapproval_id=X → asociar al tenant logueado.
  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const preapprovalId = params.get("preapproval_id")
    if (!preapprovalId) return
    const token = localStorage.getItem("token")
    if (!token) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/proxy/suscripcion/asociar-preapproval", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ preapproval_id: preapprovalId }),
        })
        const json = await res.json()
        if (cancelled) return
        if (json.success) {
          setPaymentSuccess(true)
          await load()
        } else {
          setErr(json.error || "No pudimos asociar tu suscripción")
        }
      } catch (e: any) {
        if (!cancelled) setErr(e.message || "Error asociando la suscripción")
      }
    })()
    return () => { cancelled = true }
  }, [])

  // Click directo: pegamos al BE, recibimos init_point (plan template MP) y
  // redirigimos. MP usa el email de la cuenta del broker — sin modal de email.
  const checkout = async (plan: "PRO_MENSUAL" | "PRO_ANUAL" | "PROMO" | "PRO_MULTICOTIZADOR" | "PRO_MULTICOTIZADOR_ANUAL") => {
    const token = localStorage.getItem("token")
    if (!token) return
    setCheckoutLoading(plan)
    setErr(null)
    try {
      const r = await suscripcionAPI.checkout(token, plan)
      window.location.href = r.init_point
    } catch (e: any) { setErr(e.message); setCheckoutLoading(null) }
  }

  const cancelar = async () => {
    if (!confirm("¿Cancelar la suscripción? Mantenés el plan PRO hasta el vencimiento.")) return
    const token = localStorage.getItem("token")
    if (!token) return
    try {
      await suscripcionAPI.cancelar(token)
      await load()
    } catch (e: any) { setErr(e.message) }
  }

  if (loading || !estado) {
    return (
      <DashboardLayout requiredRole={["admin", "admin_seguros"]}>
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </DashboardLayout>
    )
  }

  const enTrial = !!(estado.trial && !estado.trial.vencido && estado.planCodigo === "TRIAL")
  const diasTrial = estado.trial?.diasRestantes ?? null
  const tienePlanPago = ["PROMO", "PRO_MENSUAL", "PRO_ANUAL", "PRO_MULTICOTIZADOR", "PRO_MULTICOTIZADOR_ANUAL"].includes(estado.planCodigo ?? "")
  const esPRO = tienePlanPago || (estado.plan === "PRO" && estado.planStatus === "ACTIVO")
  // Mostramos los planes para contratar si NO tiene un plan pago real
  // (incluye trial y vencido: queremos que enganchen la PROMO antes de que se
  // les corte la prueba).
  const mostrarPlanes = !tienePlanPago
  const usoBarras = [
    { label: "Pólizas",    actual: estado.uso.polizas,    limit: estado.limites.polizas },
    { label: "Cobranzas",  actual: estado.uso.cobranzas,  limit: estado.limites.cobranzas },
    { label: "Siniestros", actual: estado.uso.siniestros, limit: estado.limites.siniestros },
    { label: "Usuarios",   actual: estado.uso.usuarios,   limit: estado.limites.usuarios },
  ]

  return (
    <DashboardLayout requiredRole={["admin", "admin_seguros"]}>
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Crown className="h-6 w-6 text-amber-500" /> Tu suscripción
        </h1>
        <p className="text-muted-foreground text-sm">Gestioná tu plan y el uso de tu cuenta.</p>
      </div>

      {err && <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 p-3 text-sm flex items-start gap-2"><AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />{err}</div>}

      {/* Banner de prueba gratuita activa */}
      {enTrial && (
        <div className="rounded-xl border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
            <Crown className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-blue-900">Prueba PRO activa · acceso completo</p>
            <p className="text-sm text-blue-800/80 mt-0.5">
              {diasTrial != null
                ? <>Te quedan <b>{diasTrial} {diasTrial === 1 ? "día" : "días"}</b> de prueba gratuita.</>
                : <>Tu prueba gratuita está activa.</>}
              {estado.trial?.finaliza && <> Finaliza el {new Date(estado.trial.finaliza).toLocaleDateString("es-AR")}.</>}
            </p>
            <p className="text-xs text-blue-700/70 mt-1">Enganchá la PROMO de lanzamiento abajo para no perder el acceso cuando termine la prueba.</p>
          </div>
        </div>
      )}

      {/* Plan actual */}
      <div className={`rounded-xl p-6 border-2 ${esPRO ? "border-amber-300 bg-amber-50" : enTrial ? "border-blue-200 bg-blue-50/40" : "border-slate-200 bg-slate-50"}`}>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Plan actual</p>
            <p className="text-3xl font-bold">{esPRO ? "PRO" : enTrial ? "Prueba PRO" : "FREE"}</p>
            {enTrial && diasTrial != null && (
              <p className="text-sm text-blue-700 font-medium mt-1">{diasTrial} {diasTrial === 1 ? "día restante" : "días restantes"}</p>
            )}
            {!enTrial && estado.planVencimiento && (
              <p className="text-sm text-muted-foreground mt-1">
                {esPRO ? "Vence" : "Venció"}: {new Date(estado.planVencimiento).toLocaleDateString("es-AR")}
              </p>
            )}
          </div>
          {esPRO && (
            <button onClick={cancelar} className="text-sm text-red-600 hover:underline">Cancelar suscripción</button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {usoBarras.map(({ label, actual, limit }) => {
            const pct = limit ? Math.min(100, (actual / limit) * 100) : 0
            const cerca = !esPRO && limit && actual / limit >= 0.8
            return (
              <div key={label}>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-medium text-muted-foreground">{label}</span>
                  <span className={`text-sm font-semibold ${cerca ? "text-red-600" : ""}`}>
                    {actual}{limit ? ` / ${limit}` : " (ilimitado)"}
                  </span>
                </div>
                {limit && (
                  <div className="h-1.5 rounded-full bg-slate-200 mt-1.5 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${cerca ? "bg-red-500" : "bg-blue-600"}`} style={{ width: `${pct}%` }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Planes disponibles */}
      {mostrarPlanes && (
        <>
        {/* Qué incluye el plan FREE (gratis) + sus límites */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-700">Plan FREE (gratis)</p>
          <p className="text-xs text-slate-500 mt-0.5">Para arrancar. Cuando lo necesites, pasá a PRO y sacá los límites.</p>
          <ul className="grid sm:grid-cols-2 gap-x-5 gap-y-1.5 mt-3 text-sm text-slate-600">
            {FEATURES_FREE.map(f => (
              <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" /> {f}</li>
            ))}
          </ul>
          <p className="text-xs text-slate-400 mt-3">WhatsApp, avisos por email y marca propia están disponibles solo en PRO.</p>
        </div>

        {/* PROMO de lanzamiento destacada */}
        {estado.precios.PROMO && (
          <div className="rounded-xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 relative">
            <div className="absolute -top-3 left-6 bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              🔥 Promo de lanzamiento
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide font-semibold text-emerald-700">{estado.precios.PROMO.descripcion}</p>
                <div className="flex items-end gap-2 mt-2">
                  <p className="text-4xl font-bold text-emerald-900">{fmtMoney(estado.precios.PROMO.monto)}</p>
                  <p className="text-sm text-emerald-700 mb-1">/ mes · primeros 3 meses</p>
                </div>
                {estado.precios.PROMO.montoFinal && (
                  <p className="text-sm text-emerald-700/80 mt-1">
                    Después pasás a PRO Mensual ({fmtMoney(estado.precios.PROMO.montoFinal)}/mes). Cancelás cuando quieras.
                  </p>
                )}
                <ul className="grid sm:grid-cols-2 gap-x-5 gap-y-1.5 mt-4 text-sm text-emerald-900">
                  {FEATURES_PRO.map(f => (
                    <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" /> {f}</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => checkout("PROMO")}
                disabled={checkoutLoading !== null}
                className="md:w-56 h-12 rounded-md font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white flex-shrink-0"
              >
                {checkoutLoading === "PROMO" ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Aprovechar la promo <ExternalLink className="h-4 w-4" /></>}
              </button>
            </div>
          </div>
        )}

        {(() => {
          const anual = ciclo === "anual"
          const mensualMonto = estado.precios.PRO_MENSUAL?.monto || 0
          const anualMonto = estado.precios.PRO_ANUAL?.monto || 0
          const equiv = anualMonto ? Math.round(anualMonto / 12) : 0
          const plan = anual ? "PRO_ANUAL" : "PRO_MENSUAL"
          return (
            <>
              {/* Toggle Mensual / Anual */}
              <div className="flex items-center justify-center gap-3">
                <span className={`text-sm font-medium ${anual ? "text-muted-foreground" : "text-foreground"}`}>Mensual</span>
                <button
                  role="switch" aria-checked={anual} aria-label="Cambiar a facturación anual"
                  onClick={() => setCiclo(c => (c === "mensual" ? "anual" : "mensual"))}
                  className={`relative h-7 w-12 rounded-full transition-colors flex-shrink-0 ${anual ? "bg-blue-600" : "bg-slate-300"}`}>
                  <span className="absolute top-1 h-5 w-5 rounded-full bg-white transition-all" style={{ left: anual ? "26px" : "4px" }} />
                </button>
                <span className={`text-sm font-medium flex items-center gap-2 ${anual ? "text-foreground" : "text-muted-foreground"}`}>
                  Anual <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-600 text-white">2 MESES GRATIS</span>
                </span>
              </div>

              <div className="rounded-xl border-2 border-blue-600 bg-blue-50 p-6 relative max-w-md mx-auto">
                <div className="absolute -top-3 left-6 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  PRO completo
                </div>
                <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Todo sin límites</p>
                <div className="flex items-end gap-2 mt-2">
                  <p className="text-4xl font-bold">{fmtMoney(anual ? equiv : mensualMonto)}</p>
                  <span className="text-sm text-muted-foreground mb-1">por mes</span>
                </div>
                {anual ? (
                  <p className="text-sm text-muted-foreground mt-1">
                    <s>{fmtMoney(mensualMonto)}/mes</s> · facturado anualmente <b className="text-blue-700">{fmtMoney(anualMonto)}</b>
                  </p>
                ) : (
                  <p className="text-sm text-blue-700 font-medium mt-1">Pasate a anual y ahorrá 2 meses</p>
                )}

                <ul className="space-y-2 mt-5 text-sm">
                  {FEATURES_PRO.map(f => (
                    <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" /> {f}</li>
                  ))}
                  {anual && <li className="flex gap-2"><Check className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" /> 12 meses, 2 de regalo</li>}
                </ul>

                <button
                  onClick={() => checkout(plan)}
                  disabled={checkoutLoading !== null}
                  className="w-full h-11 mt-6 rounded-md font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {checkoutLoading === plan ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Pagar con MercadoPago <ExternalLink className="h-4 w-4" /></>}
                </button>
              </div>

              {/* PRO + Multicotizador */}
              {(() => {
                const multiMensual = estado.precios.PRO_MULTICOTIZADOR?.monto || 0
                const multiAnual = estado.precios.PRO_MULTICOTIZADOR_ANUAL?.monto || 0
                if (!multiMensual && !multiAnual) return null
                const multiEquiv = multiAnual ? Math.round(multiAnual / 12) : 0
                const multiPlan = anual ? "PRO_MULTICOTIZADOR_ANUAL" : "PRO_MULTICOTIZADOR"
                const multiDisponible = anual ? multiAnual > 0 : multiMensual > 0
                return (
                  <div className="rounded-xl border-2 border-violet-600 bg-violet-50 p-6 relative max-w-md mx-auto">
                    <div className="absolute -top-3 left-6 bg-violet-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                      PRO + Multicotizador
                    </div>
                    <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Todo PRO + cotización múltiple</p>
                    <div className="flex items-end gap-2 mt-2">
                      <p className="text-4xl font-bold">{fmtMoney(anual ? multiEquiv : multiMensual)}</p>
                      <span className="text-sm text-muted-foreground mb-1">por mes</span>
                    </div>
                    {anual ? (
                      <p className="text-sm text-muted-foreground mt-1">
                        <s>{fmtMoney(multiMensual)}/mes</s> · facturado anualmente <b className="text-violet-700">{fmtMoney(multiAnual)}</b>
                      </p>
                    ) : (
                      <p className="text-sm text-violet-700 font-medium mt-1">Pasate a anual y ahorrá 2 meses</p>
                    )}

                    <ul className="space-y-2 mt-5 text-sm">
                      {FEATURES_MULTI.map(f => (
                        <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-violet-600 flex-shrink-0 mt-0.5" /> {f}</li>
                      ))}
                    </ul>

                    {multiDisponible ? (
                      <button
                        onClick={() => checkout(multiPlan)}
                        disabled={checkoutLoading !== null}
                        className="w-full h-11 mt-6 rounded-md font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white"
                      >
                        {checkoutLoading === multiPlan ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Pagar con MercadoPago <ExternalLink className="h-4 w-4" /></>}
                      </button>
                    ) : (
                      <button disabled className="w-full h-11 mt-6 rounded-md font-semibold bg-slate-200 text-slate-500 flex items-center justify-center gap-2">
                        Próximamente
                      </button>
                    )}
                  </div>
                )
              })()}
            </>
          )
        })()}
        </>
      )}

      <p className="text-xs text-center text-muted-foreground pt-4">
        Pagos procesados por MercadoPago. Podés cancelar cuando quieras desde esta misma pantalla.
      </p>

    </div>
    </DashboardLayout>
  )
}
