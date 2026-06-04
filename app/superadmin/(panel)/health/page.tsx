"use client"

import { useEffect, useState } from "react"
import { Activity, Database, HardDrive, CreditCard, Cpu, Clock, Loader2, RefreshCw } from "lucide-react"
import { saHealth } from "@/lib/superadmin-api"

function fmtBytes(b: number) {
  if (!b && b !== 0) return "—"
  const u = ["B", "KB", "MB", "GB", "TB"]
  let i = 0; let n = b
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++ }
  return `${n.toFixed(2)} ${u[i]}`
}

function fmtUptime(s: number) {
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export default function HealthPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const fetch = async () => {
    try {
      const res = await saHealth.get()
      setData(res.health)
    } catch (e: any) { console.error(e) } finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])
  useEffect(() => {
    if (!autoRefresh) return
    const i = setInterval(fetch, 5000)
    return () => clearInterval(i)
  }, [autoRefresh])

  if (loading) return <div className="p-12 flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-500" /></div>
  if (!data) return null

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Health del sistema</h1>
          <p className="text-sm text-slate-400 mt-0.5">Node {data.node} · {fmtUptime(data.uptime)} de uptime</p>
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/10 text-xs text-slate-300 cursor-pointer">
            <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} className="accent-blue-500" />
            Auto-refresh 5s
          </label>
          <button onClick={fetch} className="px-3 py-2 rounded-lg bg-white/[0.02] border border-white/10 hover:bg-white/5 text-xs text-slate-300 flex items-center gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refrescar
          </button>
        </div>
      </div>

      {/* DB */}
      <Section icon={Database} title="Base de datos" status={data.db.status === "connected" ? "ok" : "fail"}>
        <Grid>
          <Field label="Status" value={data.db.status} highlight={data.db.status === "connected"} />
          <Field label="DB" value={data.db.name} />
          <Field label="Colecciones" value={data.db.collections} />
          <Field label="Data size" value={fmtBytes(data.db.dataSize)} />
          <Field label="Storage size" value={fmtBytes(data.db.storageSize)} />
        </Grid>
      </Section>

      {/* Uploads */}
      <Section icon={HardDrive} title="Almacenamiento (uploads/)" status="info">
        <Grid>
          <Field label="Total" value={`${data.uploads.mb} MB`} />
          <Field label="Bytes" value={fmtBytes(data.uploads.bytes)} />
        </Grid>
      </Section>

      {/* Pagos */}
      <Section icon={CreditCard} title="Pagos pendientes / fallidos"
        status={data.pagos.failed > 0 ? "fail" : data.pagos.pending > 0 ? "warn" : "ok"}>
        <Grid>
          <Field label="Pending" value={data.pagos.pending} highlight={data.pagos.pending === 0} warn={data.pagos.pending > 0} />
          <Field label="Failed" value={data.pagos.failed} highlight={data.pagos.failed === 0} fail={data.pagos.failed > 0} />
        </Grid>
      </Section>

      {/* Memoria + uptime */}
      <Section icon={Cpu} title="Proceso Node" status="info">
        <Grid>
          <Field label="RSS" value={fmtBytes(data.memory.rss)} />
          <Field label="Heap used" value={fmtBytes(data.memory.heapUsed)} />
          <Field label="Heap total" value={fmtBytes(data.memory.heapTotal)} />
          <Field label="External" value={fmtBytes(data.memory.external)} />
          <Field label="Uptime" value={fmtUptime(data.uptime)} />
          <Field label="Node" value={data.node} />
        </Grid>
      </Section>
    </div>
  )
}

function Section({ icon: Icon, title, status, children }: any) {
  const dot = status === "ok" ? "bg-emerald-400" : status === "warn" ? "bg-amber-400" : status === "fail" ? "bg-red-400" : "bg-blue-400"
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-400" />
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <span className={`h-1.5 w-1.5 rounded-full ${dot} ml-auto`} />
      </div>
      {children}
    </div>
  )
}

function Grid({ children }: any) {
  return <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{children}</div>
}

function Field({ label, value, highlight, warn, fail }: any) {
  return (
    <div className="rounded-lg bg-black/30 border border-white/5 p-3">
      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={`text-base font-semibold mt-0.5 ${
        fail ? "text-red-400" : warn ? "text-amber-400" : highlight ? "text-emerald-400" : "text-white"
      }`}>{value}</p>
    </div>
  )
}
