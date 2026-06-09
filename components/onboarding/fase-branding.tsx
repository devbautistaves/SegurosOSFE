"use client"

// FASE 1 del onboarding: Personalización del panel.
// 7 sub-steps: logo, color, nombre, whatsapp, aseguradoras, ramos, medios pago.
// A la izquierda, SidebarPreview que se actualiza en vivo con cada cambio.

import { useEffect, useRef, useState } from "react"
import { Upload, X, Plus, Sparkles, ChevronRight } from "lucide-react"
import { aseguradoraAPI } from "@/lib/api"
import { SidebarPreview } from "./sidebar-preview"

interface BrandingDraft {
  logo: string
  nombre: string
  colorPrimario: string
  whatsapp: string
  aseguradorasCatalogo: string[]
  ramosCatalogo: string[]
  medioDePagoCatalogo: string[]
}

const SUB_STEPS = [
  { key: "logo",     title: "Subí tu logo",            desc: "Aparece en el sidebar y en los emails que mandes a tus clientes." },
  { key: "color",    title: "Elegí tu color",          desc: "Es el color principal de tu panel y de los botones que ven tus clientes." },
  { key: "nombre",   title: "¿Cómo te llamás?",        desc: "Así te van a ver tus asegurados en los mails y notificaciones." },
  { key: "whatsapp", title: "Tu WhatsApp",             desc: "Para los CTAs de cobranza que les llegan a tus clientes." },
  { key: "aseg",     title: "Aseguradoras con las que trabajás", desc: "Estas opciones van a aparecer en los dropdowns de pólizas." },
  { key: "ramos",    title: "Ramos que vendés",        desc: "Autos, hogar, ART, vida… los que apliquen a tu cartera." },
  { key: "medios",   title: "Medios de pago",          desc: "Cómo cobrás a tus clientes." },
] as const

const SUGERIDAS_ASEGURADORAS = [
  "LA_CAJA","SANCOR","ZURICH","ALLIANZ","MERCANTIL_ANDINA","RIVADAVIA","MAPFRE","ATM","GALICIA","NACION","BERKLEY",
]
const SUGERIDOS_RAMOS = [
  "AUTOS","MOTOS","HOGAR","COMERCIO","ART","VIDA","ACC_PERSONALES","RESP_CIVIL","FLOTA_AUTOMOTOR",
]
const SUGERIDOS_MEDIOS = ["TARJ_CRED","CBU","EFECTIVO","CUPON","TRANSFERENCIA"]

interface Props {
  initialSubStep?: number
  onSubStepChange: (subStep: number) => void
  onFaseCompleted: () => void
}

