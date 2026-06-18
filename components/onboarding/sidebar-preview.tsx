"use client"

// Mini replica del Sidebar real para usar como live preview en el wizard de
// onboarding. NO importa Sidebar real porque ese tiene router/links activos.
// Reacciona a las props {logo, nombre, colorPrimario} y se actualiza al toque.

import { LayoutDashboard, FileText, CreditCard, AlertTriangle, Activity, Palette, Bell, Crown } from "lucide-react"

interface SidebarPreviewProps {
  logo?: string
  nombre?: string
  colorPrimario?: string
  // Cuál link mostrar como activo (default Dashboard)
  activeIndex?: number
}

const LINKS = [
  { label: "Dashboard",     icon: LayoutDashboard },
  { label: "Pólizas",       icon: FileText },
  { label: "Cobranzas",     icon: CreditCard },
  { label: "Siniestros",    icon: AlertTriangle },
  { label: "Seguimiento",   icon: Activity },
  { label: "Personalizar",  icon: Palette },
  { label: "Notificaciones",icon: Bell },
  { label: "Suscripción",   icon: Crown },
]

export function SidebarPreview({ logo, nombre, colorPrimario, activeIndex = 0 }: SidebarPreviewProps) {
  const bg = colorPrimario || "#0f172a"
  const displayNombre = (nombre || "").trim() || "Tu broker"
  return (
    <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10 w-56 select-none pointer-events-none">
      <div style={{ background: bg }} className="text-white text-xs">
        {/* Brand */}
        <div className="flex items-center gap-2 px-3 py-3 border-b border-white/10">
          {logo ? (
            <div className="h-8 w-8 rounded-md bg-white p-0.5 flex items-center justify-center flex-shrink-0">
              <img src={logo} alt={displayNombre} className="max-h-full max-w-full object-contain" />
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/icons/seguros-512.png" alt="SegurOS" className="h-8 w-8 object-contain flex-shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-[11px] font-bold leading-none truncate">{displayNombre}</p>
            <p className="text-[9px] text-blue-300 mt-0.5 truncate">Powered by SegurOS</p>
          </div>
        </div>

        {/* Links */}
        <nav className="px-2 py-2 space-y-0.5">
          {LINKS.map((l, i) => {
            const active = i === activeIndex
            return (
              <div key={l.label} className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${active ? "bg-white/15 text-white" : "text-white/60"}`}>
                <l.icon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="text-[11px]">{l.label}</span>
              </div>
            )
          })}
        </nav>

        {/* Footer mock */}
        <div className="px-3 py-2 mt-2 border-t border-white/10">
          <p className="text-[9px] text-white/40">v1.0 · {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  )
}
