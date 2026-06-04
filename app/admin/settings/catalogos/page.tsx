"use client"

import { useEffect, useRef, useState } from "react"
import { aseguradoraAPI, suscripcionAPI } from "@/lib/api"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Loader2, Plus, X, Save, Tag, Building2, CreditCard, Upload, Crown, ImageIcon } from "lucide-react"

// ── helpers ──────────────────────────────────────────────────────────────────
function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 text-xs px-2.5 py-1">
      {label}
      <button onClick={onRemove} className="hover:text-red-600 leading-none" type="button"><X className="h-3 w-3" /></button>
    </span>
  )
}

function TagInput({ items, onChange, placeholder }: { items: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [val, setVal] = useState("")
  const add = () => {
    const v = val.trim().toUpperCase().replace(/\s+/g, "_")
    if (!v || items.includes(v)) { setVal(""); return }
    onChange([...items, v]); setVal("")
  }
  return (
    <>
      <div className="flex gap-2">
        <input
          className="flex-1 h-9 rounded-md border px-3 text-sm"
          placeholder={placeholder}
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
        />
        <button onClick={add} type="button" className="h-9 px-3 rounded-md bg-blue-600 text-white text-sm font-medium flex items-center gap-1">
          <Plus className="h-4 w-4" /> Agregar
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2 min-h-[28px]">
        {items.map(i => <Chip key={i} label={i} onRemove={() => onChange(items.filter(x => x !== i))} />)}
        {items.length === 0 && <p className="text-xs text-muted-foreground">Sin ítems cargados.</p>}
      </div>
    </>
  )
}

// ── page ─────────────────────────────────────────────────────────────────────
export default function ConfigPROPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [esPRO, setEsPRO] = useState(false)
  const [ok, setOk] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  // datos del broker
  const [nombre, setNombre] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [email, setEmail] = useState("")
  const [telefono, setTelefono] = useState("")
  const [cuit, setCuit] = useState("")
  const [direccion, setDireccion] = useState("")
  const [colorPrimario, setColorPrimario] = useState("#1e40af")
  const [logo, setLogo] = useState<string | null>(null)

  // catálogos
  const [aseguradoras, setAseguradoras] = useState<string[]>([])
  const [ramos, setRamos] = useState<string[]>([])
  const [medios, setMedios] = useState<string[]>([])

  const fileRef = useRef<HTMLInputElement>(null)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  useEffect(() => {
    if (!token) return
    Promise.all([
      aseguradoraAPI.getMe(token),
      aseguradoraAPI.getCatalogos(token),
      suscripcionAPI.estado(token),
    ]).then(([me, cat, sus]) => {
      const a = me.aseguradora
      setNombre(a.nombre || "")
      setWhatsapp(a.whatsapp || "")
      setEmail(a.email || "")
      setTelefono(a.telefono || "")
      setCuit(a.cuit || "")
      setDireccion(a.direccion || "")
      setColorPrimario(a.colorPrimario || "#1e40af")
      setLogo(a.logo || null)
      setAseguradoras(cat.aseguradorasCatalogo || [])
      setRamos(cat.ramosCatalogo || [])
      setMedios(cat.medioDePagoCatalogo || [])
      setEsPRO(sus.plan === "PRO" && sus.planStatus === "ACTIVO")
    }).catch(e => setErr(e.message)).finally(() => setLoading(false))
  }, [])

  const guardar = async () => {
    if (!token) return
    setSaving(true); setOk(null); setErr(null)
    try {
      await Promise.all([
        aseguradoraAPI.updateMe(token, { nombre, whatsapp, email, telefono, cuit, direccion, colorPrimario }),
        aseguradoraAPI.updateCatalogos(token, { aseguradorasCatalogo: aseguradoras, ramosCatalogo: ramos, medioDePagoCatalogo: medios }),
      ])
      // Sync localStorage para que el sidebar muestre el nombre actualizado
      const stored = localStorage.getItem("aseguradora")
      if (stored) {
        try { localStorage.setItem("aseguradora", JSON.stringify({ ...JSON.parse(stored), nombre, colorPrimario, whatsapp, logo })) } catch {}
      }
      setOk("Cambios guardados correctamente")
    } catch (e: any) { setErr(e.message) }
    finally { setSaving(false) }
  }

  const handleLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !token) return
    if (file.size > 2 * 1024 * 1024) { setErr("El logo no puede superar los 2MB"); return }
    setUploadingLogo(true); setErr(null)
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve((reader.result as string).split(",")[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const r = await fetch("/api/proxy/aseguradora/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "X-Company-ID": "seguros" },
        body: JSON.stringify({ base64, mime: file.type }),
      })
      const d = await r.json()
      if (!d.success) throw new Error(d.error)
      setLogo(d.logo)
      setOk("Logo subido correctamente")
    } catch (e: any) { setErr(e.message) } finally { setUploadingLogo(false) }
  }

  if (loading) return (
    <DashboardLayout requiredRole={["admin","admin_seguros"]}>
      <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout requiredRole={["admin","admin_seguros"]}>
      <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Crown className="h-6 w-6 text-amber-500" /> Configuración del broker
          </h1>
          <p className="text-muted-foreground text-sm">Datos, catálogos y personalización de tu cuenta.</p>
        </div>

        {err && <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 p-3 text-sm">{err}</div>}
        {ok  && <div className="rounded-lg border border-green-300 bg-green-50 text-green-700 p-3 text-sm">{ok}</div>}

        {/* ── Datos del broker ── */}
        <div className="rounded-xl border bg-white p-5 space-y-4">
          <h2 className="font-semibold">Datos del broker</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nombre</label>
              <input className="mt-1 w-full h-9 rounded-md border px-3 text-sm" value={nombre} onChange={e => setNombre(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email de contacto</label>
              <input className="mt-1 w-full h-9 rounded-md border px-3 text-sm" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Teléfono</label>
              <input className="mt-1 w-full h-9 rounded-md border px-3 text-sm" value={telefono} onChange={e => setTelefono(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">WhatsApp (con código de país)</label>
              <input className="mt-1 w-full h-9 rounded-md border px-3 text-sm" placeholder="5411xxxxxxxx" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
              <p className="text-xs text-muted-foreground mt-1">Aparece en el footer de los emails enviados a clientes.</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">CUIT</label>
              <input className="mt-1 w-full h-9 rounded-md border px-3 text-sm" value={cuit} onChange={e => setCuit(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Color principal</label>
              <div className="flex items-center gap-2 mt-1">
                <input type="color" className="h-9 w-14 p-0.5 rounded-md border cursor-pointer" value={colorPrimario} onChange={e => setColorPrimario(e.target.value)} />
                <span className="text-sm text-muted-foreground">{colorPrimario}</span>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Dirección</label>
              <input className="mt-1 w-full h-9 rounded-md border px-3 text-sm" value={direccion} onChange={e => setDireccion(e.target.value)} />
            </div>
          </div>
        </div>

        {/* ── Logo (solo PRO) ── */}
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold flex items-center gap-2 mb-3">
            <ImageIcon className="h-4 w-4 text-blue-600" /> Logo del broker
            {!esPRO && <span className="ml-1 text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Solo PRO</span>}
          </h2>
          {!esPRO ? (
            <p className="text-sm text-muted-foreground">Subí el logo de tu broker para que aparezca en todos los emails. Disponible en plan <a href="/admin/suscripcion" className="text-blue-600 underline font-medium">PRO</a>.</p>
          ) : (
            <div className="flex items-center gap-4">
              {logo
                ? <img src={logo} alt="Logo" className="h-16 max-w-[180px] object-contain rounded border p-1 bg-gray-50" />
                : <div className="h-16 w-32 rounded border bg-gray-50 flex items-center justify-center text-muted-foreground text-xs">Sin logo</div>
              }
              <div>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingLogo}
                  className="h-9 px-4 rounded-md bg-blue-600 text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                  type="button"
                >
                  {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {logo ? "Cambiar logo" : "Subir logo"}
                </button>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG o WebP · Máx 2MB</p>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoFile} />
              </div>
            </div>
          )}
        </div>

        {/* ── Catálogos ── */}
        <div className="grid md:grid-cols-3 gap-5">
          <div className="rounded-xl border bg-white p-5">
            <h2 className="flex items-center gap-2 font-semibold mb-3 text-sm">
              <Building2 className="h-4 w-4 text-blue-600" /> Aseguradoras ({aseguradoras.length})
            </h2>
            <TagInput items={aseguradoras} onChange={setAseguradoras} placeholder="Ej: ZURICH" />
          </div>
          <div className="rounded-xl border bg-white p-5">
            <h2 className="flex items-center gap-2 font-semibold mb-3 text-sm">
              <Tag className="h-4 w-4 text-blue-600" /> Ramos ({ramos.length})
            </h2>
            <TagInput items={ramos} onChange={setRamos} placeholder="Ej: AUTOS" />
          </div>
          <div className="rounded-xl border bg-white p-5">
            <h2 className="flex items-center gap-2 font-semibold mb-3 text-sm">
              <CreditCard className="h-4 w-4 text-blue-600" /> Medios de pago ({medios.length})
            </h2>
            <TagInput items={medios} onChange={setMedios} placeholder="Ej: DEBITO" />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">Al cargar una póliza con aseguradora o ramo nuevo, se agrega automáticamente al catálogo.</p>

        <button onClick={guardar} disabled={saving} type="button" className="h-10 px-5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Guardar todos los cambios
        </button>
      </div>
    </DashboardLayout>
  )
}
