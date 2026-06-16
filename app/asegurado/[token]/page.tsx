"use client"

// Landing pública del asegurado — la comparte el PAS por link/QR con su cliente.
// Diseño: "cédula del asegurado". Patente MERCOSUR como signature element,
// bloque "si te pasa algo" arriba con los teléfonos por compañía que el PAS
// configuró, credenciales por vehículo, cuotas con dropzone de comprobante.
// Identidad propia (verde institucional + serif Bricolage + mono Departure)
// distinta a CobrOS para que el PAS la sienta como su pieza, no como template.

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { legajoAseguradoAPI, LegajoPublico, LegajoCobranza, LegajoPago } from "@/lib/api"

const moneyAR = (n?: number | null) => (n == null ? "" : "$" + Number(n).toLocaleString("es-AR"))
const dateAR = (d?: string | null, long = false) =>
  d ? new Date(d).toLocaleDateString("es-AR", long
    ? { day: "2-digit", month: "long", year: "numeric" }
    : { day: "2-digit", month: "2-digit", year: "2-digit" }) : ""

// Sufijos que reconocemos como ramo de vehículo (para mostrar patente).
const RAMOS_VEHICULO = ["AUTOS", "MOTOS", "REMISES", "TRANSPORTE_CARGAS", "FLOTA_AUTOMOTOR"]

const iconRamo = (ramo?: string) => {
  if (!ramo) return "ti-shield"
  if (ramo.includes("MOTO")) return "ti-motorbike"
  if (ramo.includes("TRANSPORTE") || ramo.includes("FLOTA")) return "ti-truck"
  if (ramo.includes("HOGAR")) return "ti-home"
  if (ramo.includes("VIDA") || ramo.includes("ACC")) return "ti-heart"
  if (ramo.includes("INCEND") || ramo.includes("COMERC")) return "ti-building-store"
  return "ti-car"
}

const labelRamo = (r?: string) => (r || "").replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
const labelCompania = (c?: string) => (c || "").replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase())

function estadoChip(p: LegajoPago, hoyDay = new Date().getDate()): { label: string; tone: "ok" | "mora" | "next" | "wait" | "neutral" } {
  if (p.estado === "COBRADA") return { label: "Pagada", tone: "ok" }
  if (p.estado === "COMPROBANTE_RECIBIDO") return { label: "En revisión", tone: "wait" }
  if (p.estado === "CUOTA_VENCIDA") return { label: "Vencida", tone: "mora" }
  if (p.estado === "NO_CORRESPONDE" || p.estado === "ANULADA") return { label: "—", tone: "neutral" }
  return { label: "Por pagar", tone: "next" }
}

// Sello visual con borde + texto en MAYÚSCULAS mono — el "stamp feel".
const StampStyles: Record<string, React.CSSProperties> = {
  ok:      { background: "#E1F5EE", color: "#04342C", border: "1px solid #0F6E56" },
  mora:    { background: "#FCEBEB", color: "#501313", border: "1px solid #A32D2D" },
  next:    { background: "#FAEEDA", color: "#412402", border: "1px solid #854F0B" },
  wait:    { background: "#EFEAF8", color: "#26215C", border: "1px solid #534AB7" },
  neutral: { background: "#F1EFE8", color: "#2C2C2A", border: "1px solid #5F5E5A" },
}

// Lee un File y devuelve un dataUrl JPEG redimensionado a ≤1200px lado mayor,
// calidad 0.82. Si es PDF, lo manda como base64 puro.
async function fileToDataUrl(file: File): Promise<string> {
  if (file.type === "application/pdf") {
    return new Promise((resolve, reject) => {
      const r = new FileReader()
      r.onload = () => resolve(String(r.result))
      r.onerror = () => reject(r.error)
      r.readAsDataURL(file)
    })
  }
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = reject
    i.src = URL.createObjectURL(file)
  })
  const MAX = 1200
  let w = img.naturalWidth, h = img.naturalHeight
  if (w > MAX || h > MAX) { const k = MAX / Math.max(w, h); w = Math.round(w * k); h = Math.round(h * k) }
  const c = document.createElement("canvas"); c.width = w; c.height = h
  const ctx = c.getContext("2d")!; ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h); ctx.drawImage(img, 0, 0, w, h)
  return c.toDataURL("image/jpeg", 0.82)
}

