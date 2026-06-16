"use client"

// Legajo público del asegurado — la comparte el PAS por link/QR con su cliente.
// Diseño "cédula del asegurado": tapa institucional verde (feel de documento),
// credenciales por vehículo con patente MERCOSUR como signature, bloque de
// emergencia, bloque "Cómo pagar" (alias/CBU/link que carga el PAS) y cuotas
// con subida de comprobante. Iconos SVG inline (sin CDN). Identidad propia,
// distinta a CobrOS, para que el PAS la sienta como su pieza.

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { legajoAseguradoAPI, LegajoPublico, LegajoCobranza, LegajoPago } from "@/lib/api"

const moneyAR = (n?: number | null) => (n == null ? "" : "$" + Number(n).toLocaleString("es-AR"))
const dateAR = (d?: string | null, long = false) =>
  d ? new Date(d).toLocaleDateString("es-AR", long
    ? { day: "2-digit", month: "long", year: "numeric" }
    : { day: "2-digit", month: "2-digit", year: "2-digit" }) : ""

const RAMOS_VEHICULO = ["AUTOS", "MOTOS", "REMISES", "TRANSPORTE_CARGAS", "FLOTA_AUTOMOTOR"]
const labelRamo = (r?: string) => (r || "").replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
const labelCompania = (c?: string) => (c || "").replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
const firstName = (s?: string) => (s || "").trim().split(/\s+/)[0] || ""

// ── Iconos SVG inline (stroke = currentColor) ─────────────────────────────────
const P: Record<string, React.ReactNode> = {
  shield: <><path d="M12 3l7 3v5c0 4.2-2.8 7.4-7 9-4.2-1.6-7-4.8-7-9V6l7-3z" /><path d="M9.2 12l2 2 3.6-4" /></>,
  car: <><path d="M5 11l1.5-4.2A2 2 0 0 1 8.4 5.5h7.2a2 2 0 0 1 1.9 1.3L19 11" /><path d="M4 11h16v5H4z" /><circle cx="7.5" cy="16.5" r="1.4" /><circle cx="16.5" cy="16.5" r="1.4" /></>,
  motorbike: <><circle cx="5.5" cy="16.5" r="2.6" /><circle cx="18.5" cy="16.5" r="2.6" /><path d="M8 16.5h6l3-5h-4l-2-3H8" /><path d="M14 8.5h3" /></>,
  truck: <><path d="M3 7h11v9H3z" /><path d="M14 10h4l3 3v3h-7z" /><circle cx="7" cy="17" r="1.6" /><circle cx="17.5" cy="17" r="1.6" /></>,
  home: <><path d="M4 11l8-6 8 6" /><path d="M6 10v9h12v-9" /></>,
  heart: <path d="M12 20s-7-4.4-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.7C19 15.6 12 20 12 20z" />,
  store: <><path d="M4 9l1-4h14l1 4" /><path d="M5 9v10h14V9" /><path d="M9 19v-5h6v5" /></>,
  receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6" /></>,
  phone: <path d="M6.5 4h-1A2 2 0 0 0 3.5 6 16 16 0 0 0 18 20.5a2 2 0 0 0 2-2v-1.2c0-.6-.4-1.1-1-1.3l-3-.9c-.6-.2-1.2 0-1.6.5l-.8 1.1a12 12 0 0 1-4.6-4.6l1.1-.8c.5-.4.7-1 .5-1.6l-.9-3c-.2-.6-.7-1-1.3-1z" />,
  whatsapp: <path d="M12 4a8 8 0 0 0-6.9 12L4 20l4.2-1.1A8 8 0 1 0 12 4zm0 2a6 6 0 1 1-3.2 11l-.3-.2-2 .5.5-1.9-.2-.3A6 6 0 0 1 12 6zm-2 3c-.2 0-.5.1-.7.4-.3.3-.8.8-.8 1.9s.8 2.2.9 2.4c.2.2 1.6 2.5 4 3.4 1.9.7 2.3.6 2.7.5.4 0 1.3-.5 1.5-1.1.2-.5.2-1 .1-1.1l-.6-.3-1.5-.7c-.2 0-.4-.1-.5.1l-.7.9c-.1.1-.3.2-.5.1-.7-.3-1.4-.6-2.1-1.5-.2-.3 0-.4.1-.6l.4-.5c.1-.2.1-.3 0-.5l-.7-1.6c-.1-.3-.3-.3-.4-.3h-.5z" />,
  copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h8" /></>,
  check: <path d="M5 12.5l4 4 10-10" />,
  card: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /></>,
  bank: <><path d="M4 9l8-5 8 5" /><path d="M5 9v9h14V9" /><path d="M9 18v-6M12 18v-6M15 18v-6" /></>,
  alert: <><path d="M12 4l9 16H3z" /><path d="M12 10v4M12 17v.5" /></>,
  world: <><circle cx="12" cy="12" r="8" /><path d="M4 12h16M12 4c2.5 2 2.5 14 0 16M12 4c-2.5 2-2.5 14 0 16" /></>,
  mobile: <><rect x="7" y="3" width="10" height="18" rx="2" /><path d="M11 18h2" /></>,
  camera: <><path d="M4 8h3l1.5-2h7L17 8h3v11H4z" /><circle cx="12" cy="13" r="3.2" /></>,
  folderx: <><path d="M4 7a2 2 0 0 1 2-2h3l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" /><path d="M10 11l4 4M14 11l-4 4" /></>,
  arrow: <path d="M12 5v14M6 13l6 6 6-6" />,
}
function Ic({ n, s = 20, w = 1.7 }: { n: string; s?: number; w?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0 }}>
      {P[n] || P.shield}
    </svg>
  )
}
const iconRamo = (r?: string) => {
  if (!r) return "shield"
  if (r.includes("MOTO")) return "motorbike"
  if (r.includes("TRANSPORTE") || r.includes("FLOTA")) return "truck"
  if (r.includes("HOGAR")) return "home"
  if (r.includes("VIDA") || r.includes("ACC")) return "heart"
  if (r.includes("INCEND") || r.includes("COMERC")) return "store"
  if (RAMOS_VEHICULO.some(x => r.includes(x))) return "car"
  return "shield"
}

