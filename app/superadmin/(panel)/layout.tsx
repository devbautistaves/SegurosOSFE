"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  Shield, LayoutDashboard, Building2, CreditCard, MessageSquare,
  ScrollText, Activity, Settings, Search, LogOut, Command, AlertTriangle,
  X,
} from "lucide-react"
import { saAuth, saSearch } from "@/lib/superadmin-api"

const NAV = [
  { href: "/superadmin",             label: "Dashboard",     icon: LayoutDashboard, shortcut: "g d" },
  { href: "/superadmin/aseguradoras", label: "Aseguradoras",  icon: Building2,       shortcut: "g a" },
  { href: "/superadmin/pagos",        label: "Pagos",         icon: CreditCard,      shortcut: "g p" },
  { href: "/superadmin/comunicacion", label: "Comunicación",  icon: MessageSquare,   shortcut: "g c" },
  { href: "/superadmin/audit-log",    label: "Audit log",     icon: ScrollText,      shortcut: "g l" },
  { href: "/superadmin/health",       label: "Health",        icon: Activity,        shortcut: "g h" },
  { href: "/superadmin/config",       label: "Config",        icon: Settings,        shortcut: "g s" },
]

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [cmdQuery, setCmdQuery] = useState("")
  const [cmdResults, setCmdResults] = useState<any[]>([])
  const [keyChain, setKeyChain] = useState("")

  useEffect(() => {
    const t = localStorage.getItem("superadmin_token")
    const u = localStorage.getItem("superadmin_user")
    if (!t || !u) {
      router.replace("/superadmin/login")
      return
    }
    setUser(JSON.parse(u))
  }, [router])

  // Cmd+K + atajos g+letra
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCmdOpen(o => !o)
        return
      }
      if (e.key === "Escape") { setCmdOpen(false); setKeyChain(""); return }
      if (cmdOpen) return

      // Ignorar si está en un input
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return

      if (e.key === "g") {
        setKeyChain("g")
        setTimeout(() => setKeyChain(""), 1500)
        return
      }
      if (keyChain === "g") {
        const target = NAV.find(n => n.shortcut === `g ${e.key}`)
        if (target) {
          router.push(target.href)
          setKeyChain("")
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [cmdOpen, keyChain, router])

  // Search en el command palette
  useEffect(() => {
    if (!cmdOpen || cmdQuery.length < 2) { setCmdResults([]); return }
    const t = setTimeout(async () => {
      try {
        const res = await saSearch.query(cmdQuery)
        setCmdResults(res.results)
      } catch {}
    }, 200)
    return () => clearTimeout(t)
  }, [cmdQuery, cmdOpen])

  const logout = useCallback(async () => {
    try { await saAuth.logout() } catch {}
    localStorage.removeItem("superadmin_token")
    localStorage.removeItem("superadmin_user")
    router.replace("/superadmin/login")
  }, [router])

  const goToResult = (r: any) => {
    setCmdOpen(false)
    setCmdQuery("")
    if (r.type === "aseguradora") router.push(`/superadmin/aseguradoras/${r.id}`)
    if (r.type === "user") router.push(`/superadmin/aseguradoras?search=${encodeURIComponent(r.label)}`)
  }

  if (!user) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-slate-400 text-sm">Cargando...</div>

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-black/40 backdrop-blur flex flex-col">
        <div className="p-5 border-b border-white/10">
          <Link href="/superadmin" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/30">
              <Shield className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <div className="text-[9px] font-bold tracking-[0.25em] text-red-400">SEGUROS</div>
              <div className="text-sm font-black tracking-wider">SUPERADMIN</div>
            </div>
          </Link>
        </div>

        {/* Quick search button */}
        <button
          onClick={() => setCmdOpen(true)}
          className="m-3 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2 text-xs text-slate-400 transition-colors"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 text-left">Buscar...</span>
          <kbd className="text-[10px] font-mono bg-white/10 px-1.5 py-0.5 rounded">⌘K</kbd>
        </button>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map(n => {
            const active = pathname === n.href || (n.href !== "/superadmin" && pathname.startsWith(n.href))
            return (
              <Link key={n.href} href={n.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors group ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <n.icon className="h-4 w-4" />
                <span className="flex-1">{n.label}</span>
                <kbd className="text-[9px] font-mono text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">{n.shortcut}</kbd>
              </Link>
            )
          })}
        </nav>

        {/* Footer / user */}
        <div className="p-3 border-t border-white/10">
          <div className="px-3 py-2 rounded-lg bg-white/5 mb-2">
            <p className="text-xs font-medium text-white truncate">{user.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            <p className="text-[10px] text-red-400 font-medium mt-0.5 uppercase tracking-wider">{user.role}</p>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <LogOut className="h-3.5 w-3.5" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Hint del key chain */}
      {keyChain && (
        <div className="fixed bottom-4 right-4 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-xs text-white backdrop-blur font-mono">
          {keyChain} + ...
        </div>
      )}

      {/* Command Palette */}
      {cmdOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4" onClick={() => setCmdOpen(false)}>
          <div className="w-full max-w-xl rounded-xl bg-[#1a1a1a] border border-white/10 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                autoFocus
                value={cmdQuery}
                onChange={e => setCmdQuery(e.target.value)}
                placeholder="Buscar aseguradora, usuario, email..."
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              <button onClick={() => setCmdOpen(false)} className="text-slate-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto">
              {cmdResults.length === 0 && cmdQuery.length >= 2 && (
                <p className="text-center text-xs text-slate-500 py-8">Sin resultados</p>
              )}
              {cmdResults.length === 0 && cmdQuery.length < 2 && (
                <div className="p-3 space-y-0.5">
                  {NAV.map(n => (
                    <button key={n.href} onClick={() => { router.push(n.href); setCmdOpen(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-left text-sm text-slate-300">
                      <n.icon className="h-4 w-4 text-slate-500" />
                      <span className="flex-1">{n.label}</span>
                      <kbd className="text-[10px] font-mono text-slate-600">{n.shortcut}</kbd>
                    </button>
                  ))}
                </div>
              )}
              {cmdResults.map((r: any, i: number) => (
                <button key={`${r.type}-${r.id}-${i}`} onClick={() => goToResult(r)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-left border-b border-white/5">
                  <div className={`h-7 w-7 rounded-md flex items-center justify-center text-[10px] font-bold ${
                    r.type === "aseguradora" ? "bg-blue-500/20 text-blue-300" : "bg-purple-500/20 text-purple-300"
                  }`}>
                    {r.type === "aseguradora" ? "AS" : "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{r.label}</p>
                    <p className="text-[11px] text-slate-500 truncate">{r.sub}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="px-4 py-2 border-t border-white/10 bg-black/40 flex items-center gap-4 text-[10px] text-slate-500 font-mono">
              <span>↑↓ navegar</span>
              <span>↵ abrir</span>
              <span>ESC cerrar</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
