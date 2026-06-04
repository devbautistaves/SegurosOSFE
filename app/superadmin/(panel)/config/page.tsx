"use client"

import { useEffect, useState } from "react"
import { Settings, Loader2, Check, AlertTriangle, DollarSign, Lock, Globe } from "lucide-react"
import { saConfig } from "@/lib/superadmin-api"

export default function ConfigPage() {
  const [cfg, setCfg] = useState<any>(null)
  const [form, setForm] = useState<any>({
    precioProMensual: 45000,
    precioProAnual: 470000,
    registroAbierto: true,
    readOnlyMode: false,
    mpWebhookUrl: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState("")

  useEffect(() => {
    saConfig.get().then(r => {
      setCfg(r.config)
      setForm({
        precioProMensual: r.config.precioProMensual ?? 45000,
        precioProAnual: r.config.precioProAnual ?? 470000,
        registroAbierto: r.config.registroAbierto ?? true,
        readOnlyMode: r.config.readOnlyMode ?? false,
        mpWebhookUrl: r.config.mpWebhookUrl ?? "",
      })
    }).finally(() => setLoading(false))
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.readOnlyMode && !confirm("Activar READ-ONLY MODE bloquea TODA escritura del SaaS para TODOS los brokers. ¿Confirmás?")) return
    setSaving(true); setErr(""); setSaved(false)
    try {
      const res = await saConfig.update(form)
      setCfg(res.config)
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch (e: any) { setErr(e.message) } finally { setSaving(false) }
  }

  if (loading) return <div className="p-12 flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-500" /></div>

  return (
    <form onSubmit={save} className="p-6 lg:p-8 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Configuración global</h1>
        <p className="text-sm text-slate-400 mt-0.5">Precios, registro abierto y modo de mantenimiento</p>
      </div>

      {/* Precios */}
      <Card icon={DollarSign} title="Precios PRO">
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Mensual (ARS)" value={form.precioProMensual} onChange={(v: number) => setForm((f: any) => ({ ...f, precioProMensual: v }))} />
          <NumberField label="Anual (ARS)" value={form.precioProAnual} onChange={(v: number) => setForm((f: any) => ({ ...f, precioProAnual: v }))} />
        </div>
        <p className="text-[11px] text-slate-500 mt-2">
          Equivale a <span className="text-slate-300">${Math.round(form.precioProAnual / 12).toLocaleString("es-AR")}/mes</span> en anual ·
          ahorro: <span className="text-emerald-400">${((form.precioProMensual * 12) - form.precioProAnual).toLocaleString("es-AR")}</span>
        </p>
      </Card>

      {/* Flags */}
      <Card icon={Globe} title="Flags del SaaS">
        <Toggle label="Registro público abierto" value={form.registroAbierto}
          onChange={(v: boolean) => setForm((f: any) => ({ ...f, registroAbierto: v }))}
          help="Si está OFF, /registro devuelve 503. Útil para freeze." />
        <Toggle label="Read-only mode (mantenimiento)" value={form.readOnlyMode}
          onChange={(v: boolean) => setForm((f: any) => ({ ...f, readOnlyMode: v }))}
          danger
          help="Bloquea TODAS las escrituras de todos los brokers. Solo lecturas." />
      </Card>

      {/* MP webhook */}
      <Card icon={Lock} title="Mercado Pago">
        <div>
          <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">URL del webhook MP</p>
          <input value={form.mpWebhookUrl} onChange={e => setForm((f: any) => ({ ...f, mpWebhookUrl: e.target.value }))}
            placeholder="https://vps-5905394-x.dattaweb.com/seguros/api/webhooks/mercadopago"
            className="w-full px-2.5 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white placeholder-slate-600 font-mono" />
          <p className="text-[10px] text-slate-500 mt-1">Configurar en panel MP: notificación de pagos + suscripciones.</p>
        </div>
      </Card>

      {err && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5" /> {err}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2 sticky bottom-0 bg-[#0a0a0a] py-3 border-t border-white/10">
        <button type="submit" disabled={saving}
          className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <Check className="h-3.5 w-3.5" /> : <Settings className="h-3.5 w-3.5" />}
          {saved ? "Guardado" : "Guardar cambios"}
        </button>
        {cfg?.updatedAt && (
          <p className="text-[11px] text-slate-500">Última edición: {new Date(cfg.updatedAt).toLocaleString("es-AR")}</p>
        )}
      </div>
    </form>
  )
}

function Card({ icon: Icon, title, children }: any) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-400" />
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function NumberField({ label, value, onChange }: any) {
  return (
    <div>
      <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">{label}</p>
      <input type="number" value={value} onChange={e => onChange(parseInt(e.target.value) || 0)}
        className="w-full px-2.5 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white" />
    </div>
  )
}

function Toggle({ label, value, onChange, help, danger }: any) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-lg bg-black/30 border border-white/5 cursor-pointer hover:bg-black/40">
      <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)}
        className={`mt-0.5 h-4 w-4 ${danger ? "accent-red-500" : "accent-blue-500"}`} />
      <div className="flex-1">
        <p className={`text-sm font-medium ${danger && value ? "text-red-300" : "text-white"}`}>{label}</p>
        {help && <p className="text-[11px] text-slate-500 mt-0.5">{help}</p>}
      </div>
    </label>
  )
}
