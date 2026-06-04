"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { saDashboard } from "@/lib/superadmin-api"
import {
  DollarSign, TrendingUp, TrendingDown, Building2, UserCheck, AlertCircle,
  Calendar, ArrowRight, Loader2,
} from "lucide-react"
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

function fmtMoney(n: number) { return `$${(n || 0).toLocaleString("es-AR")}` }
function fmtPct(n: number | null) { if (n === null || isNaN(n)) return "—"; const s = n.toFixed(1); return `${n >= 0 ? "+" : ""}${s}%` }

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    saDashboard.get()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-[80vh]">
      <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
    </div>
  )
  if (error) return <div className="p-8"><p className="text-red-400 text-sm">{error}</p></div>
  if (!data) return null

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard global</h1>
          <p className="text-sm text-slate-400 mt-0.5">Métricas del SaaS SegurOS en tiempo real</p>
        </div>
        <div className="text-xs text-slate-500">
          Actualizado {new Date().toLocaleTimeString("es-AR")}
        </div>
      </div>

      {/* KPIs grandes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI
          label="MRR" value={fmtMoney(data.revenue.mrr)}
          sub={`ARR ${fmtMoney(data.revenue.arr)}`}
          icon={DollarSign} color="from-emerald-500/20 to-emerald-500/0" iconColor="text-emerald-400"
        />
        <KPI
          label="Brokers activos" value={data.brokers.activos.toString()}
          sub={`${data.brokers.pro} PRO · ${data.brokers.free} FREE`}
          icon={Building2} color="from-blue-500/20 to-blue-500/0" iconColor="text-blue-400"
        />
        <KPI
          label="Signups (30d)" value={data.signups.ultimos30.toString()}
          sub={data.signups.growthPct !== null ? `${fmtPct(data.signups.growthPct)} vs período anterior` : "Sin datos previos"}
          icon={UserCheck} color="from-purple-500/20 to-purple-500/0" iconColor="text-purple-400"
          trend={data.signups.growthPct}
        />
        <KPI
          label="Churn (30d)" value={data.churn.cancelados30d.toString()}
          sub={`${data.churn.rate.toFixed(1)}% rate`}
          icon={TrendingDown} color="from-red-500/20 to-red-500/0" iconColor="text-red-400"
        />
      </div>

      {/* Alertas */}
      {(data.proximasVencer.en7dias > 0 || data.brokers.vencidos > 0) && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-200">Atención requerida</p>
            <p className="text-xs text-amber-300/80 mt-1">
              {data.proximasVencer.en7dias > 0 && <span>{data.proximasVencer.en7dias} broker(s) vencen en los próximos 7 días. </span>}
              {data.brokers.vencidos > 0 && <span>{data.brokers.vencidos} broker(s) con plan VENCIDO sin reactivar.</span>}
            </p>
          </div>
          <Link href="/superadmin/aseguradoras?planStatus=VENCIDO" className="text-xs text-amber-200 hover:text-white flex items-center gap-1 whitespace-nowrap">
            Ver <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Signups daily */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-white">Signups diarios (30d)</h3>
              <p className="text-[11px] text-slate-500">Nuevos brokers registrados</p>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.signups.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickFormatter={d => d.slice(5)} />
                <YAxis stroke="#64748b" fontSize={10} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top brokers */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <h3 className="text-sm font-medium text-white mb-1">Top brokers por uso</h3>
          <p className="text-[11px] text-slate-500 mb-4">Ordenados por # de pólizas cargadas</p>
          <div className="space-y-2">
            {data.topBrokers.slice(0, 8).map((b: any, i: number) => (
              <Link key={b._id} href={`/superadmin/aseguradoras/${b._id}`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group">
                <span className="w-5 text-center text-xs font-bold text-slate-500">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover:text-blue-300">{b.nombre}</p>
                  <p className="text-[10px] text-slate-500">
                    <span className={`px-1.5 py-0.5 rounded ${b.plan === "PRO" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"}`}>{b.plan}</span>
                    <span className="ml-1">{b.planStatus}</span>
                  </p>
                </div>
                <span className="text-sm font-bold text-white">{b.polizas}</span>
              </Link>
            ))}
            {data.topBrokers.length === 0 && <p className="text-xs text-slate-500 text-center py-4">Sin datos</p>}
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat title="PRO Mensual" value={data.brokers.proMensual} sub={`${fmtMoney(data.brokers.proMensual * 45000)} MRR`} />
        <Stat title="PRO Anual" value={data.brokers.proAnual} sub={`${fmtMoney(data.brokers.proAnual * 470000 / 12)} MRR equivalente`} />
        <Stat title="Próximos a vencer (30d)" value={data.proximasVencer.en30dias} sub={`${data.proximasVencer.en7dias} críticos (≤7d)`} />
      </div>
    </div>
  )
}

function KPI({ label, value, sub, icon: Icon, color, iconColor, trend }: any) {
  return (
    <div className={`relative rounded-xl border border-white/10 bg-gradient-to-br ${color} p-5 overflow-hidden`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-slate-300 uppercase tracking-wider">{label}</p>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <div className="flex items-center gap-1 mt-1">
        {trend !== undefined && trend !== null && (
          trend >= 0
            ? <TrendingUp className="h-3 w-3 text-emerald-400" />
            : <TrendingDown className="h-3 w-3 text-red-400" />
        )}
        <p className="text-[11px] text-slate-400">{sub}</p>
      </div>
    </div>
  )
}

function Stat({ title, value, sub }: { title: string; value: any; sub: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <p className="text-[11px] text-slate-500 uppercase tracking-wider">{title}</p>
      <p className="text-xl font-bold text-white mt-1">{value}</p>
      <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
    </div>
  )
}
