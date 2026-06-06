"use client"

import { useEffect, useState } from "react"
import { Mail, Megaphone, Send, Loader2, Check, AlertTriangle, Eye, X, Rocket } from "lucide-react"
import { saBroadcast, saConfig } from "@/lib/superadmin-api"

export default function ComunicacionPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Comunicación</h1>
        <p className="text-sm text-slate-400 mt-0.5">Marketing, email masivo y banner global</p>
      </div>

      <PromoBlastCard />
      <BannerCard />
      <BroadcastCard />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PROMO Blast Card — Pricing v2 Fase E
// Invita a las aseguradoras FREE/legacy/VENCIDO a tomar la PROMO de $25k×3m.
// ─────────────────────────────────────────────────────────────────────────────
function PromoBlastCard() {
  const [preview, setPreview] = useState<{ total: number; muestra: any[] } | null>(null)
  const [result, setResult] = useState<{ total: number; ok: number; fail: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [error, setError] = useState("")

  const onPreview = async () => {
    setLoading(true); setError("")
    try {
      const r = await saBroadcast.promoLanzamiento({ dryRun: true })
      setPreview({ total: r.total, muestra: r.muestra || [] })
    } catch (e: any) { setError(e.message || "Error") }
    setLoading(false)
  }

  const onSend = async () => {
    setLoading(true); setError(""); setConfirmOpen(false)
    try {
      const r = await saBroadcast.promoLanzamiento({})
      setResult({ total: r.total, ok: r.ok ?? 0, fail: r.fail ?? 0 })
      setPreview(null)
    } catch (e: any) { setError(e.message || "Error") }
    setLoading(false)
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-emerald-500/20 p-5">
      <div className="flex items-start gap-3 mb-3">
        <div className="h-10 w-10 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
          <Rocket className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-base">Blast PROMO de lanzamiento</h3>
          <p className="text-slate-400 text-sm mt-0.5">
            Manda 1 email a todas las aseguradoras FREE/legacy/VENCIDO invitándolas a la PROMO de $25.000 × 3 meses.
            Excluye las que ya están en PROMO/PRO_MENSUAL/PRO_ANUAL.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-300 text-xs">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 mb-3">
          <p className="text-emerald-300 text-sm font-medium flex items-center gap-2">
            <Check className="w-4 h-4" /> Blast enviado
          </p>
          <p className="text-emerald-200 text-xs mt-1">
            {result.ok} entregados · {result.fail} fallaron · de {result.total} candidatos.
          </p>
        </div>
      )}

      {preview && (
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 mb-3">
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            Vista previa — {preview.total} destinatarios
          </p>
          {preview.total === 0 ? (
            <p className="text-slate-500 text-xs italic">Ninguna aseguradora cumple el filtro. No hay nadie a quien escribirle.</p>
          ) : (
            <ul className="text-xs text-slate-300 space-y-1 max-h-48 overflow-y-auto">
              {preview.muestra.map((a, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-slate-500">{i+1}.</span>
                  <span className="font-medium">{a.nombre || "(sin nombre)"}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400">{a.email}</span>
                  {a.planCodigo && (
                    <span className="text-[10px] uppercase tracking-wider text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                      {a.planCodigo}
                    </span>
                  )}
                </li>
              ))}
              {preview.total > preview.muestra.length && (
                <li className="text-slate-500 italic pt-1">…y {preview.total - preview.muestra.length} más</li>
              )}
            </ul>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={onPreview}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 text-white hover:bg-slate-800 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
          Ver destinatarios
        </button>
        <button
          onClick={() => setConfirmOpen(true)}
          disabled={loading || !preview || preview.total === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" /> Enviar a {preview?.total ?? 0} aseguradoras
        </button>
        {(preview || result) && (
          <button
            onClick={() => { setPreview(null); setResult(null); setError("") }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" /> Limpiar
          </button>
        )}
      </div>

      <p className="text-xs text-slate-500 mt-3 leading-relaxed">
        💡 Mejor práctica: hacé "Ver destinatarios" primero para confirmar el universo. El endpoint NO es idempotente:
        cada llamada manda emails de nuevo. Throttle de 400ms entre envíos.
      </p>

      {/* Modal confirmación */}
      {confirmOpen && preview && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <h3 className="text-white font-bold text-base">Confirmar envío</h3>
            </div>
            <p className="text-slate-300 text-sm mb-4">
              Se van a mandar <strong className="text-emerald-400">{preview.total} emails</strong> a aseguradoras FREE/legacy.
              Esto puede tardar ~{Math.ceil(preview.total * 0.4)}s.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 text-white hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={onSend}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600"
              >
                Sí, enviar
              </button>
            </div>
          </div>
        </div>
      )}
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
