"use client"

import { useEffect, useState } from "react"
import { ScrollText, Loader2, ChevronLeft, ChevronRight, X } from "lucide-react"
import { saAuditLog } from "@/lib/superadmin-api"

const ACTIONS = [
  "AUTH_LOGIN", "AUTH_LOGOUT", "AUTH_PASSWORD_CHANGED",
  "ASEGURADORA_CREATE_MANUAL", "ASEGURADORA_FORCE_PLAN", "ASEGURADORA_SUSPEND",
  "ASEGURADORA_REACTIVATE", "ASEGURADORA_IMPERSONATE",
  "USER_RESET_PASSWORD", "PAGO_REFUND", "BROADCAST_EMAIL", "BANNER_UPDATE", "CONFIG_UPDATE",
]

const ACTION_COLORS: Record<string, string> = {
  AUTH_LOGIN: "bg-slate-500/20 text-slate-300",
  AUTH_LOGOUT: "bg-slate-500/20 text-slate-300",
  AUTH_PASSWORD_CHANGED: "bg-blue-500/20 text-blue-300",
  ASEGURADORA_CREATE_MANUAL: "bg-emerald-500/20 text-emerald-300",
  ASEGURADORA_FORCE_PLAN: "bg-blue-500/20 text-blue-300",
  ASEGURADORA_SUSPEND: "bg-red-500/20 text-red-300",
  ASEGURADORA_REACTIVATE: "bg-emerald-500/20 text-emerald-300",
  ASEGURADORA_IMPERSONATE: "bg-purple-500/20 text-purple-300",
  USER_RESET_PASSWORD: "bg-amber-500/20 text-amber-300",
  PAGO_REFUND: "bg-purple-500/20 text-purple-300",
  BROADCAST_EMAIL: "bg-blue-500/20 text-blue-300",
  BANNER_UPDATE: "bg-amber-500/20 text-amber-300",
  CONFIG_UPDATE: "bg-blue-500/20 text-blue-300",
}

export default function AuditLogPage() {
  const [data, setData] = useState<any>({ logs: [], total: 0, page: 1, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ action: "", from: "", to: "" })
  const [page, setPage] = useState(1)
  const [detail, setDetail] = useState<any>(null)

  const fetch = async () => {
    setLoading(true)
    try {
      const p: any = { page, limit: 100 }
      if (filters.action) p.action = filters.action
      if (filters.from) p.from = filters.from
      if (filters.to) p.to = filters.to
      const res = await saAuditLog.list(p)
      setData(res)
    } finally { setLoading(false) }
  }
  useEffect(() => { fetch() }, [page, filters])

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit log</h1>
        <p className="text-sm text-slate-400 mt-0.5">{data.total} eventos · todas las acciones de superadmins</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <select value={filters.action} onChange={e => { setFilters(f => ({ ...f, action: e.target.value })); setPage(1) }}
          className="px-3 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white">
          <option value="" className="bg-black">Todas las acciones</option>
          {ACTIONS.map(a => <option key={a} value={a} className="bg-black">{a}</option>)}
        </select>
        <input type="date" value={filters.from} onChange={e => { setFilters(f => ({ ...f, from: e.target.value })); setPage(1) }}
          className="px-3 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white" />
        <input type="date" value={filters.to} onChange={e => { setFilters(f => ({ ...f, to: e.target.value })); setPage(1) }}
          className="px-3 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white" />
        {(filters.action || filters.from || filters.to) && (
          <button onClick={() => { setFilters({ action: "", from: "", to: "" }); setPage(1) }}
            className="px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-1">
            <X className="h-3 w-3" /> Limpiar
          </button>
        )}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-500" /></div>
        ) : data.logs.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500"><ScrollText className="h-8 w-8 mx-auto mb-2 opacity-30" />Sin eventos</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-black/30 border-b border-white/10">
                <tr className="text-left text-[10px] text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">SuperAdmin</th>
                  <th className="px-4 py-3">Acción</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.logs.map((l: any) => (
                  <tr key={l._id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-2.5 text-[11px] text-slate-400 font-mono whitespace-nowrap">
                      {new Date(l.createdAt).toLocaleString("es-AR")}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-300">{l.superAdminEmail}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${ACTION_COLORS[l.action] || "bg-slate-500/20 text-slate-300"}`}>
                        {l.action}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs">
                      {l.targetLabel ? (
                        <>
                          <p className="text-white">{l.targetLabel}</p>
                          <p className="text-[10px] text-slate-500">{l.targetType}</p>
                        </>
                      ) : <span className="text-slate-500">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-[11px] text-slate-500 font-mono">{l.ip || "—"}</td>
                    <td className="px-4 py-2.5 text-right">
                      {l.details && Object.keys(l.details).length > 0 && (
                        <button onClick={() => setDetail(l)} className="text-xs text-blue-400 hover:text-blue-300">
                          Ver detalle
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-black/20">
            <p className="text-xs text-slate-500">Página {data.page} de {data.totalPages}</p>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="px-2 py-1 rounded text-slate-400 hover:bg-white/5 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
              <button disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}
                className="px-2 py-1 rounded text-slate-400 hover:bg-white/5 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{detail.action}</h2>
              <button onClick={() => setDetail(null)} className="text-slate-500 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <p className="text-xs text-slate-400">
              {detail.superAdminEmail} · {new Date(detail.createdAt).toLocaleString("es-AR")}
            </p>
            {detail.targetLabel && (
              <p className="text-xs text-slate-400">Target: <span className="text-white">{detail.targetLabel}</span> ({detail.targetType})</p>
            )}
            <pre className="bg-black/40 border border-white/10 rounded-lg p-3 text-[11px] text-slate-300 font-mono overflow-x-auto max-h-96">
              {JSON.stringify(detail.details, null, 2)}
            </pre>
            <p className="text-[10px] text-slate-500 font-mono">UA: {detail.userAgent || "—"}</p>
          </div>
        </div>
      )}
    </div>
  )
}
