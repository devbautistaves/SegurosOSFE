"use client"

import { useEffect, useState } from "react"
import { Mail, Megaphone, Send, Loader2, Check, AlertTriangle } from "lucide-react"
import { saBroadcast, saConfig } from "@/lib/superadmin-api"

export default function ComunicacionPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Comunicación</h1>
        <p className="text-sm text-slate-400 mt-0.5">Email masivo y banner global del sitio</p>
      </div>

      <BannerCard />
      <BroadcastCard />
    </div>
  )
}

function BannerCard() {
  const [cfg, setCfg] = useState<any>(null)
  const [form, setForm] = useState({ activo: false, texto: "", color: "info" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    saConfig.get().then(r => {
      setCfg(r.config)
      setForm({
        activo: r.config?.bannerGlobal?.activo || false,
        texto: r.config?.bannerGlobal?.texto || "",
        color: r.config?.bannerGlobal?.color || "info",
      })
    }).finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true); setSaved(false)
    try {
      await saBroadcast.banner(form)
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch (e: any) { alert(e.message) } finally { setSaving(false) }
  }

  if (loading) return <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-500" /></div>

  const bannerColors: Record<string, string> = {
    info: "bg-blue-500/20 border-blue-500/40 text-blue-200",
    warning: "bg-amber-500/20 border-amber-500/40 text-amber-200",
    danger: "bg-red-500/20 border-red-500/40 text-red-200",
    success: "bg-emerald-500/20 border-emerald-500/40 text-emerald-200",
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Megaphone className="h-4 w-4 text-amber-400" />
        <h2 className="text-sm font-semibold text-white">Banner global</h2>
      </div>
      <p className="text-xs text-slate-500">Se muestra arriba del sidebar para todos los brokers que entren al panel.</p>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.activo} onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))}
            className="h-4 w-4 rounded accent-amber-500" />
          <span className="text-sm text-white">Activo</span>
        </label>
        <select value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
          className="px-2.5 py-1.5 bg-white/[0.02] border border-white/10 rounded-lg text-xs text-white">
          <option value="info" className="bg-black">Info (azul)</option>
          <option value="warning" className="bg-black">Warning (amber)</option>
          <option value="danger" className="bg-black">Danger (rojo)</option>
          <option value="success" className="bg-black">Success (verde)</option>
        </select>
      </div>

      <textarea value={form.texto} onChange={e => setForm(f => ({ ...f, texto: e.target.value }))} rows={2}
        placeholder="ej: Mantenimiento programado el sábado a las 22hs"
        className="w-full px-3 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white placeholder-slate-600 resize-none" />

      {/* Preview */}
      {form.texto && (
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Preview</p>
          <div className={`border rounded-lg px-3 py-2 text-sm ${bannerColors[form.color]}`}>
            <AlertTriangle className="h-3.5 w-3.5 inline mr-1.5" />
            {form.texto}
          </div>
        </div>
      )}

      <button onClick={save} disabled={saving}
        className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50">
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <Check className="h-3.5 w-3.5" /> : <Megaphone className="h-3.5 w-3.5" />}
        {saved ? "Guardado" : "Guardar banner"}
      </button>
    </div>
  )
}

function BroadcastCard() {
  const [form, setForm] = useState({ subject: "", html: "", targetPlan: "", targetRole: "admin" })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirm(`¿Mandar este email a ${form.targetPlan || "TODOS los brokers"}? Acción irreversible.`)) return
    setLoading(true); setResult(null)
    try {
      const res = await saBroadcast.email(form)
      setResult(res)
    } catch (e: any) { alert(e.message) } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-blue-400" />
        <h2 className="text-sm font-semibold text-white">Broadcast por email</h2>
      </div>
      <p className="text-xs text-slate-500">Envía un email a todos los usuarios que matcheen el filtro.</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Plan target</p>
          <select value={form.targetPlan} onChange={e => setForm(f => ({ ...f, targetPlan: e.target.value }))}
            className="w-full px-2.5 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white">
            <option value="" className="bg-black">Todos los planes</option>
            <option value="FREE" className="bg-black">Solo FREE</option>
            <option value="PRO" className="bg-black">Solo PRO</option>
          </select>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Rol</p>
          <select value={form.targetRole} onChange={e => setForm(f => ({ ...f, targetRole: e.target.value }))}
            className="w-full px-2.5 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white">
            <option value="admin" className="bg-black">Admins</option>
            <option value="admin_seguros" className="bg-black">Admin seguros</option>
            <option value="vendedor" className="bg-black">Vendedores</option>
            <option value="" className="bg-black">Todos los roles</option>
          </select>
        </div>
      </div>

      <div>
        <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Asunto *</p>
        <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required
          placeholder="Novedades de SegurOS"
          className="w-full px-2.5 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white" />
      </div>

      <div>
        <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">HTML del email *</p>
        <textarea value={form.html} onChange={e => setForm(f => ({ ...f, html: e.target.value }))} required rows={10}
          placeholder="<h1>Hola</h1><p>Te queremos contar...</p>"
          className="w-full px-3 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white placeholder-slate-600 font-mono resize-y" />
      </div>

      {result && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">
          <Check className="h-3.5 w-3.5 inline mr-1.5" />
          Enviados {result.enviados} / {result.destinatarios} · Fallidos: {result.fallidos}
        </div>
      )}

      <button type="submit" disabled={loading}
        className="px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50">
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
        Enviar broadcast
      </button>
    </form>
  )
}
