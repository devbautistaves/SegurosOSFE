"use client"

import { useEffect, useState } from "react"
import { suscripcionAPI, SuscripcionEstado } from "@/lib/api"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Crown, Check, Loader2, AlertCircle, ExternalLink, CreditCard } from "lucide-react"

function fmtMoney(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n)
}

export default function SuscripcionPage() {
  const [estado, setEstado] = useState<SuscripcionEstado | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
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
  const checkout = async (plan: "PRO_MENSUAL" | "PRO_ANUAL" | "PROMO") => {
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

  const esPRO = estado.plan === "PRO" && estado.planStatus === "ACTIVO"
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

      {/* Plan actual */}
      <div className={`rounded-xl p-6 border-2 ${esPRO ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-slate-50"}`}>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Plan actual</p>
            <p className="text-3xl font-bold">{esPRO ? "PRO" : "FREE"}</p>
            {estado.planVencimiento && (
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
      {!esPRO && (
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { plan: "PRO_MENSUAL" as const, ...estado.precios.PRO_MENSUAL, periodo: "mes", recomendado: false, extra: "" as string },
            { plan: "PRO_ANUAL"   as const, ...estado.precios.PRO_ANUAL,   periodo: "año", recomendado: true,
              extra: "Ahorrás 2 meses vs mensual" as string },
          ].map(p => (
            <div key={p.plan} className={`rounded-xl border-2 p-6 relative ${p.recomendado ? "border-blue-600 bg-blue-50" : "border-slate-200"}`}>
              {p.recomendado && (
                <div className="absolute -top-3 left-6 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Recomendado
                </div>
              )}
              <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">{p.descripcion}</p>
              <p className="text-4xl font-bold mt-2">{fmtMoney(p.monto)}</p>
              <p className="text-sm text-muted-foreground">por {p.periodo}</p>
              {p.extra && <p className="text-sm text-blue-700 font-medium mt-1">{p.extra}</p>}

              <ul className="space-y-2 mt-5 text-sm">
                <li className="flex gap-2"><Check className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" /> Pólizas ilimitadas</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" /> Cobranzas y siniestros ilimitados</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" /> Usuarios ilimitados</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" /> Notificaciones automáticas por email</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" /> Catálogos personalizables</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" /> Soporte prioritario</li>
              </ul>

              <button
                onClick={() => checkout(p.plan)}
                disabled={checkoutLoading !== null}
                className={`w-full h-11 mt-6 rounded-md font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${p.recomendado ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-slate-900 hover:bg-slate-800 text-white"}`}
              >
                {checkoutLoading === p.plan ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Pagar con MercadoPago <ExternalLink className="h-4 w-4" /></>}
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-center text-muted-foreground pt-4">
        Pagos procesados por MercadoPago. Podés cancelar cuando quieras desde esta misma pantalla.
      </p>

    </div>
    </DashboardLayout>
  )
}
