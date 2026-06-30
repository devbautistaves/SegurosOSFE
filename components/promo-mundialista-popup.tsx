"use client"
import { useEffect, useState } from "react"

const POPUP_KEY = "promo_mundialista_2026_seen"

export function PromoMundialistaPopup() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (localStorage.getItem(POPUP_KEY)) return
    const token = localStorage.getItem("token")
    if (!token) return
    fetch("/api/proxy/suscripcion/estado", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(j => { if (j?.planCodigo === "TRIAL") setVisible(true) })
      .catch(() => {})
  }, [])

  const cerrar = () => { localStorage.setItem(POPUP_KEY, "1"); setVisible(false) }

  if (!visible) return null

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.72)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "#fff", borderRadius: 16, maxWidth: 420, width: "100%", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ background: "linear-gradient(135deg, #74ACDF 0%, #4A90C4 50%, #2563A8 100%)", padding: "1.25rem 1.5rem 1rem", textAlign: "center", borderBottom: "3px solid #F6C500" }}>
          <div style={{ fontSize: 22, fontWeight: 600, color: "#fff", marginBottom: 2 }}>PROMO MUNDIALISTA</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", letterSpacing: 1, textTransform: "uppercase", fontWeight: 500 }}>⚽ Últimos cupos disponibles</div>
        </div>
        <div style={{ padding: "1.5rem 1.5rem 0.75rem", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#555", marginBottom: "1rem", lineHeight: 1.5 }}>
            Estás probando la app en modo trial.<br />Aprovechá esta oferta exclusiva y suscribite hoy.
          </div>
          <div style={{ background: "#F0F9FF", border: "1.5px solid #74ACDF", borderRadius: 12, padding: "1rem 1.5rem", marginBottom: "1rem", display: "inline-block", minWidth: 220 }}>
            <div style={{ fontSize: 12, color: "#2563A8", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Plan completo</div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4 }}>
              <span style={{ fontSize: 14, color: "#74ACDF", fontWeight: 500 }}>$</span>
              <span style={{ fontSize: 42, fontWeight: 600, color: "#1e3a5f", lineHeight: 1 }}>25.000</span>
              <span style={{ fontSize: 13, color: "#74ACDF", alignSelf: "flex-end", paddingBottom: 6 }}>/mes</span>
            </div>
            <div style={{ fontSize: 11, color: "#74ACDF", marginTop: 2, textDecoration: "line-through", opacity: 0.8 }}>antes $38.000/mes</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: "1.25rem", textAlign: "left", padding: "0 0.25rem" }}>
            {["Acceso a todas las funciones", "Sin límite de clientes", "Soporte prioritario"].map(b => (
              <div key={b} style={{ fontSize: 13, color: "#555", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#2563A8", fontSize: 15 }}>✓</span> {b}
              </div>
            ))}
          </div>
          <a href="/admin/suscripcion" onClick={cerrar} style={{ display: "block", width: "100%", padding: 14, background: "#2563A8", color: "#fff", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", textDecoration: "none", textAlign: "center", letterSpacing: 0.3 }}>
            ACTIVAR PROMO AHORA ⚽
          </a>
          <button onClick={cerrar} style={{ marginTop: 10, width: "100%", padding: 10, background: "transparent", color: "#aaa", border: "none", fontSize: 12, cursor: "pointer" }}>
            Ahora no, seguir con el trial
          </button>
        </div>
        <div style={{ background: "#F6C500", padding: 6, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#1e3a5f", fontWeight: 500, letterSpacing: 0.5 }}>
            🏆 Argentina Campeón • Vos campeón de tu negocio 🏆
          </div>
        </div>
      </div>
    </div>
  )
}
