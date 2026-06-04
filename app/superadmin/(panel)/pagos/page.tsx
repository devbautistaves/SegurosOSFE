"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CreditCard, Loader2, ChevronLeft, ChevronRight, RotateCcw, X } from "lucide-react"
import { saPagos } from "@/lib/superadmin-api"

export default function PagosPage() {
  const [data, setData] = useState<any>({ pagos: [], total: 0, page: 1, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [refundOpen, setRefundOpen] = useState<any>(null)

  const fetch = async () => {
    setLoading(true)
    try {
      const p: any = { page, limit: 50 }
      if (status) p.status = status
      const res = await saPagos.list(p)
      setData(res)
    } finally { setLoading(false) }
  }
  useEffect(() => { fetch() }, [page, status])

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pagos</h1>
          <p className="text-sm text-slate-400 mt-0.5">{data.total} pagos · MercadoPago</p>
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
          className="px-3 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white">
          <option value="" className="bg-black">Todos los estados</option>
          <option value="approved" className="bg-black">Aprobados</option>
          <option value="pending" className="bg-black">Pendientes</option>
          <option value="rejected" className="bg-black">Rechazados</option>
          <option value="refunded" className="bg-black">Reembolsados</option>
          <option value="failed" className="bg-black">Fallidos</option>
        </select>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-500" /></div>
        ) : data.pagos.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500"><CreditCard className="h-8 w-8 mx-auto mb-2 opacity-30" />Sin pagos</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-black/30 border-b border-white/10">
                <tr className="text-left text-[10px] text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Broker</th>
                  <th className="px-4 py-3">Monto</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">MP ID</th>
                  <th className="px-4 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.pagos.map((p: any) => (
                  <tr key={p._id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-xs text-slate-400">{new Date(p.createdAt).toLocaleString("es-AR")}</td>
                    <td className="px-4 py-3">
                      {p.aseguradoraId ? (
                        <Link href={`/superadmin/aseguradoras/${p.aseguradoraId._id || p.aseguradoraId}`} className="text-white hover:text-blue-300">
                          {p.aseguradoraId.nombre || p.aseguradoraId}
                        </Link>
                      ) : <span className="text-slate-500">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-white">${(p.monto || 0).toLocaleString("es-AR")}</span>
                      {p.tipoPlan && <span className="text-[10px] text-slate-500 ml-1.5">{p.tipoPlan}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        p.status === "approved" ? "bg-emerald-500/20 text-emerald-400" :
                        p.status === "refunded" ? "bg-purple-500/20 text-purple-400" :
                        p.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-500 font-mono">{p.mpPaymentId || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      {p.status === "approved" && (
                        <button onClick={() => setRefundOpen(p)}
                          className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 ml-auto">
                          <RotateCcw className="h-3 w-3" /> Refund
                        </button>
                      )}
                      {p.status === "refunded" && p.refundedAt && (
                        <span className="text-[10px] text-slate-500">
                          {new Date(p.refundedAt).toLocaleDateString("es-AR")}
                        </span>
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

      {refundOpen && <RefundModal pago={refundOpen} onClose={() => setRefundOpen(null)} onDone={() => { setRefundOpen(null); fetch() }} />}
    </div>
  )
}

function RefundModal({ pago, onClose, onDone }: any) {
  const [motivo, setMotivo] = useState("")
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!motivo.trim()) { setErr("Indicá el motivo"); return }
    setLoading(true); setErr("")
    try {
      await saPagos.refund(pago._id, motivo)
      onDone()
    } catch (e: any) { setErr(e.message); setLoading(false) }
  }
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Reembolsar pago</h2>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-white"><X className="h-4 w-4" /></button>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-xs space-y-1">
          <p className="text-slate-400">Monto: <span className="text-white font-semibold">${(pago.monto || 0).toLocaleString("es-AR")}</span></p>
          <p className="text-slate-400">MP ID: <span className="text-white font-mono">{pago.mpPaymentId || "—"}</span></p>
          <p className="text-amber-400 mt-2">⚠ Esta acción solo marca el pago como reembolsado en la base. El refund en MP hay que hacerlo manualmente.</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Motivo *</p>
          <textarea value={motivo} onChange={e => setMotivo(e.target.value)} required rows={3}
            placeholder="Razón del reembolso..."
            className="w-full px-2.5 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white placeholder-slate-600 resize-none" />
        </div>
        {err && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded p-2">{err}</div>}
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-white/10 text-sm text-slate-300 hover:bg-white/5">Cancelar</button>
          <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Confirmar refund
          </button>
        </div>
      </form>
    </div>
  )
}
