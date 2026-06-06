"use client"

// Sección "Mis datos · Privacidad" del panel del broker.
//
// Acciones:
//   1) Descargar todos los datos del broker en ZIP (CSV por colección).
//   2) Solicitar baja de la cuenta — requiere escribir "BAJA <slug>" para
//      confirmar. Tras la baja:
//        - cuenta deshabilitada inmediato
//        - cuarentena de 30 días (purgaProgramada)
//        - email de confirmación
//        - se puede cancelar antes de los 30 días
//   3) Cancelar baja en curso (si aplica).
//
// El estado de baja viene del objeto `aseguradora` en localStorage, que
// `dashboard-layout` hidrata desde /auth/me al cargar.

import { useEffect, useState } from "react"
import Link from "next/link"
import { Download, AlertTriangle, ShieldOff, Loader2, X, FileText, RotateCcw } from "lucide-react"

interface BajaInfo {
  bajaPendiente: boolean
  bajaSolicitadaEn?: string
  purgaProgramada?: string
  diasRestantes?: number
}

export function MisDatosSection() {
  const [token, setToken] = useState<string | null>(null)
  const [slug, setSlug] = useState<string>("")
  const [bajaInfo, setBajaInfo] = useState<BajaInfo>({ bajaPendiente: false })

  const [downloading, setDownloading] = useState(false)
  const [confirmBaja, setConfirmBaja] = useState("")
  const [submittingBaja, setSubmittingBaja] = useState(false)
  const [cancelingBaja, setCancelingBaja] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    setToken(localStorage.getItem("token"))
    try {
      const a = JSON.parse(localStorage.getItem("aseguradora") || "{}")
      setSlug(a.slug || "")
      if (a.bajaPendiente && a.bajaSolicitadaEn) {
        const inicio = new Date(a.bajaSolicitadaEn).getTime()
        const purga = inicio + 30 * 86400000
        const dias = Math.max(0, Math.ceil((purga - Date.now()) / 86400000))
        setBajaInfo({
          bajaPendiente: true,
          bajaSolicitadaEn: a.bajaSolicitadaEn,
          purgaProgramada: new Date(purga).toISOString(),
          diasRestantes: dias,
        })
      }
    } catch {}
  }, [])

  const handleDescargar = async () => {
    if (!token) return
    setDownloading(true); setErr(null); setOk(null)
    try {
      const r = await fetch("/api/proxy/aseguradora/export", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, "X-Company-ID": "seguros" },
      })
      if (!r.ok) {
        const d = await r.json().catch(() => ({ error: r.statusText }))
        throw new Error(d.error || "No se pudo generar el export")
      }
      const blob = await r.blob()
      const cd = r.headers.get("Content-Disposition") || ""
      const nameMatch = cd.match(/filename="?([^";]+)/i)
      const filename = nameMatch?.[1] || `segurosos-export-${slug || "datos"}-${new Date().toISOString().slice(0,10)}.zip`
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url; a.download = filename
      document.body.appendChild(a); a.click()
      a.remove(); URL.revokeObjectURL(url)
      setOk("Descarga lista")
    } catch (e: any) { setErr(e.message) }
    finally { setDownloading(false) }
  }

  const esperado = `BAJA ${slug}`

  const handleBaja = async () => {
    if (!token) return
    setSubmittingBaja(true); setErr(null); setOk(null)
    try {
      const r = await fetch("/api/proxy/aseguradora/baja", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "X-Company-ID": "seguros" },
        body: JSON.stringify({ confirmacion: confirmBaja }),
      })
      const d = await r.json()
      if (!d.success) throw new Error(d.error || "Error al solicitar la baja")
      // Persistir en localStorage para no perder el estado tras refresh.
      try {
        const a = JSON.parse(localStorage.getItem("aseguradora") || "{}")
        localStorage.setItem("aseguradora", JSON.stringify({ ...a, bajaPendiente: true, bajaSolicitadaEn: d.bajaSolicitadaEn }))
      } catch {}
      setBajaInfo({
        bajaPendiente: true,
        bajaSolicitadaEn: d.bajaSolicitadaEn,
        purgaProgramada: d.purgaProgramada,
        diasRestantes: d.diasRestantes,
      })
      setOk("Baja registrada. Recibirás un email con la confirmación.")
      // Forzamos logout: la cuenta queda deshabilitada y no debe seguir operando.
      setTimeout(() => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/login"
      }, 4000)
    } catch (e: any) { setErr(e.message) }
    finally { setSubmittingBaja(false) }
  }

  const handleCancelarBaja = async () => {
    if (!token) return
    setCancelingBaja(true); setErr(null); setOk(null)
    try {
      const r = await fetch("/api/proxy/aseguradora/baja/cancelar", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "X-Company-ID": "seguros" },
      })
      const d = await r.json()
      if (!d.success) throw new Error(d.error || "Error al cancelar la baja")
      try {
        const a = JSON.parse(localStorage.getItem("aseguradora") || "{}")
        delete a.bajaPendiente; delete a.bajaSolicitadaEn
        localStorage.setItem("aseguradora", JSON.stringify(a))
      } catch {}
      setBajaInfo({ bajaPendiente: false })
      setOk("Baja cancelada. Tu cuenta vuelve a estar activa.")
    } catch (e: any) { setErr(e.message) }
    finally { setCancelingBaja(false) }
  }

  return (
    <div className="rounded-xl border bg-white p-5 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" /> Mis datos · Privacidad
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Descargá tus datos o solicitá la baja de la cuenta. Cumple con la <Link href="/terminos" target="_blank" className="text-blue-600 hover:underline">Ley 25.326</Link>.
          </p>
        </div>
      </div>

      {ok  && <div className="rounded-lg border border-green-300 bg-green-50 text-green-700 p-3 text-sm">{ok}</div>}
      {err && <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 p-3 text-sm">{err}</div>}

      {/* Descargar export */}
      <div className="rounded-lg border bg-slate-50 p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Download className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-sm">Descargar todos mis datos</p>
            <p className="text-xs text-muted-foreground mt-1">
              ZIP con CSVs de pólizas, cobranzas, siniestros, prospectos y usuarios del broker. Útil para auditoría o para migrar.
            </p>
          </div>
        </div>
        <button
          onClick={handleDescargar}
          disabled={downloading}
          type="button"
          className="h-9 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50"
        >
          {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {downloading ? "Generando…" : "Descargar export ZIP"}
        </button>
      </div>

      {/* Baja */}
      {bajaInfo.bajaPendiente ? (
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-amber-900">Baja en curso</p>
              <p className="text-xs text-amber-800 mt-1">
                Tu cuenta queda deshabilitada y todos los datos se borrarán definitivamente en{" "}
                <strong>{bajaInfo.diasRestantes ?? "—"} días</strong>{" "}
                ({bajaInfo.purgaProgramada && new Date(bajaInfo.purgaProgramada).toLocaleDateString("es-AR")}).
              </p>
              <p className="text-xs text-amber-700 mt-1">Si te arrepentís, podés cancelar la baja hasta ese día y recuperás la cuenta tal como estaba.</p>
            </div>
          </div>
          <button
            onClick={handleCancelarBaja}
            disabled={cancelingBaja}
            type="button"
            className="h-9 px-4 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {cancelingBaja ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            Cancelar baja
          </button>
        </div>
      ) : (
        <div className="rounded-lg border-2 border-red-200 bg-red-50/40 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <ShieldOff className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-red-900 text-sm">Dar de baja la cuenta</p>
              <p className="text-xs text-red-700 mt-1 leading-relaxed">
                La cuenta queda deshabilitada al instante y todos los datos se borran definitivamente a los 30 días.
                Podés cancelar la baja durante esos 30 días para recuperar todo.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-red-800">
              Para confirmar, escribí exactamente: <code className="font-mono bg-red-100 px-1.5 py-0.5 rounded">{esperado}</code>
            </label>
            <input
              className="w-full h-9 rounded-md border border-red-300 bg-white px-3 text-sm font-mono"
              placeholder={esperado}
              value={confirmBaja}
              onChange={e => setConfirmBaja(e.target.value)}
            />
            <button
              onClick={handleBaja}
              disabled={submittingBaja || confirmBaja !== esperado || !slug}
              type="button"
              className="h-9 px-4 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submittingBaja ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
              Solicitar baja definitiva
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
