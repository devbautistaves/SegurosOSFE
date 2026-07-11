"use client"

import { useEffect, useRef, useState } from "react"
import { aseguradoraAPI, suscripcionAPI, CompaniaConfig, DatosCobro } from "@/lib/api"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Loader2, Plus, X, Save, Tag, Building2, CreditCard, Upload, Crown, ImageIcon, Phone, ChevronDown, ChevronRight, ShieldAlert, AppWindow, Search } from "lucide-react"
import { MisDatosSection } from "@/components/mis-datos-section"

// ── helpers ──────────────────────────────────────────────────────────────────
// Etiqueta legible: SAN_CRISTOBAL → San Cristóbal (el valor guardado sigue en MAYÚS_GUIÓN).
const pretty = (s: string) => s.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase())

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="group inline-flex items-center gap-1.5 rounded-lg border border-blue-200/70 bg-blue-50/80 text-blue-800 text-[12.5px] font-medium pl-3 pr-1.5 py-1.5 transition-colors hover:border-blue-300 chip-pop">
      {pretty(label)}
      <button
        onClick={onRemove}
        type="button"
        aria-label={`Quitar ${pretty(label)}`}
        className="grid place-items-center h-5 w-5 rounded-md text-blue-400 transition-colors hover:bg-red-100 hover:text-red-600"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  )
}