function estadoChip(p: LegajoPago): { label: string; tone: "ok" | "mora" | "next" | "wait" | "neutral" } {
  if (p.estado === "COBRADA") return { label: "Pagada", tone: "ok" }
  if (p.estado === "COMPROBANTE_RECIBIDO") return { label: "En revisión", tone: "wait" }
  if (p.estado === "CUOTA_VENCIDA") return { label: "Vencida", tone: "mora" }
  if (p.estado === "NO_CORRESPONDE" || p.estado === "ANULADA") return { label: "—", tone: "neutral" }
  return { label: "Por pagar", tone: "next" }
}
const TONES: Record<string, React.CSSProperties> = {
  ok:      { background: "#E2F4ED", color: "#0A5440", border: "1px solid #1C8C6C" },
  mora:    { background: "#FBEAE7", color: "#8C2A18", border: "1px solid #C8503A" },
  next:    { background: "#FBF0DC", color: "#7A4A0C", border: "1px solid #C99526" },
  wait:    { background: "#ECE9F7", color: "#3A2F73", border: "1px solid #6E63C2" },
  neutral: { background: "#EFEDE6", color: "#4A4A45", border: "1px solid #9A9890" },
}

async function fileToDataUrl(file: File): Promise<string> {
  if (file.type === "application/pdf") {
    return new Promise((resolve, reject) => {
      const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.onerror = () => reject(r.error); r.readAsDataURL(file)
    })
  }
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image(); i.onload = () => resolve(i); i.onerror = reject; i.src = URL.createObjectURL(file)
  })
  const MAX = 1200; let w = img.naturalWidth, h = img.naturalHeight
  if (w > MAX || h > MAX) { const k = MAX / Math.max(w, h); w = Math.round(w * k); h = Math.round(h * k) }
  const c = document.createElement("canvas"); c.width = w; c.height = h
  const ctx = c.getContext("2d")!; ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h); ctx.drawImage(img, 0, 0, w, h)
  return c.toDataURL("image/jpeg", 0.82)
}

