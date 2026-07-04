"use client"

// Popup del tope de PRUEBA por documento. Escucha el evento global
// "trial-limit-reached" emitido por lib/api.ts al recibir 402 code TRIAL_LIMIT.
import { useEffect, useState } from "react"
import { Lock, Check } from "lucide-react"

const COLOR = "#1e40af"
const BENEFITS = ["Pólizas y clientes ilimitados", "Cotizador multi-compañía", "Cobranzas y avisos por WhatsApp"]
const sub = (n: number) => `Cargaste las ${n} pólizas incluidas en tu versión gratuita.`

export function TrialLimitPopup() {
  const [open, setOpen] = useState(false)
  const [limite, setLimite] = useState<number>(0)
  const [url, setUrl] = useState<string>("/admin/suscripcion")
  useEffect(() => {
    const h = (e: any) => { setLimite(e.detail?.limite ?? 0); setUrl(e.detail?.upgradeUrl || "/admin/suscripcion"); setOpen(true) }
    window.addEventListener("trial-limit-reached", h)
    return () => window.removeEventListener("trial-limit-reached", h)
  }, [])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,.5)" }} role="dialog" aria-modal="true">
      <div className="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 pt-6 pb-5 text-center" style={{ background: COLOR }}>
          <div className="mx-auto mb-2.5 flex items-center justify-center rounded-full" style={{ width: 52, height: 52, background: "rgba(255,255,255,.22)" }}>
            <Lock className="h-6 w-6 text-white" />
          </div>
          <p className="text-white text-lg font-semibold">Alcanzaste el límite de tu prueba</p>
          <p className="text-white/85 text-sm mt-1.5">{sub(limite)}</p>
        </div>
        <div className="px-6 pt-5 pb-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full" style={{ width: "100%", background: COLOR }} /></div>
            <span className="text-xs font-semibold whitespace-nowrap" style={{ color: COLOR }}>{limite}/{limite}</span>
          </div>
          <p className="text-sm font-semibold text-slate-600 mb-3">Activá tu cuenta y desbloqueá:</p>
          <ul className="space-y-2.5 mb-5">
            {BENEFITS.map((f) => (<li key={f} className="flex items-center gap-2.5 text-sm text-slate-800"><Check className="h-4 w-4 text-green-600 flex-shrink-0" /> {f}</li>))}
          </ul>
          <a href={url} onClick={() => setOpen(false)} className="block w-full py-3 rounded-xl text-white text-center text-[15px] font-semibold hover:opacity-90 transition-opacity" style={{ background: COLOR }}>Activar mi cuenta ahora</a>
          <button onClick={() => setOpen(false)} className="mt-2.5 w-full text-center text-xs text-slate-400 hover:text-slate-600">Seguí viendo tus datos · Ahora no</button>
        </div>
      </div>
    </div>
  )
}
