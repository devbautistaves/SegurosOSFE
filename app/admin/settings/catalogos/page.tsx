"use client"

import { useEffect, useState } from "react"
import { aseguradoraAPI } from "@/lib/api"
import { Loader2, Plus, X, Save, Tag, Building2 } from "lucide-react"

export default function CatalogosPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [aseguradoras, setAseguradoras] = useState<string[]>([])
  const [ramos, setRamos] = useState<string[]>([])
  const [nuevaAseg, setNuevaAseg] = useState("")
  const [nuevoRamo, setNuevoRamo] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return
    aseguradoraAPI.getCatalogos(token).then(r => {
      setAseguradoras(r.aseguradorasCatalogo || [])
      setRamos(r.ramosCatalogo || [])
    }).catch(e => setErr(e.message)).finally(() => setLoading(false))
  }, [])

  const guardar = async () => {
    const token = localStorage.getItem("token")
    if (!token) return
    setSaving(true); setErr(null); setOk(null)
    try {
      await aseguradoraAPI.updateCatalogos(token, {
        aseguradorasCatalogo: aseguradoras,
        ramosCatalogo: ramos,
      })
      setOk("Catálogos guardados")
    } catch (e: any) { setErr(e.message) }
    finally { setSaving(false) }
  }

  const addAseg = () => {
    const v = nuevaAseg.trim().toUpperCase().replace(/\s+/g, "_")
    if (!v || aseguradoras.includes(v)) { setNuevaAseg(""); return }
    setAseguradoras([...aseguradoras, v]); setNuevaAseg("")
  }
  const addRamo = () => {
    const v = nuevoRamo.trim().toUpperCase().replace(/\s+/g, "_")
    if (!v || ramos.includes(v)) { setNuevoRamo(""); return }
    setRamos([...ramos, v]); setNuevoRamo("")
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Catálogos del broker</h1>
        <p className="text-muted-foreground text-sm">Definí las aseguradoras y ramos con los que trabajás. Aparecen como opciones al crear una póliza.</p>
      </div>

      {err && <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 p-3 text-sm">{err}</div>}
      {ok &&  <div className="rounded-lg border border-green-300 bg-green-50 text-green-700 p-3 text-sm">{ok}</div>}

      <div className="grid md:grid-cols-2 gap-5">
        {/* Aseguradoras */}
        <div className="rounded-xl border bg-white p-5">
          <h2 className="flex items-center gap-2 font-semibold mb-3">
            <Building2 className="h-4 w-4 text-blue-600" /> Aseguradoras ({aseguradoras.length})
          </h2>
          <div className="flex gap-2">
            <input
              className="flex-1 h-9 rounded-md border px-3 text-sm"
              placeholder="Ej: LA_CAJA"
              value={nuevaAseg}
              onChange={e => setNuevaAseg(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addAseg())}
            />
            <button onClick={addAseg} className="h-9 px-3 rounded-md bg-blue-600 text-white text-sm font-medium flex items-center gap-1">
              <Plus className="h-4 w-4" /> Agregar
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {aseguradoras.map(a => (
              <span key={a} className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 text-xs px-2.5 py-1">
                {a}
                <button onClick={() => setAseguradoras(aseguradoras.filter(x => x !== a))} className="hover:text-red-600">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {aseguradoras.length === 0 && <p className="text-sm text-muted-foreground">Sin aseguradoras cargadas.</p>}
          </div>
        </div>

        {/* Ramos */}
        <div className="rounded-xl border bg-white p-5">
          <h2 className="flex items-center gap-2 font-semibold mb-3">
            <Tag className="h-4 w-4 text-blue-600" /> Ramos ({ramos.length})
          </h2>
          <div className="flex gap-2">
            <input
              className="flex-1 h-9 rounded-md border px-3 text-sm"
              placeholder="Ej: AUTOS"
              value={nuevoRamo}
              onChange={e => setNuevoRamo(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addRamo())}
            />
            <button onClick={addRamo} className="h-9 px-3 rounded-md bg-blue-600 text-white text-sm font-medium flex items-center gap-1">
              <Plus className="h-4 w-4" /> Agregar
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {ramos.map(r => (
              <span key={r} className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 text-xs px-2.5 py-1">
                {r}
                <button onClick={() => setRamos(ramos.filter(x => x !== r))} className="hover:text-red-600">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {ramos.length === 0 && <p className="text-sm text-muted-foreground">Sin ramos cargados.</p>}
          </div>
        </div>
      </div>

      <button onClick={guardar} disabled={saving} className="h-10 px-5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 disabled:opacity-50">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Guardar cambios
      </button>

      <p className="text-xs text-muted-foreground">
        Al crear una póliza con una aseguradora o ramo nuevo, también se agrega automáticamente al catálogo.
      </p>
    </div>
  )
}