// Mezcla un color hex con negro para derivar la tapa oscura desde el acento.
function darken(hex: string, amt = 0.62): string {
  const m = /^#?([\da-f]{6})$/i.exec(hex || ""); if (!m) return "#0E2A22"
  const n = parseInt(m[1], 16); const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  const d = (x: number) => Math.round(x * (1 - amt))
  return `rgb(${d(r)},${d(g)},${d(b)})`
}

export default function AseguradoLegajoPage() {
  const { token } = useParams<{ token: string }>()
  const [data, setData] = useState<LegajoPublico | null>(null)
  const [estado, setEstado] = useState<"load" | "ok" | "err">("load")
  const [subiendo, setSubiendo] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ key: string; text: string; tone: "ok" | "err" } | null>(null)
  const [copiado, setCopiado] = useState<string | null>(null)

  useEffect(() => {
    legajoAseguradoAPI.publico(token)
      .then(d => { setData(d); setEstado("ok") })
      .catch(() => setEstado("err"))
  }, [token])

  const accent = data?.productor?.colorPrimario || "#1F6B4F"
  const cover = darken(accent, 0.66)
  const wa = data?.productor?.whatsapp ? String(data.productor.whatsapp).replace(/[^0-9]/g, "") : ""
  const inicial = (data?.productor?.nombre || "P").trim().charAt(0).toUpperCase()
  const companias = useMemo(() => (data?.companias || []).filter(c => c.telefonoAuxilio || c.telefonoSiniestros), [data])
  const pago = data?.productor?.datosCobro || null

  // Próxima acción: la primera cuota impaga de todas las cobranzas.
  const pendiente = useMemo(() => {
    for (const cob of data?.cuentaCorriente || []) {
      const p = cob.pagos.find(x => x.estado === "CUOTA_VENCIDA")
        || cob.pagos.find(x => x.estado !== "COBRADA" && x.estado !== "COMPROBANTE_RECIBIDO" && x.estado !== "NO_CORRESPONDE" && x.estado !== "ANULADA")
      if (p) return { cob, pago: p, vencida: p.estado === "CUOTA_VENCIDA" }
    }
    return null
  }, [data])

  const copiar = (label: string, value: string) => {
    navigator.clipboard?.writeText(value); setCopiado(label); setTimeout(() => setCopiado(null), 1600)
  }

  async function handleUpload(cobranzaId: string, mes: string, file: File) {
    const key = `${cobranzaId}:${mes}`; setSubiendo(key); setMsg(null)
    try {
      const dataUrl = await fileToDataUrl(file)
      await legajoAseguradoAPI.subirComprobante(token, { cobranzaId, mes, dataUrl })
      setMsg({ key, text: "¡Listo! Recibimos tu comprobante. Te avisamos cuando lo confirmemos.", tone: "ok" })
      const d = await legajoAseguradoAPI.publico(token); setData(d)
    } catch (e: any) {
      setMsg({ key, text: e?.message || "No se pudo enviar el comprobante.", tone: "err" })
    } finally { setSubiendo(null) }
  }

  return (
    <main className="leg-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700&family=Manrope:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        .leg-root{ --acc:${accent}; --cover:${cover}; --paper:#FBF8F1; --surf:#FFFFFF; --ink:#13201A; --muted:#5E6B63;
          --line:#E7E2D4; --mora:#C8503A; --gold:#C99526;
          background:var(--paper); color:var(--ink); min-height:100vh;
          font-family:'Manrope',ui-sans-serif,system-ui,sans-serif; -webkit-font-smoothing:antialiased; }
        .leg-mono{ font-family:'IBM Plex Mono',ui-monospace,monospace; font-variant-numeric:tabular-nums; }
        .leg-display{ font-family:'Bricolage Grotesque','Manrope',sans-serif; font-weight:600; letter-spacing:-.015em; }
        .leg-eye{ font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:.2em; text-transform:uppercase; color:var(--muted); }
        /* Tapa institucional */
        .leg-cover{ background:linear-gradient(165deg, var(--acc), var(--cover)); color:#fff; padding:26px 0 86px;
          position:relative; overflow:hidden; }
        .leg-cover::after{ content:""; position:absolute; inset:0; opacity:.10;
          background-image:radial-gradient(circle at 1px 1px, #fff 1px, transparent 0); background-size:22px 22px; }
        .leg-wrap{ max-width:680px; margin:0 auto; padding:0 18px; }
        .leg-card{ background:var(--surf); border:1px solid var(--line); border-radius:16px; box-shadow:0 1px 2px rgba(19,32,26,.04); }
        .leg-sec-t{ display:flex; align-items:center; gap:8px; margin:26px 6px 12px; }
        .leg-cred{ background:var(--surf); border:1px solid var(--line); border-radius:16px; overflow:hidden; }
        .leg-cred-top{ height:5px; background:var(--acc); }
        .leg-patente{ background:#fff; color:#13201A; border:2px solid #13201A; border-radius:7px;
          padding:21px 18px 11px; font-family:'IBM Plex Mono',monospace; font-weight:600; font-size:25px;
          letter-spacing:.2em; display:inline-block; position:relative; line-height:1; box-shadow:0 3px 0 rgba(0,0,0,.08); }
        .leg-patente::before{ content:"ⓂERCOSUR · ARGENTINA"; position:absolute; top:0; left:0; right:0;
          background:#0B3D91; color:#fff; font-size:8.5px; letter-spacing:.18em; text-align:center; padding:3px 6px;
          font-family:'IBM Plex Mono',monospace; border-radius:5px 5px 0 0; }
        .leg-stamp{ font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:.06em; text-transform:uppercase;
          padding:5px 10px; border-radius:6px; display:inline-flex; align-items:center; gap:5px; font-weight:600; }
        .leg-btn{ display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:12px 18px; border-radius:11px;
          font-size:14px; font-weight:600; cursor:pointer; border:1.5px solid transparent; font-family:'Manrope',sans-serif;
          text-decoration:none; transition:transform .08s ease, filter .15s ease; }
        .leg-btn:active{ transform:translateY(1px); }
        .leg-btn-primary{ background:var(--acc); color:#fff; }
        .leg-btn-primary:hover{ filter:brightness(1.06); }
        .leg-btn-ghost{ background:var(--surf); color:var(--ink); border-color:var(--line); }
        .leg-mark{ width:46px; height:46px; border-radius:12px; background:rgba(255,255,255,.16); color:#fff;
          display:flex; align-items:center; justify-content:center; font-family:'Bricolage Grotesque',serif; font-weight:700; font-size:20px; flex-shrink:0; border:1px solid rgba(255,255,255,.25); }
        .leg-iconbox{ width:46px; height:46px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .leg-row{ display:flex; align-items:center; gap:12px; padding:13px 14px; background:var(--paper); border:1px solid var(--line); border-radius:12px; }
        .leg-copy{ background:transparent; border:0; cursor:pointer; color:var(--muted); display:inline-flex; padding:6px; border-radius:8px; }
        .leg-copy:hover{ background:rgba(0,0,0,.04); color:var(--ink); }
        .leg-cuota{ display:flex; gap:12px; align-items:flex-start; padding:15px 16px; border-top:1px solid var(--line); }
        .leg-cuota:first-of-type{ border-top:0; }
        .leg-drop{ background:var(--paper); border:1.5px dashed var(--acc); border-radius:12px; padding:12px 16px; text-align:center; cursor:pointer; display:inline-flex; align-items:center; gap:8px; color:var(--acc); font-weight:600; font-size:13px; }
        .leg-drop input{ display:none; }
        .leg-msg-ok{ background:#E2F4ED; color:#0A5440; border:1px solid #1C8C6C; }
        .leg-msg-err{ background:#FBEAE7; color:#8C2A18; border:1px solid #C8503A; }
        @keyframes legPop{ from{opacity:0; transform:translateY(10px)} to{opacity:1; transform:none} }
        .leg-pop{ animation:legPop .5s cubic-bezier(.2,.7,.2,1) both; }
        @media (prefers-reduced-motion: reduce){ .leg-pop{ animation:none } }
      `}</style>

      {estado === "load" && (
        <div className="leg-cover"><div className="leg-wrap"><p className="leg-eye" style={{ color: "rgba(255,255,255,.8)" }}>Abriendo tu legajo…</p></div></div>
      )}

      {estado === "err" && (
        <div className="leg-wrap">
          <div className="leg-card" style={{ padding: 30, textAlign: "center", marginTop: 90 }}>
            <span style={{ color: "var(--muted)", display: "inline-flex" }}><Ic n="folderx" s={34} /></span>
            <p className="leg-display" style={{ fontSize: 21, margin: "12px 0 4px" }}>No encontramos este legajo</p>
            <p style={{ fontSize: 13.5, color: "var(--muted)" }}>El link puede haber cambiado. Pedile a tu productor uno nuevo.</p>
          </div>
        </div>
      )}

      {estado === "ok" && data && (
        <>
          {/* ── Tapa ── */}
          <div className="leg-cover">
            <div className="leg-wrap">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {data.productor.logo
                  /* eslint-disable-next-line @next/next/no-img-element */
                  ? <img src={data.productor.logo} alt="" style={{ height: 46, width: 46, objectFit: "contain", background: "#fff", borderRadius: 12, padding: 4 }} />
                  : <span className="leg-mark">{inicial}</span>}
                <div>
                  <p className="leg-display" style={{ margin: 0, fontSize: 16, lineHeight: 1.1, color: "#fff" }}>{data.productor.nombre}</p>
                  <p className="leg-eye" style={{ marginTop: 4, color: "rgba(255,255,255,.72)" }}>Productor de seguros</p>
                </div>
              </div>
              <p className="leg-eye" style={{ color: "rgba(255,255,255,.7)", marginTop: 26 }}>Legajo digital</p>
              <p className="leg-display" style={{ margin: "8px 0 0", fontSize: 30, lineHeight: 1.05, color: "#fff" }}>
                Hola, {firstName(data.cliente.nombreApellido) || "—"}
              </p>
              <p style={{ margin: "10px 0 0", fontSize: 14, color: "rgba(255,255,255,.82)", lineHeight: 1.5, maxWidth: 440 }}>
                Acá tenés todo tu seguro en un solo lugar: tus coberturas, los teléfonos para una emergencia y tus cuotas.
              </p>
            </div>
          </div>

          <div className="leg-wrap" style={{ paddingBottom: 90, marginTop: -64 }}>
            {/* ── Próxima acción (si hay cuota impaga) ── */}
            {pendiente && (
              <a href="#cuotas" className="leg-card leg-pop" style={{ display: "block", textDecoration: "none", color: "inherit", padding: 16, marginBottom: 14, borderLeft: `4px solid ${pendiente.vencida ? "var(--mora)" : "var(--gold)"}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                  <span className="leg-iconbox" style={{ background: pendiente.vencida ? "#FBEAE7" : "#FBF0DC", color: pendiente.vencida ? "var(--mora)" : "var(--gold)" }}>
                    <Ic n={pendiente.vencida ? "alert" : "receipt"} s={22} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="leg-display" style={{ margin: 0, fontSize: 15.5 }}>
                      {pendiente.vencida ? "Tenés una cuota vencida" : "Tu próxima cuota"}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--muted)" }}>
                      {pendiente.pago.mesLabel || pendiente.pago.mes}
                      {pendiente.pago.monto != null ? <> · <span className="leg-mono" style={{ fontWeight: 600, color: "var(--ink)" }}>{moneyAR(pendiente.pago.monto)}</span></> : null}
                      {" · tocá para pagar"}
                    </p>
                  </div>
                  <span style={{ color: "var(--muted)" }}><Ic n="arrow" s={18} /></span>
                </div>
              </a>
            )}

            {/* ── Cómo pagar ── */}
            {pago && (
              <section className="leg-card leg-pop" style={{ padding: 18, marginBottom: 14 }}>
                <div className="leg-sec-t" style={{ margin: "0 0 14px" }}>
                  <span style={{ color: "var(--acc)" }}><Ic n="card" s={18} /></span>
                  <p className="leg-display" style={{ margin: 0, fontSize: 15 }}>Cómo pagar</p>
                </div>
                <div style={{ display: "grid", gap: 9 }}>
                  {pago.alias && (
                    <div className="leg-row">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="leg-eye" style={{ marginBottom: 3 }}>Alias</p>
                        <p className="leg-mono" style={{ margin: 0, fontSize: 16, fontWeight: 600, wordBreak: "break-all" }}>{pago.alias}</p>
                      </div>
                      <button className="leg-copy" onClick={() => copiar("alias", pago.alias!)} title="Copiar alias">
                        <Ic n={copiado === "alias" ? "check" : "copy"} s={18} />
                      </button>
                    </div>
                  )}
                  {pago.cbu && (
                    <div className="leg-row">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="leg-eye" style={{ marginBottom: 3 }}>CBU / CVU</p>
                        <p className="leg-mono" style={{ margin: 0, fontSize: 14.5, fontWeight: 600, wordBreak: "break-all" }}>{pago.cbu}</p>
                      </div>
                      <button className="leg-copy" onClick={() => copiar("cbu", pago.cbu!)} title="Copiar CBU">
                        <Ic n={copiado === "cbu" ? "check" : "copy"} s={18} />
                      </button>
                    </div>
                  )}
                  {(pago.titular || pago.banco) && (
                    <p style={{ margin: "2px 2px 0", fontSize: 12.5, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6 }}>
                      <Ic n="bank" s={14} />
                      {[pago.titular, pago.banco].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {pago.linkPago && (
                    <a href={pago.linkPago} target="_blank" rel="noreferrer" className="leg-btn leg-btn-primary" style={{ marginTop: 4 }}>
                      <Ic n="card" s={17} /> Pagar ahora
                    </a>
                  )}
                  {pago.nota && (
                    <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--muted)", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 12px", lineHeight: 1.5 }}>
                      {pago.nota}
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* ── Emergencia ── */}
            {companias.length > 0 && (
              <section className="leg-card leg-pop" style={{ padding: 18, marginBottom: 14 }}>
                <div className="leg-sec-t" style={{ margin: "0 0 4px" }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--mora)", flexShrink: 0 }} />
                  <p className="leg-display" style={{ margin: 0, fontSize: 15 }}>Si te pasa algo, ahora</p>
                </div>
                {companias.map((c, i) => (
                  <div key={i} style={{ padding: "12px 0 4px", borderTop: i === 0 ? 0 : "1px solid var(--line)", marginTop: i === 0 ? 8 : 0 }}>
                    <p className="leg-display" style={{ margin: "0 0 2px", fontSize: 13.5 }}>{labelCompania(c.nombre)}</p>
                    {c.notasDelPAS && <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--muted)", lineHeight: 1.45 }}>{c.notasDelPAS}</p>}
                    <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                      {c.telefonoAuxilio && <TelRow label="Auxilio en ruta" tel={c.telefonoAuxilio} accent={accent} />}
                      {c.telefonoSiniestros && <TelRow label="Tuviste un choque" tel={c.telefonoSiniestros} accent={accent} />}
                      {(c.appUrl || c.sitioWeb) && (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {c.appUrl && <a href={c.appUrl} target="_blank" rel="noreferrer" className="leg-btn leg-btn-ghost" style={{ flex: 1, fontSize: 12.5, padding: "10px 12px" }}><Ic n="mobile" s={15} /> App</a>}
                          {c.sitioWeb && <a href={c.sitioWeb} target="_blank" rel="noreferrer" className="leg-btn leg-btn-ghost" style={{ flex: 1, fontSize: 12.5, padding: "10px 12px" }}><Ic n="world" s={15} /> Sitio web</a>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* ── Coberturas ── */}
            {data.vehiculos.length > 0 && (
              <>
                <div className="leg-sec-t"><span style={{ color: "var(--acc)" }}><Ic n="shield" s={17} /></span><p className="leg-display" style={{ margin: 0, fontSize: 15 }}>Tus coberturas</p></div>
                {data.vehiculos.map(v => {
                  const esVehiculo = !!v.patente && RAMOS_VEHICULO.some(r => (v.ramo || "").includes(r))
                  const vigente = v.estado === "VIGENTE"
                  const tone = vigente ? "ok" : v.estado === "ANULADA" ? "neutral" : "next"
                  return (
                    <div key={v._id} className="leg-cred leg-pop" style={{ marginBottom: 12 }}>
                      <div className="leg-cred-top" />
                      <div style={{ padding: 18 }}>
                        <div style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
                          <span className="leg-iconbox" style={{ background: `color-mix(in srgb, ${accent} 12%, #fff)`, color: accent }}><Ic n={iconRamo(v.ramo)} s={23} /></span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p className="leg-display" style={{ margin: 0, fontSize: 16.5, lineHeight: 1.2 }}>{v.datosRiesgo || labelRamo(v.ramo) || "Cobertura"}</p>
                            <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "var(--muted)" }}>
                              {labelCompania(v.aseguradora)}{v.tipoCobertura ? " · " + v.tipoCobertura : ""}
                            </p>
                          </div>
                          {v.numPoliza && <span className="leg-mono" style={{ fontSize: 10.5, color: "var(--muted)", whiteSpace: "nowrap" }}>N° {v.numPoliza}</span>}
                        </div>
                        {esVehiculo && (
                          <div style={{ textAlign: "center", margin: "18px 0 8px" }}><span className="leg-patente">{v.patente}</span></div>
                        )}
                        <div style={{ marginTop: 16 }}>
                          <span className="leg-stamp" style={TONES[tone]}>
                            {vigente && <Ic n="check" s={13} w={2.4} />}
                            {vigente ? `Vigente · ${dateAR(v.fechaFinVig)}` : v.estado === "ANULADA" ? "Anulada" : `${labelRamo(v.estado) || "—"}${v.fechaFinVig ? " · " + dateAR(v.fechaFinVig) : ""}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </>
            )}

            {/* ── Cuotas ── */}
            {data.cuentaCorriente.length > 0 && (
              <div id="cuotas">
                <div className="leg-sec-t"><span style={{ color: "var(--acc)" }}><Ic n="receipt" s={17} /></span><p className="leg-display" style={{ margin: 0, fontSize: 15 }}>Tus cuotas</p></div>
                {data.cuentaCorriente.map(cob => (
                  <CobranzaCard key={cob._id} cob={cob} accent={accent} onUpload={handleUpload} subiendoKey={subiendo} msg={msg} />
                ))}
              </div>
            )}

            {wa && (
              <div style={{ marginTop: 26, textAlign: "center" }}>
                <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="leg-btn" style={{ background: "#25D366", color: "#fff" }}>
                  <Ic n="whatsapp" s={18} /> Escribirle a {firstName(data.productor.nombre)}
                </a>
              </div>
            )}

            <p style={{ textAlign: "center", margin: "30px 0 4px", fontSize: 11.5, color: "var(--muted)" }}>
              Tu legajo lo lleva <strong>{data.productor.nombre}</strong> con <strong>SegurOS</strong>
            </p>
          </div>
        </>
      )}
    </main>
  )
}

function TelRow({ label, tel, accent }: { label: string; tel: string; accent: string }) {
  return (
    <a href={`tel:${tel.replace(/\s+/g, "")}`} style={{ textDecoration: "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 12, padding: "11px 13px" }}>
        <div>
          <p style={{ margin: 0, fontSize: 10.5, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em" }}>{label}</p>
          <p className="leg-mono" style={{ margin: "2px 0 0", fontSize: 17, fontWeight: 600, color: "var(--ink)" }}>{tel}</p>
        </div>
        <span style={{ color: accent }}><Ic n="phone" s={19} /></span>
      </div>
    </a>
  )
}

function CobranzaCard({
  cob, accent, onUpload, subiendoKey, msg,
}: {
  cob: LegajoCobranza
  accent: string
  onUpload: (cobranzaId: string, mes: string, file: File) => Promise<void>
  subiendoKey: string | null
  msg: { key: string; text: string; tone: "ok" | "err" } | null
}) {
  const proxIdx = cob.pagos.findIndex(p => p.estado !== "COBRADA" && p.estado !== "NO_CORRESPONDE" && p.estado !== "ANULADA")
  const [abierto, setAbierto] = useState(proxIdx >= 0)
  const pagadas = cob.pagos.filter(p => p.estado === "COBRADA").length
  const total = cob.numeroCuotasTotal || cob.pagos.length

  return (
    <div className="leg-card leg-pop" style={{ marginBottom: 12, overflow: "hidden" }}>
      <button onClick={() => setAbierto(v => !v)} style={{ width: "100%", textAlign: "left", padding: "15px 17px", background: "transparent", border: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, color: "inherit" }}>
        <span className="leg-iconbox" style={{ width: 40, height: 40, background: `color-mix(in srgb, ${accent} 12%, #fff)`, color: accent }}><Ic n="receipt" s={19} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="leg-display" style={{ margin: 0, fontSize: 14.5 }}>{labelCompania(cob.aseguradora) || "Cobranza"}{cob.patente ? " · " + cob.patente : ""}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
            <span style={{ position: "relative", width: 64, height: 5, borderRadius: 3, background: "var(--line)", overflow: "hidden", flexShrink: 0 }}>
              <span style={{ position: "absolute", inset: 0, width: `${total ? (pagadas / total) * 100 : 0}%`, background: accent }} />
            </span>
            <span className="leg-eye">{pagadas} de {total} pagadas</span>
          </div>
        </div>
        <span style={{ color: "var(--muted)", transform: abierto ? "rotate(180deg)" : "none", transition: "transform .2s" }}><Ic n="arrow" s={17} /></span>
      </button>

      {abierto && (
        <div style={{ borderTop: "1px solid var(--line)" }}>
          {cob.pagos.map(p => {
            const key = `${cob._id}:${p.mes}`
            const chip = estadoChip(p)
            const canUpload = p.estado !== "COBRADA" && p.estado !== "COMPROBANTE_RECIBIDO" && p.estado !== "ANULADA" && p.estado !== "NO_CORRESPONDE"
            const yaSubio = p.estado === "COMPROBANTE_RECIBIDO"
            const showMsg = msg && msg.key === key
            return (
              <div key={p.mes} className="leg-cuota" style={{ flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <p className="leg-display" style={{ margin: 0, fontSize: 14 }}>{p.mesLabel || p.mes}{p.numeroCuota ? ` · cuota ${p.numeroCuota}` : ""}</p>
                  <div style={{ marginTop: 7, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                    <span className="leg-stamp" style={TONES[chip.tone]}>{chip.label}</span>
                    {p.monto != null && <span className="leg-mono" style={{ fontSize: 14, fontWeight: 600 }}>{moneyAR(p.monto)}</span>}
                  </div>
                  {yaSubio && <p style={{ margin: "9px 0 0", fontSize: 12, color: "var(--muted)" }}>Recibimos tu comprobante el {dateAR(p.comprobante?.subidoEn, true)}. Lo está revisando tu productor.</p>}
                  {p.comprobante?.rechazadoEn && <p style={{ margin: "9px 0 0", fontSize: 12, color: "var(--mora)" }}>Tu comprobante fue rechazado{p.comprobante.rechazoMotivo ? `: ${p.comprobante.rechazoMotivo}` : "."} Probá subir uno nuevo.</p>}
                </div>
                {canUpload && (
                  <label className="leg-drop" style={{ alignSelf: "center" }}>
                    <input type="file" accept="image/*,application/pdf" disabled={subiendoKey === key}
                      onChange={async e => { const f = e.target.files?.[0]; if (f) await onUpload(cob._id, p.mes, f); e.target.value = "" }} />
                    <Ic n="camera" s={18} />
                    {subiendoKey === key ? "Enviando…" : "Subir comprobante"}
                  </label>
                )}
                {showMsg && (
                  <div className={msg.tone === "ok" ? "leg-msg-ok" : "leg-msg-err"} style={{ width: "100%", borderRadius: 10, padding: "9px 13px", fontSize: 12.5 }}>{msg.text}</div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