export default function AseguradoLegajoPage() {
  const { token } = useParams<{ token: string }>()
  const [data, setData] = useState<LegajoPublico | null>(null)
  const [estado, setEstado] = useState<"load" | "ok" | "err">("load")
  const [subiendo, setSubiendo] = useState<string | null>(null) // key cobranzaId:mes
  const [msg, setMsg] = useState<{ key: string; text: string; tone: "ok" | "err" } | null>(null)

  useEffect(() => {
    legajoAseguradoAPI.publico(token)
      .then(d => { setData(d); setEstado("ok") })
      .catch(() => setEstado("err"))
  }, [token])

  const accent = data?.productor?.colorPrimario || "#1F4D3A"
  const wa = data?.productor?.whatsapp ? String(data.productor.whatsapp).replace(/[^0-9]/g, "") : ""
  const inicialPAS = (data?.productor?.nombre || "P").trim().charAt(0).toUpperCase()

  const companiasOrdenadas = useMemo(() => (data?.companias || []).filter(c => c.telefonoAuxilio || c.telefonoSiniestros), [data])

  // Algunas pólizas (auto/moto) tienen patente — esas se renderizan como cédula.
  // El resto va como tarjeta sobria (hogar/vida/etc).
  async function handleUpload(cobranzaId: string, mes: string, file: File) {
    const key = `${cobranzaId}:${mes}`
    setSubiendo(key); setMsg(null)
    try {
      const dataUrl = await fileToDataUrl(file)
      await legajoAseguradoAPI.subirComprobante(token, { cobranzaId, mes, dataUrl })
      setMsg({ key, text: "Comprobante enviado. Te avisamos cuando lo confirmemos.", tone: "ok" })
      // Refresca la data del legajo para reflejar "En revisión".
      const d = await legajoAseguradoAPI.publico(token); setData(d)
    } catch (e: any) {
      setMsg({ key, text: e?.message || "No se pudo enviar el comprobante.", tone: "err" })
    } finally { setSubiendo(null) }
  }

  return (
    <main className="leg-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600&family=Manrope:wght@400;500;600&family=Departure+Mono&display=swap');
        .leg-root{ --acc:${accent}; --paper:#EEE9DA; --paper-2:#F7F3E6; --ink:#0F1814; --muted:#5b6b62;
          --line:#dfd9c4; --sello:#A8321F; --mostaza:#C28A2A;
          background:var(--paper); color:var(--ink); min-height:100vh;
          font-family:'Manrope',ui-sans-serif,system-ui,sans-serif; }
        .leg-mono{ font-family:'Departure Mono','IBM Plex Mono',ui-monospace,monospace; }
        .leg-display{ font-family:'Bricolage Grotesque','Manrope',sans-serif; font-weight:500; letter-spacing:-.01em; }
        .leg-wrap{ max-width:760px; margin:0 auto; padding:0 18px 80px; }
        .leg-eye{ font-family:'Departure Mono',monospace; font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--muted); }
        .leg-card{ background:var(--paper-2); border:0.75px solid var(--line); border-radius:10px; }
        .leg-card-ink{ background:#fff; border:1px solid var(--ink); border-radius:6px; }
        .leg-cred{ background:var(--paper-2); border:1.5px solid var(--acc); border-radius:8px; padding:18px; }
        .leg-patente{ background:#FFFFFF; color:#0F1814; border:1.5px solid #0F1814; border-radius:5px;
          padding:22px 16px 12px; font-family:'Departure Mono',monospace; font-weight:400; font-size:26px;
          letter-spacing:.22em; display:inline-block; position:relative; line-height:1; box-shadow: 0 2px 0 rgba(0,0,0,.06); }
        .leg-patente::before{ content:"REPÚBLICA ARGENTINA · MERCOSUR"; position:absolute; top:0; left:0; right:0;
          background:#0F1814; color:#fff; font-size:9px; letter-spacing:.22em; text-align:center; padding:3px 6px; font-family:'Departure Mono',monospace; border-radius:3px 3px 0 0; }
        .leg-patente::after{ content:""; position:absolute; top:0; left:0; bottom:0; width:6px;
          background:linear-gradient(180deg, #6CACE4 0%, #6CACE4 33%, #fff 33%, #fff 66%, #6CACE4 66%, #6CACE4 100%); border-radius:3px 0 0 3px; }
        .leg-tel{ font-family:'Departure Mono',monospace; font-weight:500; font-size:18px; letter-spacing:.04em; color:var(--ink); }
        .leg-stamp{ font-family:'Departure Mono',monospace; font-size:11px; letter-spacing:.1em; text-transform:uppercase; padding:5px 9px; border-radius:4px; display:inline-flex; align-items:center; gap:5px; font-weight:500; }
        .leg-btn{ display:inline-flex; align-items:center; justify-content:center; gap:7px; padding:10px 16px; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; border:1px solid transparent; font-family:'Manrope',sans-serif; text-decoration:none; }
        .leg-btn-primary{ background:var(--acc); color:#fff; }
        .leg-btn-ghost{ background:transparent; color:var(--ink); border-color:var(--ink); }
        .leg-btn-sello{ background:var(--sello); color:#fff; }
        .leg-mark{ width:42px; height:42px; border-radius:7px; background:var(--acc); color:#fff; display:flex; align-items:center;
          justify-content:center; font-family:'Bricolage Grotesque',serif; font-weight:600; font-size:20px; flex-shrink:0; }
        .leg-iconbox{ width:48px; height:48px; border-radius:8px; background:#efe9d4; display:flex; align-items:center; justify-content:center; flex-shrink:0; color:var(--ink); }
        .leg-cuota{ display:grid; grid-template-columns:1fr auto; gap:10px; align-items:center; padding:14px 16px; border-top:1px dashed var(--line); }
        .leg-cuota:first-of-type{ border-top:0; }
        .leg-drop{ background:#fff; border:1.5px dashed var(--ink); border-radius:8px; padding:14px; text-align:center; cursor:pointer; }
        .leg-drop input{ display:none; }
        .leg-msg-ok{ background:#E1F5EE; color:#04342C; border:1px solid #0F6E56; }
        .leg-msg-err{ background:#FCEBEB; color:#501313; border:1px solid #A32D2D; }
        @keyframes legPop{ from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        .leg-pop{ animation:legPop .45s cubic-bezier(.2,.7,.2,1) both; }
      `}</style>

      <div className="leg-wrap">
        {estado === "load" && <p className="leg-eye" style={{ textAlign: "center", paddingTop: 80 }}>Abriendo el legajo…</p>}

        {estado === "err" && (
          <div className="leg-card" style={{ padding: 28, textAlign: "center", marginTop: 80 }}>
            <i className="ti ti-folder-x" style={{ fontSize: 30, color: "var(--muted)" }} aria-hidden></i>
            <p className="leg-display" style={{ fontSize: 20, margin: "10px 0 4px" }}>No encontramos este legajo</p>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>El link puede haber cambiado. Pedile a tu productor uno nuevo.</p>
          </div>
        )}

        {estado === "ok" && data && (
          <>
            <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 4px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {data.productor.logo
                  /* eslint-disable-next-line @next/next/no-img-element */
                  ? <img src={data.productor.logo} alt="" style={{ height: 44, width: 44, objectFit: "contain", background: "#fff", borderRadius: 8, padding: 3, border: "1px solid var(--line)" }} />
                  : <span className="leg-mark" aria-hidden>{inicialPAS}</span>}
                <div>
                  <p className="leg-display" style={{ margin: 0, fontSize: 16, lineHeight: 1 }}>{data.productor.nombre}</p>
                  <p className="leg-eye" style={{ marginTop: 4 }}>Productor de seguros</p>
                </div>
              </div>
            </header>

            {/* Hero saludo */}
            <section className="leg-card leg-pop" style={{ padding: "22px 22px 24px", marginBottom: 14 }}>
              <p className="leg-eye" style={{ marginBottom: 8 }}>Tu legajo</p>
              <p className="leg-display" style={{ margin: 0, fontSize: 30, lineHeight: 1.1 }}>
                Hola, {data.cliente.nombreApellido.split(" ")[0] || "—"}
              </p>
              <p style={{ margin: "10px 0 0", fontSize: 14, color: "var(--muted)", lineHeight: 1.55 }}>
                Tenés <span style={{ color: "var(--ink)" }}>{data.vehiculos.length || "—"} {data.vehiculos.length === 1 ? "vehículo" : "vehículos"}</span> en tu legajo.
                Esta página la armó tu productor.
              </p>
            </section>

            {/* Bloque emergencia */}
            {companiasOrdenadas.length > 0 && (
              <section className="leg-card leg-pop" style={{ padding: 18, marginBottom: 14, border: "1.5px solid var(--acc)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--sello)" }} aria-hidden></span>
                  <p className="leg-eye" style={{ color: accent }}>Si te pasa algo, ahora</p>
                </div>
                {companiasOrdenadas.map((c, i) => (
                  <div key={i} style={{ padding: "12px 0", borderTop: i === 0 ? 0 : "0.75px solid var(--line)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p className="leg-display" style={{ margin: 0, fontSize: 14 }}>{labelCompania(c.nombre)}</p>
                        {c.notasDelPAS && <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--muted)", lineHeight: 1.45 }}>{c.notasDelPAS}</p>}
                      </div>
                    </div>
                    <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                      {c.telefonoAuxilio && (
                        <a href={`tel:${c.telefonoAuxilio.replace(/\s+/g, "")}`} style={{ textDecoration: "none" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", border: "1px solid var(--line)", borderRadius: 8, padding: "10px 12px" }}>
                            <div>
                              <p style={{ margin: 0, fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em" }}>Auxilio en ruta</p>
                              <p className="leg-tel" style={{ margin: "3px 0 0" }}>{c.telefonoAuxilio}</p>
                            </div>
                            <i className="ti ti-phone" style={{ fontSize: 18, color: accent }} aria-hidden></i>
                          </div>
                        </a>
                      )}
                      {c.telefonoSiniestros && (
                        <a href={`tel:${c.telefonoSiniestros.replace(/\s+/g, "")}`} style={{ textDecoration: "none" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", border: "1px solid var(--line)", borderRadius: 8, padding: "10px 12px" }}>
                            <div>
                              <p style={{ margin: 0, fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em" }}>Tuviste un choque</p>
                              <p className="leg-tel" style={{ margin: "3px 0 0" }}>{c.telefonoSiniestros}</p>
                            </div>
                            <i className="ti ti-phone" style={{ fontSize: 18, color: accent }} aria-hidden></i>
                          </div>
                        </a>
                      )}
                      {(c.appUrl || c.sitioWeb) && (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {c.appUrl && <a href={c.appUrl} target="_blank" rel="noreferrer" className="leg-btn leg-btn-ghost" style={{ flex: 1, fontSize: 12, padding: "8px 10px" }}><i className="ti ti-device-mobile" style={{ fontSize: 14 }} aria-hidden></i>App de la compañía</a>}
                          {c.sitioWeb && <a href={c.sitioWeb} target="_blank" rel="noreferrer" className="leg-btn leg-btn-ghost" style={{ flex: 1, fontSize: 12, padding: "8px 10px" }}><i className="ti ti-world" style={{ fontSize: 14 }} aria-hidden></i>Sitio web</a>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Vehículos */}
            {data.vehiculos.length > 0 && (
              <>
                <p className="leg-eye" style={{ margin: "20px 6px 10px" }}>Tus vehículos</p>
                {data.vehiculos.map(v => {
                  const esVehiculo = v.patente && RAMOS_VEHICULO.some(r => (v.ramo || "").includes(r))
                  const vigente = v.estado === "VIGENTE"
                  return (
                    <div key={v._id} className="leg-cred leg-pop" style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
                        <span className="leg-iconbox" aria-hidden><i className={`ti ${iconRamo(v.ramo)}`} style={{ fontSize: 22 }}></i></span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p className="leg-display" style={{ margin: 0, fontSize: 16, lineHeight: 1.2 }}>
                            {v.datosRiesgo || labelRamo(v.ramo) || "Cobertura"}
                          </p>
                          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted)" }}>
                            {labelCompania(v.aseguradora)}{v.tipoCobertura ? " · " + v.tipoCobertura : ""}
                          </p>
                        </div>
                      </div>

                      {esVehiculo && (
                        <div style={{ textAlign: "center", margin: "6px 0 16px" }}>
                          <span className="leg-patente">{v.patente}</span>
                        </div>
                      )}

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
                        {vigente
                          ? <span className="leg-stamp" style={StampStyles.ok}><i className="ti ti-shield-check" style={{ fontSize: 13 }} aria-hidden></i>Vigente · {dateAR(v.fechaFinVig)}</span>
                          : v.estado === "ANULADA"
                            ? <span className="leg-stamp" style={StampStyles.neutral}>Anulada</span>
                            : <span className="leg-stamp" style={StampStyles.next}>{v.estado || "—"}{v.fechaFinVig ? " · " + dateAR(v.fechaFinVig) : ""}</span>}
                        {v.numPoliza && <span className="leg-mono" style={{ fontSize: 11, color: "var(--muted)" }}>Póliza {v.numPoliza}</span>}
                      </div>
                    </div>
                  )
                })}
              </>
            )}

            {/* Cuotas */}
            {data.cuentaCorriente.length > 0 && (
              <>
                <p className="leg-eye" style={{ margin: "24px 6px 10px" }}>Tus cuotas</p>
                {data.cuentaCorriente.map(cob => (
                  <CobranzaCard
                    key={cob._id}
                    cob={cob}
                    accent={accent}
                    onUpload={handleUpload}
                    subiendoKey={subiendo}
                    msg={msg}
                  />
                ))}
              </>
            )}

            {wa && (
              <div style={{ marginTop: 26, textAlign: "center" }}>
                <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="leg-btn leg-btn-ghost"
                   style={{ background: "#25D366", color: "#fff", border: 0 }}>
                  <i className="ti ti-brand-whatsapp" style={{ fontSize: 16 }} aria-hidden></i>
                  Escribirle a {data.productor.nombre}
                </a>
              </div>
            )}

            <p style={{ textAlign: "center", margin: "32px 0 4px", fontSize: 11, color: "var(--muted)" }}>
              Tu legajo lo lleva <strong>{data.productor.nombre}</strong> con <strong>SegurOS</strong>
            </p>
          </>
        )}
      </div>
    </main>
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
  // Pago "del momento": el primero PENDIENTE/VENCIDO. Lo desplegamos abierto.
  const proxIdx = cob.pagos.findIndex(p => p.estado !== "COBRADA" && p.estado !== "NO_CORRESPONDE" && p.estado !== "ANULADA")
  const [abierto, setAbierto] = useState(proxIdx >= 0)

  return (
    <div className="leg-card leg-pop" style={{ marginBottom: 12, overflow: "hidden" }}>
      <button onClick={() => setAbierto(v => !v)} style={{ width: "100%", textAlign: "left", padding: "16px 18px", background: "transparent", border: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, color: "inherit" }}>
        <span style={{ width: 38, height: 38, borderRadius: 8, background: `color-mix(in srgb, ${accent} 12%, #fff)`, display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>
          <i className="ti ti-receipt-2" style={{ fontSize: 18 }} aria-hidden></i>
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="leg-display" style={{ margin: 0, fontSize: 14 }}>
            {labelCompania(cob.aseguradora) || "Cobranza"}{cob.patente ? " · " + cob.patente : ""}
          </p>
          <p className="leg-eye" style={{ marginTop: 3 }}>
            {cob.pagos.filter(p => p.estado === "COBRADA").length} de {cob.numeroCuotasTotal || cob.pagos.length} pagadas
          </p>
        </div>
        <i className={`ti ${abierto ? "ti-chevron-down" : "ti-chevron-right"}`} style={{ fontSize: 18, color: "var(--muted)" }} aria-hidden></i>
      </button>

      {abierto && (
        <div style={{ borderTop: "0.75px solid var(--line)" }}>
          {cob.pagos.map(p => {
            const key = `${cob._id}:${p.mes}`
            const chip = estadoChip(p)
            const tone = StampStyles[chip.tone]
            const canUpload = p.estado !== "COBRADA" && p.estado !== "COMPROBANTE_RECIBIDO" && p.estado !== "ANULADA" && p.estado !== "NO_CORRESPONDE"
            const yaSubio = p.estado === "COMPROBANTE_RECIBIDO"
            const showMsg = msg && msg.key === key
            return (
              <div key={p.mes} className="leg-cuota">
                <div style={{ minWidth: 0 }}>
                  <p className="leg-display" style={{ margin: 0, fontSize: 14 }}>
                    {p.mesLabel || p.mes}{p.numeroCuota ? ` · cuota ${p.numeroCuota}` : ""}
                  </p>
                  <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                    <span className="leg-stamp" style={tone}>{chip.label}</span>
                    {p.monto != null && <span className="leg-mono" style={{ fontSize: 13, fontWeight: 600 }}>{moneyAR(p.monto)}</span>}
                  </div>
                  {yaSubio && (
                    <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--muted)" }}>
                      Recibimos tu comprobante el {dateAR(p.comprobante?.subidoEn, true)}. Lo está revisando tu productor.
                    </p>
                  )}
                  {p.comprobante?.rechazadoEn && (
                    <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--sello)" }}>
                      Tu comprobante fue rechazado{p.comprobante.rechazoMotivo ? `: ${p.comprobante.rechazoMotivo}` : "."} Probá subir uno nuevo.
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "stretch" }}>
                  {canUpload && (
                    <label className="leg-drop" style={{ minWidth: 180 }}>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        disabled={subiendoKey === key}
                        onChange={async e => {
                          const f = e.target.files?.[0]; if (f) await onUpload(cob._id, p.mes, f)
                          e.target.value = ""
                        }}
                      />
                      <i className="ti ti-camera" style={{ fontSize: 20, color: "var(--muted)" }} aria-hidden></i>
                      <p style={{ margin: "4px 0 0", fontSize: 12, fontWeight: 600 }}>
                        {subiendoKey === key ? "Enviando…" : "Subir comprobante"}
                      </p>
                    </label>
                  )}
                </div>
                {showMsg && (
                  <div className={msg.tone === "ok" ? "leg-msg-ok" : "leg-msg-err"} style={{ gridColumn: "1 / -1", borderRadius: 6, padding: "8px 12px", fontSize: 12 }}>
                    {msg.text}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