function TagInput({ items, onChange, placeholder }: { items: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [val, setVal] = useState("")
  const [q, setQ] = useState("")
  const norm = val.trim().toUpperCase().replace(/\s+/g, "_")
  const dup = !!norm && items.includes(norm)
  const add = () => {
    if (!norm || dup) { return }
    onChange([...items, norm]); setVal("")
  }
  // Orden alfabetico (por etiqueta legible) + filtro de busqueda.
  const sorted = [...items].sort((a, b) => pretty(a).localeCompare(pretty(b), "es"))
  const ql = q.trim().toLowerCase()
  const shown = ql ? sorted.filter(i => pretty(i).toLowerCase().includes(ql)) : sorted
  return (
    <>
      <style>{`@keyframes chipPop{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:none}} .chip-pop{animation:chipPop .18s ease-out both}`}</style>
      <div className="flex gap-2">
        <input
          className="flex-1 h-9 rounded-lg border border-input bg-white px-3 text-sm outline-none transition-shadow focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
          placeholder={placeholder}
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
        />
        <button
          onClick={add}
          type="button"
          disabled={!norm || dup}
          title={dup ? "Ya está en la lista" : "Agregar (Enter)"}
          className="h-9 px-3 rounded-lg bg-blue-600 text-white text-sm font-medium flex items-center gap-1 transition-colors hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" /> Agregar
        </button>
      </div>
      {dup && <p className="text-[11px] text-amber-600 mt-1.5">“{pretty(norm)}” ya está en la lista.</p>}
      {items.length > 6 && (
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={`Buscar en ${items.length}…`}
            className="w-full h-8 rounded-lg border border-input bg-white pl-8 pr-3 text-[13px] outline-none transition-shadow focus:border-blue-400 focus:ring-2 focus:ring-blue-200" />
        </div>
      )}
      <div className="flex flex-wrap gap-2 mt-3 min-h-[32px]">
        {shown.map(i => <Chip key={i} label={i} onRemove={() => onChange(items.filter(x => x !== i))} />)}
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground italic py-1">Todavía no agregaste ninguno. Escribí arriba y tocá Agregar.</p>
        )}
        {items.length > 0 && shown.length === 0 && (
          <p className="text-xs text-muted-foreground italic py-1">Sin resultados para “{q}”.</p>
        )}
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

  // Config por compañía: teléfonos / app / sitio que ve el cliente en su legajo.
  const [companias, setCompanias] = useState<CompaniaConfig[]>([])
  const [companiaAbierta, setCompaniaAbierta] = useState<string | null>(null)

  // Datos de cobro que ve el asegurado en su legajo (cómo pagarte)
  const [datosCobro, setDatosCobro] = useState<DatosCobro>({ alias: "", cbu: "", titular: "", banco: "", linkPago: "", nota: "" })
  const setDC = (patch: Partial<DatosCobro>) => setDatosCobro(d => ({ ...d, ...patch }))

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
      setCompanias(((a as any).companiasConfig || []) as CompaniaConfig[])
      setDatosCobro({ alias: "", cbu: "", titular: "", banco: "", linkPago: "", nota: "", ...((a as any).datosCobro || {}) })
      setEsPRO(sus.plan === "PRO" && sus.planStatus === "ACTIVO")
    }).catch(e => setErr(e.message)).finally(() => setLoading(false))
  }, [])

  const guardar = async () => {
    if (!token) return
    setSaving(true); setOk(null); setErr(null)
    try {
      await Promise.all([
        aseguradoraAPI.updateMe(token, { nombre, whatsapp, email, telefono, cuit, direccion, colorPrimario, datosCobro }),
        aseguradoraAPI.updateCatalogos(token, { aseguradorasCatalogo: aseguradoras, ramosCatalogo: ramos, medioDePagoCatalogo: medios }),
        aseguradoraAPI.updateCompanias(token, companias),
      ])
      // Sync localStorage: nombre/branding + TODOS los catálogos para que
      // useCatalogos los lea inmediatamente y el sidebar se redibuje.
      const stored = localStorage.getItem("aseguradora")
      if (stored) {
        try {
          localStorage.setItem("aseguradora", JSON.stringify({
            ...JSON.parse(stored),
            nombre, colorPrimario, whatsapp, logo,
            aseguradorasCatalogo: aseguradoras,
            ramosCatalogo: ramos,
            medioDePagoCatalogo: medios,
          }))
          window.dispatchEvent(new Event("branding-updated"))
        } catch {}
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
      // Sync localStorage para que sidebar muestre logo nuevo al toque
      try {
        const stored = localStorage.getItem("aseguradora")
        if (stored) localStorage.setItem("aseguradora", JSON.stringify({ ...JSON.parse(stored), logo: d.logo }))
        window.dispatchEvent(new Event("branding-updated"))
      } catch {}
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

        {/* ── Datos de cobro: cómo te paga el asegurado (aparece en su legajo) ── */}
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold flex items-center gap-2 mb-1">
            <CreditCard className="h-4 w-4 text-emerald-600" /> Cómo te pagan tus clientes
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Estos datos aparecen en el legajo del asegurado, en el bloque <strong>"Cómo pagar"</strong>, al lado de sus cuotas. Dejá vacío lo que no uses.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Alias</span>
              <input className="mt-1 w-full h-9 rounded-md border px-3 text-sm" placeholder="mi.alias.mp" value={datosCobro.alias || ""} onChange={e => setDC({ alias: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">CBU / CVU</span>
              <input className="mt-1 w-full h-9 rounded-md border px-3 text-sm" placeholder="0000003100000000000000" value={datosCobro.cbu || ""} onChange={e => setDC({ cbu: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Titular</span>
              <input className="mt-1 w-full h-9 rounded-md border px-3 text-sm" placeholder="Nombre del titular de la cuenta" value={datosCobro.titular || ""} onChange={e => setDC({ titular: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Banco / Billetera</span>
              <input className="mt-1 w-full h-9 rounded-md border px-3 text-sm" placeholder="Mercado Pago, Galicia, etc." value={datosCobro.banco || ""} onChange={e => setDC({ banco: e.target.value })} />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Link de pago (opcional)</span>
              <input className="mt-1 w-full h-9 rounded-md border px-3 text-sm" placeholder="https://mpago.la/… o link de Modo/débito" value={datosCobro.linkPago || ""} onChange={e => setDC({ linkPago: e.target.value })} />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nota para el cliente (opcional)</span>
              <input className="mt-1 w-full h-9 rounded-md border px-3 text-sm" placeholder="Ej: mandame el comprobante por WhatsApp así te confirmo" value={datosCobro.nota || ""} onChange={e => setDC({ nota: e.target.value })} />
            </label>
          </div>
        </div>

        {/* ── Compañías: info que ven los clientes en su legajo ── */}
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold flex items-center gap-2 mb-1">
            <Phone className="h-4 w-4 text-blue-600" /> Info por compañía para tus clientes
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Estos datos aparecen en el legajo público de cada asegurado, en el bloque <strong>"Si te pasa algo, ahora"</strong>.
            Cargá lo que querés que vean.
          </p>

          {aseguradoras.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Primero agregá compañías al catálogo de arriba.</p>
          ) : (
            <div className="space-y-2">
              {aseguradoras.map(nombre => {
                const conf = companias.find(c => c.nombre === nombre) || { nombre }
                const tieneAlgo = !!(conf.telefonoAuxilio || conf.telefonoSiniestros || conf.appUrl || conf.sitioWeb || conf.notasDelPAS)
                const abierta = companiaAbierta === nombre
                const setConf = (patch: Partial<CompaniaConfig>) => {
                  setCompanias(prev => {
                    const idx = prev.findIndex(c => c.nombre === nombre)
                    if (idx >= 0) {
                      const next = [...prev]; next[idx] = { ...next[idx], ...patch }; return next
                    }
                    return [...prev, { nombre, ...patch }]
                  })
                }
                const label = nombre.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
                return (
                  <div key={nombre} className="border rounded-lg overflow-hidden">
                    <button type="button" onClick={() => setCompaniaAbierta(abierta ? null : nombre)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left">
                      {abierta ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-sm flex-1">{label}</span>
                      {tieneAlgo
                        ? <span className="text-[11px] uppercase tracking-wide bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">Configurada</span>
                        : <span className="text-[11px] uppercase tracking-wide bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Sin datos</span>}
                    </button>
                    {abierta && (
                      <div className="px-4 pb-4 pt-1 grid sm:grid-cols-2 gap-3 bg-gray-50/50">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5"><Phone className="h-3 w-3" />Auxilio en ruta (0800)</label>
                          <input className="mt-1 w-full h-9 rounded-md border px-3 text-sm bg-white" value={conf.telefonoAuxilio || ""} onChange={e => setConf({ telefonoAuxilio: e.target.value })} placeholder="0800 444 1234" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5"><ShieldAlert className="h-3 w-3" />Denuncia de siniestros</label>
                          <input className="mt-1 w-full h-9 rounded-md border px-3 text-sm bg-white" value={conf.telefonoSiniestros || ""} onChange={e => setConf({ telefonoSiniestros: e.target.value })} placeholder="0800 222 5252" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5"><AppWindow className="h-3 w-3" />App de la compañía (URL)</label>
                          <input className="mt-1 w-full h-9 rounded-md border px-3 text-sm bg-white" value={conf.appUrl || ""} onChange={e => setConf({ appUrl: e.target.value })} placeholder="https://..." />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sitio web</label>
                          <input className="mt-1 w-full h-9 rounded-md border px-3 text-sm bg-white" value={conf.sitioWeb || ""} onChange={e => setConf({ sitioWeb: e.target.value })} placeholder="https://..." />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nota corta (lo que querés decirle al cliente)</label>
                          <input className="mt-1 w-full h-9 rounded-md border px-3 text-sm bg-white" maxLength={200} value={conf.notasDelPAS || ""} onChange={e => setConf({ notasDelPAS: e.target.value })} placeholder="Ej: siempre pedí el N° de siniestro." />
                          <p className="text-[11px] text-muted-foreground mt-1">Tip: cortita, sirve más como recordatorio que como manual.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <button onClick={guardar} disabled={saving} type="button" className="h-10 px-5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Guardar todos los cambios
        </button>

        {/* Privacidad / Mis datos / Baja — Ley 25.326 */}
        <MisDatosSection />
      </div>
    </DashboardLayout>
  )
}
