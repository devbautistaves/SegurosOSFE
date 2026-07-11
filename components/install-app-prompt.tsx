"use client"

import { useEffect, useState } from "react"
import { Download, X, Smartphone, Share, Plus, MoreVertical, MessageCircle, ChevronUp } from "lucide-react"
import { authAPI } from "@/lib/api"

const STORAGE_KEY = "segurosos_install_dismissed_at"
const DOCK_KEY = "segurosos_dock_collapsed"
const REMIND_AFTER_MS = 1000 * 60 * 60 * 24 * 7 // 7 días
const WA_NUMBER = "5491135767915"
const waLink = (negocio?: string) =>
  `https://wa.me/${WA_NUMBER}?text=` +
  encodeURIComponent(`Hola${negocio ? `, soy ${negocio}` : ""}, necesito soporte con SegurOS`)

interface BIPEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallAppPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null)
  const [open, setOpen] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [canInstall, setCanInstall] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [waUrl, setWaUrl] = useState(waLink())

  useEffect(() => {
    if (typeof window === "undefined") return
    setMounted(true)
    const dockCollapsed = localStorage.getItem(DOCK_KEY) === "1"
    setCollapsed(dockCollapsed)

    const standalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true
    if (standalone) return // instalada: no ofrecer instalar (el soporte sí sigue visible)
    setCanInstall(true)

    const ua = window.navigator.userAgent || ""
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream
    setIsIOS(ios)

    const cooldownActive = () => {
      const d = Number(localStorage.getItem(STORAGE_KEY) || 0)
      return !!d && Date.now() - d < REMIND_AFTER_MS
    }

    const onBip = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BIPEvent)
      if (!cooldownActive() && !dockCollapsed) setTimeout(() => setOpen(true), 2000)
    }
    window.addEventListener("beforeinstallprompt", onBip)
    if (ios && !cooldownActive() && !dockCollapsed) setTimeout(() => setOpen(true), 2000)

    const onManual = () => setOpen(true)
    window.addEventListener("open-install-prompt", onManual)

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip)
      window.removeEventListener("open-install-prompt", onManual)
    }
  }, [])

  // Mensaje de soporte con el nombre del negocio registrado.
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return
    authAPI.me(token)
      .then((r: any) => setWaUrl(waLink(r?.aseguradora?.nombre?.trim()))
      )
      .catch(() => {})
  }, [])

  const install = async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    localStorage.setItem(STORAGE_KEY, String(Date.now()))
    setOpen(false); setDeferred(null)
  }
  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()))
    setOpen(false)
  }
  const collapse = () => { setCollapsed(true); localStorage.setItem(DOCK_KEY, "1") }
  const expand = () => { setCollapsed(false); localStorage.removeItem(DOCK_KEY) }

  if (!mounted) return null

  return (
    <>
      {/* ── Dock flotante (Soporte + Instalar), colapsable ── */}
      {collapsed ? (
        <button onClick={expand} aria-label="Mostrar accesos rápidos"
          className="fixed bottom-4 right-4 z-50 grid h-11 w-11 place-items-center rounded-full bg-slate-800/90 text-white shadow-lg backdrop-blur hover:bg-slate-700 active:scale-95 transition">
          <ChevronUp className="h-5 w-5" />
        </button>
      ) : (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
          <button onClick={collapse} aria-label="Ocultar accesos rápidos"
            className="flex items-center gap-1 rounded-full bg-slate-800/80 px-2.5 py-1 text-[11px] font-medium text-white/90 shadow backdrop-blur hover:bg-slate-700">
            <X className="h-3 w-3" /> Ocultar
          </button>
          <a href={waUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-600/30 hover:bg-green-700 active:scale-95 transition">
            <MessageCircle className="h-4 w-4" /> Soporte técnico
          </a>
          {canInstall && (
            <button onClick={() => setOpen(true)} aria-label="Instalar app"
              className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition">
              <Download className="h-4 w-4" /> Instalar app
            </button>
          )}
        </div>
      )}

      {/* ── Modal de instalación ── */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
            <button onClick={dismiss} className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Cerrar">
              <X className="h-4 w-4" />
            </button>
            <div className="bg-blue-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                  <Smartphone className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider opacity-80">SegurOS</p>
                  <h2 className="text-xl font-bold">Instalá la app</h2>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Tené SegurOS siempre a mano en tu celular o computadora. Funciona como app nativa.
              </p>
              {isIOS ? (
                <div className="space-y-3 rounded-lg border bg-slate-50 p-4">
                  <p className="text-sm font-medium">En iPhone / iPad:</p>
                  <ol className="space-y-2 text-sm text-slate-600">
                    <li className="flex gap-2 items-start"><span className="font-bold text-blue-600">1.</span><span>Tocá <Share className="inline h-4 w-4 mx-1" /> <strong>Compartir</strong> en Safari.</span></li>
                    <li className="flex gap-2 items-start"><span className="font-bold text-blue-600">2.</span><span><Plus className="inline h-4 w-4 mx-1" /> <strong>"Agregar a pantalla de inicio"</strong>.</span></li>
                    <li className="flex gap-2 items-start"><span className="font-bold text-blue-600">3.</span><span>Tocá <strong>"Agregar"</strong>.</span></li>
                  </ol>
                  <button onClick={dismiss} className="w-full h-10 rounded-md bg-blue-600 text-white font-semibold">Entendido</button>
                </div>
              ) : deferred ? (
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={dismiss} className="h-10 rounded-md border border-slate-300 text-sm font-medium">Más tarde</button>
                  <button onClick={install} className="h-10 rounded-md bg-blue-600 text-white font-semibold flex items-center justify-center gap-2">
                    <Download className="h-4 w-4" /> Instalar
                  </button>
                </div>
              ) : (
                <div className="space-y-3 rounded-lg border bg-slate-50 p-4">
                  <p className="text-sm font-medium">En Android (Chrome):</p>
                  <ol className="space-y-2 text-sm text-slate-600">
                    <li className="flex gap-2 items-start"><span className="font-bold text-blue-600">1.</span><span>Abrí el menú <MoreVertical className="inline h-4 w-4 mx-1" /> (3 puntitos) arriba a la derecha.</span></li>
                    <li className="flex gap-2 items-start"><span className="font-bold text-blue-600">2.</span><span>Tocá <strong>"Instalar app"</strong> o <strong>"Agregar a pantalla de inicio"</strong>.</span></li>
                    <li className="flex gap-2 items-start"><span className="font-bold text-blue-600">3.</span><span>Confirmá <strong>"Instalar"</strong>.</span></li>
                  </ol>
                  <button onClick={dismiss} className="w-full h-10 rounded-md bg-blue-600 text-white font-semibold">Entendido</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
