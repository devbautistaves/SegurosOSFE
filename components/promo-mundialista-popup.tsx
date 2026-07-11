"use client"
// Popup configurable desde el SuperAdmin Flota. Lee el popup ACTIVO de esta app
// desde el endpoint público del FlotaBE y lo muestra según su "target"
// (todos / trial / vencido). Dedup por id del popup (un popup nuevo vuelve a
// mostrarse). Gestionado en admin.tusventas.com.ar → Popups.
import { useEffect, useState } from "react"

const FLOTA_URL = "https://admin.tusventas.com.ar"
const APP = "segurosos"
const TOKEN_KEY = "token"

export function PromoMundialistaPopup() {
  const [p, setP] = useState<any | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    let cancel = false
    ;(async () => {
      try {
        const r = await fetch(`${FLOTA_URL}/api/popup-publico/${APP}`)
        const d = r.ok ? await r.json() : null
        const pop = d?.popup
        if (!pop || !pop._id) return
        if (localStorage.getItem(`popup_seen_${pop._id}`)) return
        if (pop.target === "trial" || pop.target === "vencido") {
          const token = localStorage.getItem(TOKEN_KEY)
          if (!token) return
          const rr = await fetch("/api/proxy/suscripcion/estado", { headers: { Authorization: `Bearer ${token}` } })
          const j = rr.ok ? await rr.json() : null
          const code = j?.planCodigo
          if (pop.target === "trial" && code !== "TRIAL") return
          if (pop.target === "vencido" && code !== "VENCIDO") return
        }
        if (!cancel) setP(pop)
      } catch { /* noop */ }
    })()
    return () => { cancel = true }
  }, [])

  const cerrar = () => { if (p?._id) localStorage.setItem(`popup_seen_${p._id}`, "1"); setP(null) }
  if (!p) return null
  const color = p.color || "#2563A8"

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.72)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "#fff", borderRadius: 16, maxWidth: 420, width: "100%", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ background: color, padding: "1.25rem 1.5rem", textAlign: "center", color: "#fff" }}>
          {p.imagenUrl ? <img src={p.imagenUrl} alt="" style={{ maxHeight: 48, maxWidth: 200, margin: "0 auto 8px", display: "block" }} /> : null}
          <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>{p.titulo}</div>
          {p.subtitulo ? <div style={{ fontSize: 13, opacity: 0.9, marginTop: 3 }}>{p.subtitulo}</div> : null}
        </div>
        <div style={{ padding: "1.5rem", textAlign: "center" }}>
          {p.cuerpo ? <div style={{ fontSize: 14, color: "#555", lineHeight: 1.6, marginBottom: p.precio ? "1rem" : "1.25rem", whiteSpace: "pre-line" }}>{p.cuerpo}</div> : null}
          {p.precio ? <div style={{ fontSize: 38, fontWeight: 700, color, margin: "0 0 1.25rem" }}>{p.precio}</div> : null}
          {p.ctaTexto ? <a href={p.ctaUrl || "#"} onClick={cerrar} style={{ display: "block", width: "100%", padding: 14, background: color, color: "#fff", borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: "none", textAlign: "center", boxSizing: "border-box" }}>{p.ctaTexto}</a> : null}
          <button onClick={cerrar} style={{ marginTop: 12, background: "none", border: "none", color: "#999", fontSize: 13, cursor: "pointer" }}>Ahora no</button>
        </div>
      </div>
    </div>
  )
}