export function FaseBranding({ initialSubStep = 0, onSubStepChange, onFaseCompleted }: Props) {
  const [draft, setDraft] = useState<BrandingDraft>({
    logo: "", nombre: "", colorPrimario: "#0f172a", whatsapp: "",
    aseguradorasCatalogo: [], ramosCatalogo: [], medioDePagoCatalogo: [],
  })
  const [subStep, setSubStep] = useState(initialSubStep)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState("")

  // Cargar lo que ya tenga el broker
  useEffect(() => {
    const token = localStorage.getItem("token") || ""
    if (!token) return
    Promise.all([
      aseguradoraAPI.getMe(token).catch(() => null),
      aseguradoraAPI.getCatalogos(token).catch(() => null),
    ]).then(([me, cat]) => {
      const a: any = me?.aseguradora || {}
      setDraft({
        logo: a.logo || "",
        nombre: a.nombre || "",
        colorPrimario: a.colorPrimario || "#0f172a",
        whatsapp: a.whatsapp || "",
        aseguradorasCatalogo: cat?.aseguradorasCatalogo || [],
        ramosCatalogo: cat?.ramosCatalogo || [],
        medioDePagoCatalogo: cat?.medioDePagoCatalogo || [],
      })
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => { onSubStepChange(subStep) }, [subStep, onSubStepChange])

  const current = SUB_STEPS[subStep]
  const isLast = subStep === SUB_STEPS.length - 1

  const next = async () => {
    setErr(""); setSaving(true)
    try {
      const token = localStorage.getItem("token") || ""
      if (!token) throw new Error("Sin sesión")
      // Guardamos el estado parcial en BE en cada paso. /me acepta los campos
      // top (nombre, logo, colorPrimario, whatsapp). Los catálogos van por
      // /catalogos.
      const meFields = {
        nombre: draft.nombre, logo: draft.logo,
        colorPrimario: draft.colorPrimario, whatsapp: draft.whatsapp,
      }
      await aseguradoraAPI.updateMe(token, meFields as any)
      await aseguradoraAPI.updateCatalogos(token, {
        aseguradorasCatalogo: draft.aseguradorasCatalogo,
        ramosCatalogo: draft.ramosCatalogo,
        medioDePagoCatalogo: draft.medioDePagoCatalogo,
      })

      // Refrescamos localStorage para que el sidebar real se redibuje
      try {
        const stored = localStorage.getItem("aseguradora")
        const base = stored ? JSON.parse(stored) : {}
        localStorage.setItem("aseguradora", JSON.stringify({ ...base, ...meFields }))
        window.dispatchEvent(new Event("branding-updated"))
      } catch {}

      if (isLast) {
        onFaseCompleted()
      } else {
        setSubStep(s => s + 1)
      }
    } catch (e: any) {
      setErr(e?.message || "No se pudo guardar el paso")
    } finally { setSaving(false) }
  }

  const back = () => { if (subStep > 0) setSubStep(s => s - 1) }

  if (loading) {
    return <div className="flex items-center justify-center h-96 text-slate-400 text-sm">Cargando...</div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-8 items-start">
      {/* Form side */}
      <div className="space-y-5">
        <div>
          <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-1">
            Fase 1 · Personalización · {subStep + 1}/{SUB_STEPS.length}
          </p>
          <h2 className="text-2xl font-bold text-white">{current.title}</h2>
          <p className="text-sm text-slate-400 mt-1">{current.desc}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
          {current.key === "logo" && <LogoStep draft={draft} setDraft={setDraft} />}
          {current.key === "color" && <ColorStep draft={draft} setDraft={setDraft} />}
          {current.key === "nombre" && <NombreStep draft={draft} setDraft={setDraft} />}
          {current.key === "whatsapp" && <WhatsappStep draft={draft} setDraft={setDraft} />}
          {current.key === "aseg" && <TagsStep label="Aseguradora" placeholder="Ej: ZURICH" sugeridas={SUGERIDAS_ASEGURADORAS} items={draft.aseguradorasCatalogo} onChange={v => setDraft(d => ({ ...d, aseguradorasCatalogo: v }))} />}
          {current.key === "ramos" && <TagsStep label="Ramo" placeholder="Ej: AUTOS" sugeridas={SUGERIDOS_RAMOS} items={draft.ramosCatalogo} onChange={v => setDraft(d => ({ ...d, ramosCatalogo: v }))} />}
          {current.key === "medios" && <TagsStep label="Medio de pago" placeholder="Ej: CBU" sugeridas={SUGERIDOS_MEDIOS} items={draft.medioDePagoCatalogo} onChange={v => setDraft(d => ({ ...d, medioDePagoCatalogo: v }))} />}
        </div>

        {err && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded p-2">{err}</div>}

        <div className="flex gap-2">
          <button onClick={back} disabled={subStep === 0 || saving}
            className="px-4 py-2 rounded-lg border border-white/10 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-30">
            ← Atrás
          </button>
          <button onClick={next} disabled={saving}
            className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50">
            {saving ? "Guardando..." : (isLast ? <>Terminar personalización <Sparkles className="h-4 w-4" /></> : <>Siguiente <ChevronRight className="h-4 w-4" /></>)}
          </button>
        </div>
      </div>

      {/* Preview side (sticky en desktop) */}
      <div className="hidden lg:block lg:sticky lg:top-6">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">Vista previa en vivo</p>
        <SidebarPreview logo={draft.logo} nombre={draft.nombre} colorPrimario={draft.colorPrimario} />
      </div>
    </div>
  )
}

// ─── Sub-step components ─────────────────────────────────────────────────────

function LogoStep({ draft, setDraft }: { draft: BrandingDraft; setDraft: React.Dispatch<React.SetStateAction<BrandingDraft>> }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploadErr, setUploadErr] = useState("")

  const handleFile = async (file: File) => {
    setUploadErr("")
    if (file.size > 2 * 1024 * 1024) { setUploadErr("Máximo 2MB"); return }
    if (!/^image\//.test(file.type)) { setUploadErr("Tiene que ser una imagen"); return }
    // Subimos como base64 al endpoint existente /api/proxy/aseguradora/logo
    const base64 = await new Promise<string>((resolve, reject) => {
      const r = new FileReader()
      r.onload = () => resolve((r.result as string).split(",")[1])
      r.onerror = reject
      r.readAsDataURL(file)
    })
    const token = localStorage.getItem("token") || ""
    try {
      const res = await fetch("/api/proxy/aseguradora/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "X-Company-ID": "seguros" },
        body: JSON.stringify({ base64, mime: file.type }),
      })
      const d = await res.json()
      if (!d.success) throw new Error(d.error || "Error subiendo logo")
      setDraft(prev => ({ ...prev, logo: d.logo }))
    } catch (e: any) {
      setUploadErr(e?.message || "Error")
    }
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f) }}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragOver ? "border-blue-400 bg-blue-500/10" : "border-white/15 hover:border-white/30 hover:bg-white/[0.02]"
        }`}>
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
        {draft.logo ? (
          <div className="space-y-2">
            <div className="h-20 w-20 mx-auto rounded-md bg-white p-1 flex items-center justify-center">
              <img src={draft.logo} alt="logo" className="max-h-full max-w-full object-contain" />
            </div>
            <p className="text-xs text-slate-400">Click o arrastrá otro para reemplazar</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-8 w-8 mx-auto text-slate-500" />
            <p className="text-sm text-white">Arrastrá tu logo o click para elegir</p>
            <p className="text-[11px] text-slate-500">PNG, JPG, SVG · max 2MB</p>
          </div>
        )}
      </div>
      {uploadErr && <p className="text-xs text-red-400">{uploadErr}</p>}
      <p className="text-[11px] text-slate-500">💡 Tip: si todavía no tenés logo, podés saltar este paso. El sidebar muestra el ícono de SegurOS por default.</p>
    </div>
  )
}

function ColorStep({ draft, setDraft }: { draft: BrandingDraft; setDraft: React.Dispatch<React.SetStateAction<BrandingDraft>> }) {
  const PRESETS = ["#0f172a","#1e3a8a","#7c1338","#15803d","#854d0e","#6d28d9","#0c4a6e","#111827"]
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-8 gap-2">
        {PRESETS.map(c => (
          <button key={c} onClick={() => setDraft(d => ({ ...d, colorPrimario: c }))}
            style={{ background: c }}
            className={`h-10 rounded-md border-2 transition ${draft.colorPrimario === c ? "border-white scale-110" : "border-transparent hover:border-white/30"}`}
            aria-label={c} />
        ))}
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm text-white">O color custom:</label>
        <input type="color" value={draft.colorPrimario} onChange={e => setDraft(d => ({ ...d, colorPrimario: e.target.value }))}
          className="h-10 w-20 rounded border border-white/10" />
        <span className="text-xs font-mono text-slate-300">{draft.colorPrimario}</span>
      </div>
    </div>
  )
}

function NombreStep({ draft, setDraft }: { draft: BrandingDraft; setDraft: React.Dispatch<React.SetStateAction<BrandingDraft>> }) {
  return (
    <div className="space-y-2">
      <input value={draft.nombre} onChange={e => setDraft(d => ({ ...d, nombre: e.target.value }))}
        placeholder="Grupo JV Seguros"
        className="w-full px-4 py-3 bg-white/[0.02] border border-white/10 rounded-lg text-base text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50" />
      <p className="text-[11px] text-slate-500">Va a aparecer en el sidebar, los mails a clientes y en cualquier lugar que el cliente vea tu marca.</p>
    </div>
  )
}

function WhatsappStep({ draft, setDraft }: { draft: BrandingDraft; setDraft: React.Dispatch<React.SetStateAction<BrandingDraft>> }) {
  return (
    <div className="space-y-2">
      <input value={draft.whatsapp} onChange={e => setDraft(d => ({ ...d, whatsapp: e.target.value.replace(/[^\d+]/g, "") }))}
        placeholder="5491158883022"
        className="w-full px-4 py-3 bg-white/[0.02] border border-white/10 rounded-lg text-base text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50" />
      <p className="text-[11px] text-slate-500">Sin guiones ni espacios. Lo usamos para los botones "Hablar por WhatsApp" en mails de cobranza.</p>
    </div>
  )
}

function TagsStep({ label, placeholder, sugeridas, items, onChange }: {
  label: string; placeholder: string; sugeridas: string[]; items: string[]; onChange: (v: string[]) => void
}) {
  const [val, setVal] = useState("")
  const add = (raw: string) => {
    const s = raw.trim().toUpperCase().replace(/\s+/g, "_")
    if (!s) return
    if (items.includes(s)) return
    onChange([...items, s])
    setVal("")
  }
  const remove = (s: string) => onChange(items.filter(x => x !== s))
  const sugeridasFiltradas = sugeridas.filter(s => !items.includes(s))

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(val) } }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50" />
        <button onClick={() => add(val)} disabled={!val.trim()}
          className="px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold flex items-center gap-1 disabled:opacity-50">
          <Plus className="h-3.5 w-3.5" /> Agregar
        </button>
      </div>

      {items.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Tu catálogo ({items.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {items.map(s => (
              <span key={s} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs">
                {s}
                <button onClick={() => remove(s)} className="hover:text-white"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        </div>
      )}

      {sugeridasFiltradas.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Sugerencias</p>
          <div className="flex flex-wrap gap-1.5">
            {sugeridasFiltradas.map(s => (
              <button key={s} onClick={() => add(s)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/[0.04] hover:bg-white/10 text-slate-300 text-xs border border-white/10">
                <Plus className="h-3 w-3" /> {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
