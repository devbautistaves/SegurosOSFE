"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Building2, Users, FileText, AlertTriangle, DollarSign,
  UserCheck, Pause, Play, RotateCcw, KeyRound, Loader2, X, Copy, Check,
} from "lucide-react"
import { saAseguradoras } from "@/lib/superadmin-api"

export default function AseguradoraDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [planOpen, setPlanOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState<any>(null)
  const [resetResult, setResetResult] = useState<{ email: string; pass: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const fetch = async () => {
    setLoading(true); setError("")
    try {
      const res = await saAseguradoras.detail(id)
      setData(res)
    } catch (e: any) { setError(e.message) } finally { setLoading(false) }
  }
  useEffect(() => { fetch() }, [id])

  const impersonate = async () => {
    if (!confirm("¿Impersonar como admin de este broker? Se va a abrir una sesión nueva de 30 minutos.")) return
    setBusy(true)
    try {
      const res = await saAseguradoras.impersonate(id)
      // Guardamos el token del tenant en sesión separada
      localStorage.setItem("token", res.token)
      localStorage.setItem("user", JSON.stringify(res.user))
      localStorage.setItem("aseguradora", JSON.stringify(res.aseguradora))
      localStorage.setItem("impersonating", JSON.stringify({
        startedAt: Date.now(),
        aseguradora: res.aseguradora,
        adminUser: res.user,
      }))
      window.open("/admin", "_blank")
    } catch (e: any) { alert(e.message) } finally { setBusy(false) }
  }

  const toggleSuspend = async () => {
    const a = data.aseguradora
    const motivo = a.activo ? prompt("Motivo de la suspensión:") : null
    if (a.activo && !motivo) return
    setBusy(true)
    try {
      if (a.activo) await saAseguradoras.suspend(id, motivo!)
      else await saAseguradoras.reactivate(id)
      await fetch()
    } catch (e: any) { alert(e.message) } finally { setBusy(false) }
  }

  if (loading) return <div className="p-12 flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-500" /></div>
  if (error) return <div className="p-8 text-red-400 text-sm">{error}</div>
  if (!data) return null

  const a = data.aseguradora
  const u = data.uso

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>
        <div className="flex gap-2">
          <button onClick={impersonate} disabled={busy}
            className="px-3 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50">
            <UserCheck className="h-3.5 w-3.5" /> Impersonar
          </button>
          <button onClick={() => setPlanOpen(true)}
            className="px-3 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 text-xs font-semibold flex items-center gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" /> Forzar plan
          </button>
          <button onClick={toggleSuspend} disabled={busy}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 border ${
              a.activo
                ? "bg-amber-500/20 border-amber-500/30 text-amber-300 hover:bg-amber-500/30"
                : "bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30"
            }`}>
            {a.activo ? <><Pause className="h-3.5 w-3.5" /> Suspender</> : <><Play className="h-3.5 w-3.5" /> Reactivar</>}
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-6">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{a.nombre}</h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${a.plan === "PRO" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"}`}>{a.plan}</span>
              {a.planTipo && <span className="text-[10px] text-slate-500">{a.planTipo}</span>}
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                !a.activo ? "bg-red-500/20 text-red-400" :
                a.planStatus === "ACTIVO" ? "bg-emerald-500/20 text-emerald-400" :
                a.planStatus === "VENCIDO" ? "bg-amber-500/20 text-amber-400" :
                "bg-slate-500/20 text-slate-400"
              }`}>{!a.activo ? "SUSPENDIDO" : a.planStatus}</span>
            </div>
            <p className="text-sm text-slate-400 mt-1">{a.slug} · {a.email || "—"} · {a.telefono || "sin tel"}</p>
            <div className="flex gap-6 mt-3 text-xs text-slate-500">
              <span>CUIT: <span className="text-slate-300">{a.cuit || "—"}</span></span>
              <span>Alta: <span className="text-slate-300">{new Date(a.createdAt).toLocaleDateString("es-AR")}</span></span>
              <span>Vence: <span className="text-slate-300">{a.planVencimiento ? new Date(a.planVencimiento).toLocaleDateString("es-AR") : "—"}</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Uso */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={Users} label="Usuarios" value={u.usuarios} />
        <Stat icon={FileText} label="Pólizas" value={u.polizas} />
        <Stat icon={DollarSign} label="Cobranzas" value={u.cobranzas} />
        <Stat icon={AlertTriangle} label="Siniestros" value={u.siniestros} />
      </div>

      {/* Admin users */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Usuarios del broker ({data.adminUsers.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black/30 border-b border-white/10">
              <tr className="text-left text-[10px] text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Rol</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2">Última actividad</th>
                <th className="px-4 py-2 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.adminUsers.map((u: any) => (
                <tr key={u._id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5">
                    <p className="text-white">{u.email}</p>
                    <p className="text-[11px] text-slate-500">{u.name}</p>
                  </td>
                  <td className="px-4 py-2.5"><span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{u.role}</span></td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${u.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"}`}>
                      {u.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">{u.lastActivity ? new Date(u.lastActivity).toLocaleString("es-AR") : "—"}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => setResetOpen(u)} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 ml-auto">
                      <KeyRound className="h-3 w-3" /> Reset pass
                    </button>
                  </td>
                </tr>
              ))}
              {data.adminUsers.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-xs text-slate-500">Sin usuarios</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagos recientes */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white">Pagos recientes</h2>
        </div>
        {data.pagosRecientes.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">Sin pagos registrados</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-black/30 border-b border-white/10">
                <tr className="text-left text-[10px] text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-2">Fecha</th>
                  <th className="px-4 py-2">Monto</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.pagosRecientes.map((p: any) => (
                  <tr key={p._id}>
                    <td className="px-4 py-2.5 text-xs text-slate-400">{new Date(p.createdAt).toLocaleString("es-AR")}</td>
                    <td className="px-4 py-2.5 text-sm text-white font-semibold">${(p.monto || 0).toLocaleString("es-AR")}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        p.status === "approved" ? "bg-emerald-500/20 text-emerald-400" :
                        p.status === "refunded" ? "bg-purple-500/20 text-purple-400" :
                        p.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-2.5 text-[11px] text-slate-500 font-mono">{p.mpPaymentId || p._id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {planOpen && <PlanModal aseguradora={a} onClose={() => setPlanOpen(false)} onSaved={() => { setPlanOpen(false); fetch() }} />}
      {resetOpen && !resetResult && <ResetPassConfirm user={resetOpen} onClose={() => setResetOpen(null)} onResult={(r: string) => setResetResult({ email: resetOpen.email, pass: r })} />}
      {resetResult && <ResetPassResult result={resetResult} onClose={() => { setResetOpen(null); setResetResult(null) }} />}
    </div>
  )
}

function Stat({ icon: Icon, label, value }: any) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase tracking-wider"><Icon className="h-3.5 w-3.5" /> {label}</div>
      <div className="text-2xl font-bold text-white mt-1">{value}</div>
    </div>
  )
}

