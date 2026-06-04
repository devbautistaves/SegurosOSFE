"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { saAseguradoras } from "@/lib/superadmin-api"
import { Building2, Search, Plus, Loader2, ChevronLeft, ChevronRight, X } from "lucide-react"

export default function AseguradorasPage() {
  const params = useSearchParams()
  const [data, setData] = useState<any>({ aseguradoras: [], total: 0, page: 1, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(params.get("search") || "")
  const [plan, setPlan] = useState(params.get("plan") || "")
  const [planStatus, setPlanStatus] = useState(params.get("planStatus") || "")
  const [activo, setActivo] = useState<string>(params.get("activo") || "")
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)

  const fetch = async () => {
    setLoading(true)
    try {
      const p: any = { page, limit: 30 }
      if (search) p.search = search
      if (plan) p.plan = plan
      if (planStatus) p.planStatus = planStatus
      if (activo) p.activo = activo
      const res = await saAseguradoras.list(p)
      setData(res)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [page, plan, planStatus, activo])
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetch() }, 300)
    return () => clearTimeout(t)
  }, [search])

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Aseguradoras</h1>
          <p className="text-sm text-slate-400 mt-0.5">{data.total} brokers registrados en el SaaS</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold flex items-center gap-1.5 hover:opacity-90">
          <Plus className="h-4 w-4" /> Crear manual
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, slug, email..."
            className="w-full pl-8 pr-3 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
        </div>
        <Select value={plan} onChange={setPlan} placeholder="Plan"
          options={[["", "Todos"], ["FREE", "FREE"], ["PRO", "PRO"]]} />
        <Select value={planStatus} onChange={setPlanStatus} placeholder="Estado"
          options={[["", "Todos"], ["ACTIVO", "ACTIVO"], ["VENCIDO", "VENCIDO"], ["CANCELADO", "CANCELADO"]]} />
        <Select value={activo} onChange={setActivo} placeholder="Activo"
          options={[["", "Todos"], ["true", "Sí"], ["false", "No"]]} />
        {(search || plan || planStatus || activo) && (
          <button onClick={() => { setSearch(""); setPlan(""); setPlanStatus(""); setActivo(""); setPage(1) }}
            className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-1">
            <X className="h-3 w-3" /> Limpiar
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-500" /></div>
        ) : data.aseguradoras.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500"><Building2 className="h-8 w-8 mx-auto mb-2 opacity-30" />Sin resultados</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-black/30 border-b border-white/10">
                <tr className="text-left text-[10px] text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Uso</th>
                  <th className="px-4 py-3">Vence</th>
                  <th className="px-4 py-3">Alta</th>
                  <th className="px-4 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.aseguradoras.map((a: any) => (
                  <tr key={a._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/superadmin/aseguradoras/${a._id}`} className="block">
                        <p className="font-medium text-white hover:text-blue-300">{a.nombre}</p>
                        <p className="text-[11px] text-slate-500">{a.slug} · {a.email || "—"}</p>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        a.plan === "PRO" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"
                      }`}>{a.plan}</span>
                      {a.planTipo && <span className="text-[10px] text-slate-500 ml-1">{a.planTipo}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                        !a.activo ? "bg-red-500/20 text-red-400" :
                        a.planStatus === "ACTIVO" ? "bg-emerald-500/20 text-emerald-400" :
                        a.planStatus === "VENCIDO" ? "bg-amber-500/20 text-amber-400" :
                        "bg-slate-500/20 text-slate-400"
                      }`}>
                        {!a.activo ? "SUSPENDIDO" : a.planStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-slate-400">
                      <div>{a.usuarios} users</div>
                      <div className="text-[10px] text-slate-600">{a.polizas} pólizas</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {a.planVencimiento ? new Date(a.planVencimiento).toLocaleDateString("es-AR") : "—"}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-500">
                      {new Date(a.createdAt).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/superadmin/aseguradoras/${a._id}`} className="text-xs text-blue-400 hover:text-blue-300">
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-black/20">
            <p className="text-xs text-slate-500">Página {data.page} de {data.totalPages}</p>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="px-2 py-1 rounded text-slate-400 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}
                className="px-2 py-1 rounded text-slate-400 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {createOpen && <CreateModal onClose={() => setCreateOpen(false)} onCreated={() => { setCreateOpen(false); fetch() }} />}
    </div>
  )
}

function Select({ value, onChange, placeholder, options }: any) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="px-3 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500/50">
      {options.map(([v, l]: any) => <option key={v} value={v} className="bg-black">{l || placeholder}</option>)}
    </select>
  )
}

function CreateModal({ onClose, onCreated }: any) {
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", adminName: "", adminEmail: "", adminPassword: "", plan: "FREE", planTipo: "", planVencimiento: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(""); setLoading(true)
    try {
      await saAseguradoras.create(form)
      onCreated()
    } catch (e: any) { setError(e.message) } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-xl p-6 space-y-3 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Crear aseguradora manual</h2>
            <p className="text-xs text-slate-400">Para brokers que pagan por fuera de MercadoPago</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-white"><X className="h-4 w-4" /></button>
        </div>

        <Input label="Nombre del broker *" value={form.nombre} onChange={v => set("nombre", v)} required />
        <div className="grid grid-cols-2 gap-2">
          <Input label="Email broker" value={form.email} onChange={v => set("email", v)} type="email" />
          <Input label="Teléfono" value={form.telefono} onChange={v => set("telefono", v)} />
        </div>

        <div className="pt-2 border-t border-white/10">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Admin inicial</p>
          <Input label="Nombre" value={form.adminName} onChange={v => set("adminName", v)} />
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Input label="Email *" value={form.adminEmail} onChange={v => set("adminEmail", v)} type="email" required />
            <Input label="Pass temporal *" value={form.adminPassword} onChange={v => set("adminPassword", v)} required />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
          <div>
            <p className="text-[10px] text-slate-500 mb-1">Plan</p>
            <select value={form.plan} onChange={e => set("plan", e.target.value)} className="w-full px-2 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white">
              <option value="FREE" className="bg-black">FREE</option>
              <option value="PRO" className="bg-black">PRO</option>
            </select>
          </div>
          {form.plan === "PRO" && (
            <>
              <div>
                <p className="text-[10px] text-slate-500 mb-1">Tipo</p>
                <select value={form.planTipo} onChange={e => set("planTipo", e.target.value)} className="w-full px-2 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white">
                  <option value="" className="bg-black">—</option>
                  <option value="mensual" className="bg-black">Mensual</option>
                  <option value="anual" className="bg-black">Anual</option>
                </select>
              </div>
              <Input label="Vence" value={form.planVencimiento} onChange={v => set("planVencimiento", v)} type="date" />
            </>
          )}
        </div>

        {error && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded p-2">{error}</div>}

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-white/10 text-sm text-slate-300 hover:bg-white/5">Cancelar</button>
          <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Crear aseguradora
          </button>
        </div>
      </form>
    </div>
  )
}

function Input({ label, value, onChange, type = "text", required }: any) {
  return (
    <div>
      <p className="text-[10px] text-slate-500 mb-1">{label}</p>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required}
        className="w-full px-2.5 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50" />
    </div>
  )
}
