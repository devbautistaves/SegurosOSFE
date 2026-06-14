"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Clock, Crown, X, Sparkles, Lock, ChevronRight } from "lucide-react"
import { suscripcionAPI, SuscripcionEstado } from "@/lib/api"

/**
 * Cubre los 3 estados del flujo TRIAL de SegurOS (Pricing v2 Fase A/B):
 *   - planCodigo === "TRIAL"  → banner top con X días restantes
 *   - planCodigo === "TRIAL" + diasRestantes <= 1 → además modal bloqueante
 *     (cerrable, sessionStorage para no repetir en cada nav).
 *   - planCodigo === "VENCIDO" → overlay full-screen NO cerrable, CTAs a
 *     /admin/suscripcion. El BE bloquea recursos vía límite FREE; esto es UX.
 *
 * Devuelve null para PRO_MENSUAL / PRO_ANUAL / PROMO o estado desconocido.
 */
export function TrialBanner() {
  const [estado, setEstado] = useState<SuscripcionEstado | null>(null)
  const [modalCerrado, setModalCerrado] = useState(false)
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return
    fetched.current = true
    suscripcionAPI.estado(token).then(r => { setEstado(r) }).catch(() => {})

    if (typeof window !== "undefined" && sessionStorage.getItem("trialModalCerrado") === "1") {
      setModalCerrado(true)
    }
  }, [])

  const cerrarModal = () => {
    setModalCerrado(true)
    if (typeof window !== "undefined") sessionStorage.setItem("trialModalCerrado", "1")
  }

  if (!estado) return null

  // ── Estado 3: VENCIDO ────────────────────────────────────────────────────
  if (estado.planCodigo === "VENCIDO" || (estado.planCodigo === "TRIAL" && estado.trial?.vencido)) {
    return <BloqueoVencido />
  }

  if (estado.planCodigo !== "TRIAL" || !estado.trial) return null

  const dias = estado.trial.diasRestantes
  if (dias == null) return null

  return (
    <>
      <Link
        href="/admin/suscripcion"
        className={
          dias <= 2
            ? "block bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2.5 hover:from-red-600 hover:to-red-700 transition-all"
            : "block bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2.5 hover:from-emerald-600 hover:to-emerald-700 transition-all"
        }
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm font-medium truncate">
              {dias === 0
                ? <>Tu prueba <strong>vence hoy</strong>. Suscribite ahora para no perder acceso.</>
                : dias === 1
                ? <>Tu prueba <strong>vence mañana</strong>. Elegí un plan para seguir cargando pólizas.</>
                : <>Te quedan <strong>{dias} días</strong> de prueba PRO completa. Elegí tu plan cuando quieras.</>}
            </p>
          </div>
          <div className="flex items-center gap-1 text-sm font-semibold whitespace-nowrap">
            Ver planes <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </Link>

      {dias <= 1 && !modalCerrado && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={cerrarModal}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-700"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-orange-500 font-semibold">Última oportunidad</p>
                <h2 className="text-xl font-bold leading-tight">
                  {dias === 0 ? "Tu prueba vence hoy" : "Tu prueba vence mañana"}
                </h2>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-5">
              Suscribite ahora para seguir cargando pólizas, cobranzas y siniestros sin límites.
              Tus datos quedan guardados — si dejás vencer, vas a poder verlos pero no crear
              ninguno nuevo hasta que actives un plan.
            </p>
            <Link
              href="/admin/suscripcion"
              onClick={cerrarModal}
              className="block w-full text-center py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all"
            >
              Ver planes y suscribirme →
            </Link>
            <button
              onClick={cerrarModal}
              className="block w-full text-center py-2 mt-2 text-xs text-slate-500 hover:text-slate-800"
            >
              Recordar más tarde
            </button>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Overlay full-screen NO cerrable cuando el TRIAL venció. El BE ya bloquea
 * pólizas/cobranzas via límite FREE — esto solo da contexto al usuario.
 */
function BloqueoVencido() {
  return (
    <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <Lock className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm font-medium">
            Tu prueba terminó — podés <strong>ver tus datos</strong> pero no crear nuevos.
            Suscribite para volver a operar.
          </p>
        </div>
        <Link
          href="/admin/suscripcion"
          className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-white text-red-700 font-bold text-sm px-4 py-2 hover:bg-red-50 transition-colors"
        >
          <Crown className="w-4 h-4" /> Ver planes <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