function PlanModal({ aseguradora, onClose, onSaved }: any) {
  const [form, setForm] = useState({
    plan: aseguradora.plan || "FREE",
    planTipo: aseguradora.planTipo || "",
    planStatus: aseguradora.planStatus || "ACTIVO",
    planVencimiento: aseguradora.planVencimiento ? new Date(aseguradora.planVencimiento).toISOString().slice(0, 10) : "",
    motivo: "",
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.motivo) { setErr("Indicá un motivo para el audit log"); return }
    setLoading(true); setErr("")
    try {
      await saAseguradoras.forzarPlan(aseguradora._id, form)
      onSaved()
    } catch (e: any) { setErr(e.message) } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Forzar plan</h2>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-white"><X className="h-4 w-4" /></button>
        </div>
        <p className="text-xs text-slate-500">Override manual del plan (cobros por fuera de MP, comp, etc.)</p>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Plan">
            <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))} className="w-full px-2 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white">
              <option value="FREE" className="bg-black">FREE</option>
              <option value="PRO" className="bg-black">PRO</option>
            </select>
          </Field>
          <Field label="Tipo">
            <select value={form.planTipo} onChange={e => setForm(f => ({ ...f, planTipo: e.target.value }))} className="w-full px-2 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white">
              <option value="" className="bg-black">—</option>
              <option value="mensual" className="bg-black">Mensual</option>
              <option value="anual" className="bg-black">Anual</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Estado">
            <select value={form.planStatus} onChange={e => setForm(f => ({ ...f, planStatus: e.target.value }))} className="w-full px-2 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white">
              <option value="ACTIVO" className="bg-black">ACTIVO</option>
              <option value="VENCIDO" className="bg-black">VENCIDO</option>
              <option value="CANCELADO" className="bg-black">CANCELADO</option>
            </select>
          </Field>
          <Field label="Vence">
            <input type="date" value={form.planVencimiento} onChange={e => setForm(f => ({ ...f, planVencimiento: e.target.value }))}
              className="w-full px-2 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white" />
          </Field>
        </div>
        <Field label="Motivo *">
          <input value={form.motivo} onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))} required
            placeholder="ej: pago externo, regalo cortesía, etc."
            className="w-full px-2.5 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white placeholder-slate-600" />
        </Field>

        {err && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded p-2">{err}</div>}

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-white/10 text-sm text-slate-300 hover:bg-white/5">Cancelar</button>
          <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Guardar
          </button>
        </div>
      </form>
    </div>
  )
}

function ResetPassConfirm({ user, onClose, onResult }: any) {
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")

  const submit = async () => {
    setLoading(true); setErr("")
    try {
      const res = await saAseguradoras.resetUserPassword(id, user._id)
      onResult(res.tempPassword)
    } catch (e: any) { setErr(e.message); setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-xl p-6 space-y-3">
        <h2 className="text-lg font-bold text-white">Resetear contraseña</h2>
        <p className="text-sm text-slate-400">Vas a generar una contraseña temporal para <span className="text-white font-medium">{user.email}</span>. El usuario va a tener que cambiarla en el próximo login.</p>
        {err && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded p-2">{err}</div>}
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-white/10 text-sm text-slate-300 hover:bg-white/5">Cancelar</button>
          <button onClick={submit} disabled={loading} className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Resetear
          </button>
        </div>
      </div>
    </div>
  )
}

function ResetPassResult({ result, onClose }: any) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(result.pass)
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-sm bg-[#0a0a0a] border border-emerald-500/30 rounded-xl p-6 space-y-3">
        <h2 className="text-lg font-bold text-white">Contraseña temporal generada</h2>
        <p className="text-xs text-slate-400">Para <span className="text-white">{result.email}</span>. Comunicala por canal seguro — no la vamos a volver a mostrar.</p>
        <div className="bg-black/40 border border-white/10 rounded-lg p-3 flex items-center gap-2">
          <code className="flex-1 text-base font-mono text-emerald-400 tracking-wider">{result.pass}</code>
          <button onClick={copy} className="text-slate-400 hover:text-white">
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <button onClick={onClose} className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold">Listo</button>
      </div>
    </div>
  )
}

function Field({ label, children }: any) {
  return (
    <div>
      <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">{label}</p>
      {children}
    </div>
  )
}
