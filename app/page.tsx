// Landing de seguros.tusventas.com.ar — enfocada en la app SegurOS.
// Adopta la identidad del panel: navy profundo + acento cyan, Inter, superficies
// limpias. Hero con el dashboard real flotando en un teléfono + 2 CTAs.

import Link from "next/link"
import { Inter, IBM_Plex_Mono } from "next/font/google"
import { Shield, ArrowRight, LogIn, Bell, CheckCircle2, TrendingUp } from "lucide-react"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const mono = IBM_Plex_Mono({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--font-mono" })

// Paleta tomada del panel (globals.css): primary 209 55% 23%, accent 200 70% 63%.
const NAVY = "#102B45"
const NAVY2 = "#1A4670"
const CYAN = "#56B7E8"
const INK = "#13243A"
const BG = "#F4F8FC"
const GREEN = "#1FA97E"
const AMBER = "#E0A52B"

export default function LandingPage() {
  return (
    <div
      className={`${inter.variable} ${mono.variable} min-h-screen`}
      style={{ background: BG, color: INK, fontFamily: "var(--font-inter), system-ui, sans-serif" }}
    >
      <style>{css}</style>

      {/* NAV */}
      <header className="sg-nav">
        <div className="sg-wrap sg-nav-row">
          <Link href="/" className="sg-brand">
            <span className="sg-brand-mark"><Shield size={18} strokeWidth={2.4} /></span>
            <span className="sg-brand-name">Segur<span style={{ color: CYAN }}>OS</span></span>
          </Link>
          <nav className="sg-nav-cta">
            <Link href="/login" className="sg-link">Ingresar</Link>
            <Link href="/registro" className="sg-btn sg-btn-cyan sg-btn-sm">Crear demo gratis</Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="sg-hero">
        <div className="sg-hero-glow" aria-hidden />
        <div className="sg-hero-grid-bg" aria-hidden />
        <div className="sg-wrap sg-hero-grid">
          <div className="sg-hero-copy">
            <span className="sg-eyebrow">CRM para PAS y brokers de seguros</span>
            <h1 className="sg-h1">
              Toda tu cartera de seguros,<br /><span style={{ color: CYAN }}>bajo control</span>.
            </h1>
            <p className="sg-sub">
              Pólizas, cobranzas, siniestros y vencimientos con aviso automático.
              Sin Excel, sin perderle el rastro a una renovación. SegurOS ordena tu
              negocio y te avisa antes de que se te pase algo.
            </p>
            <div className="sg-hero-actions">
              <Link href="/registro" className="sg-btn sg-btn-cyan sg-btn-lg">
                Crear demo gratis <ArrowRight size={18} />
              </Link>
              <Link href="/login" className="sg-btn sg-btn-ghost sg-btn-lg">
                <LogIn size={18} /> Ingresar app seguros
              </Link>
            </div>
            <ul className="sg-trust">
              <li><CheckCircle2 size={15} /> 7 días gratis</li>
              <li><CheckCircle2 size={15} /> Sin tarjeta</li>
              <li><CheckCircle2 size={15} /> Tus datos aislados</li>
            </ul>
          </div>

          {/* Teléfono flotando con el dashboard */}
          <div className="sg-phone-stage">
            <div className="sg-chip sg-chip-a"><span className="sg-dot" style={{ background: GREEN }} /> Póliza renovada</div>
            <div className="sg-chip sg-chip-b"><Bell size={13} /> 12 vencimientos avisados</div>

            <div className="sg-phone">
              <div className="sg-phone-notch" />
              <div className="sg-screen">
                <div className="sg-app-top">
                  <span className="sg-app-mark"><Shield size={13} strokeWidth={2.6} /></span>
                  <span className="sg-app-name">SegurOS</span>
                  <span className="sg-app-avatar">MR</span>
                </div>
                <p className="sg-app-hi">Hola, Martín 👋</p>

                <div className="sg-stats">
                  <div className="sg-stat"><span className="sg-stat-k">Cartera</span><span className="sg-stat-v">$4,2M</span></div>
                  <div className="sg-stat"><span className="sg-stat-k">Vigentes</span><span className="sg-stat-v">218</span></div>
                  <div className="sg-stat sg-stat-accent"><span className="sg-stat-k">Cobrado</span><span className="sg-stat-v">92%</span></div>
                </div>

                <div className="sg-card">
                  <div className="sg-card-h"><span>Vencimientos</span><span className="sg-card-tag">esta semana</span></div>
                  {[
                    { n: "Gómez · Automotor", s: "Por vencer", c: AMBER },
                    { n: "Pérez SRL · Integral", s: "Por vencer", c: AMBER },
                    { n: "Díaz · Vida", s: "Renovada", c: GREEN },
                  ].map((r) => (
                    <div key={r.n} className="sg-row">
                      <span className="sg-row-n">{r.n}</span>
                      <span className="sg-pill" style={{ color: r.c, background: `${r.c}1f` }}>{r.s}</span>
                    </div>
                  ))}
                </div>

                <div className="sg-card sg-cobranza">
                  <div className="sg-card-h"><span>Cobranzas de junio</span><TrendingUp size={13} style={{ color: GREEN }} /></div>
                  <div className="sg-bar"><span style={{ width: "92%" }} /></div>
                  <div className="sg-cob-foot"><span>$2,1M / $2,3M</span><span style={{ color: GREEN }}>92%</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="sg-cta">
        <div className="sg-cta-glow" aria-hidden />
        <div className="sg-wrap sg-cta-inner">
          <h2 className="sg-cta-h">Probá SegurOS gratis, 7 días</h2>
          <p className="sg-cta-sub">Cargá tus pólizas y mirá tu cartera ordenada desde hoy. Sin tarjeta.</p>
          <div className="sg-hero-actions sg-cta-actions">
            <Link href="/registro" className="sg-btn sg-btn-cyan sg-btn-lg">Crear demo gratis <ArrowRight size={18} /></Link>
            <Link href="/login" className="sg-btn sg-btn-ghost sg-btn-lg"><LogIn size={18} /> Ingresar app seguros</Link>
          </div>
        </div>
      </section>

      <footer className="sg-foot">
        <div className="sg-wrap sg-foot-row">
          <span className="sg-brand"><span className="sg-brand-mark sg-brand-mark-sm"><Shield size={14} strokeWidth={2.4} /></span><span className="sg-brand-name" style={{ fontSize: 16 }}>Segur<span style={{ color: CYAN }}>OS</span></span></span>
          <span className="sg-foot-meta">Un producto de TusVentas · Hecho en Argentina</span>
          <Link href="/login" className="sg-link">Ingresar</Link>
        </div>
      </footer>
    </div>
  )
}

const css = `
.sg-wrap{ max-width:1140px; margin:0 auto; padding:0 22px; }

.sg-btn{ display:inline-flex; align-items:center; justify-content:center; gap:8px;
  font-weight:600; text-decoration:none; border-radius:12px; transition:transform .2s, box-shadow .2s, background .2s, border-color .2s; white-space:nowrap; }
.sg-btn-sm{ padding:9px 16px; font-size:14px; }
.sg-btn-lg{ padding:15px 26px; font-size:16px; }
.sg-btn-cyan{ background:${CYAN}; color:#06243a; box-shadow:0 14px 34px -14px ${CYAN}; }
.sg-btn-cyan:hover{ transform:translateY(-2px); box-shadow:0 20px 44px -14px ${CYAN}; }
.sg-btn-ghost{ background:rgba(255,255,255,.06); color:#fff; border:1px solid rgba(255,255,255,.28); }
.sg-btn-ghost:hover{ background:rgba(255,255,255,.12); border-color:rgba(255,255,255,.5); }

.sg-link{ color:#cfe0ee; text-decoration:none; font-weight:500; font-size:15px; transition:color .2s; }
.sg-link:hover{ color:#fff; }

.sg-brand{ display:inline-flex; align-items:center; gap:10px; text-decoration:none; color:#fff; }
.sg-brand-mark{ display:grid; place-items:center; width:34px; height:34px; border-radius:10px; color:#06243a;
  background:${CYAN}; box-shadow:0 6px 18px -8px ${CYAN}; }
.sg-brand-mark-sm{ width:30px; height:30px; }
.sg-brand-name{ font-size:21px; font-weight:700; letter-spacing:-.02em; color:#fff; }

/* NAV */
.sg-nav{ position:absolute; top:0; left:0; right:0; z-index:30; }
.sg-nav-row{ display:flex; align-items:center; justify-content:space-between; height:78px; }
.sg-nav-cta{ display:flex; align-items:center; gap:18px; }

/* HERO */
.sg-hero{ position:relative; overflow:hidden; color:#fff; padding:120px 0 96px;
  background:linear-gradient(160deg, ${NAVY} 0%, #0c2138 45%, ${NAVY2} 130%); }
.sg-hero-glow{ position:absolute; inset:0; pointer-events:none;
  background:radial-gradient(46% 50% at 82% 28%, rgba(86,183,232,.30) 0%, transparent 62%),
            radial-gradient(40% 44% at 10% 86%, rgba(86,183,232,.12) 0%, transparent 60%); }
.sg-hero-grid-bg{ position:absolute; inset:0; opacity:.5; pointer-events:none;
  background-image:linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px);
  background-size:54px 54px; mask-image:linear-gradient(180deg, transparent, #000 30%, #000 70%, transparent); }
.sg-hero-grid{ position:relative; z-index:2; display:grid; gap:54px; align-items:center; grid-template-columns:1.04fr .96fr; }

.sg-eyebrow{ font-family:var(--font-mono),monospace; font-size:12px; letter-spacing:.18em; text-transform:uppercase; color:${CYAN}; }
.sg-h1{ margin:18px 0 0; font-size:clamp(2.6rem,5.2vw,4.1rem); font-weight:700; line-height:1.04; letter-spacing:-.03em; }
.sg-sub{ margin:22px 0 0; max-width:30rem; font-size:1.075rem; line-height:1.6; color:#b9cbdc; }
.sg-hero-actions{ display:flex; flex-wrap:wrap; gap:13px; margin-top:30px; }
.sg-trust{ display:flex; flex-wrap:wrap; gap:18px; margin:26px 0 0; padding:0; list-style:none; }
.sg-trust li{ display:inline-flex; align-items:center; gap:7px; font-size:14px; color:#9fb6c9; }
.sg-trust svg{ color:${CYAN}; }

/* PHONE */
.sg-phone-stage{ position:relative; display:flex; justify-content:center; }
.sg-phone{ position:relative; width:clamp(270px,30vw,322px); aspect-ratio:300/620;
  background:#0a1726; border-radius:42px; padding:11px; border:1px solid rgba(255,255,255,.14);
  box-shadow:0 50px 90px -40px rgba(0,0,0,.85), 0 0 0 1px rgba(86,183,232,.18), 0 30px 70px -30px rgba(86,183,232,.45);
  transform:rotate(2.4deg); animation:sgfloat 7s ease-in-out infinite; }
.sg-phone-notch{ position:absolute; top:13px; left:50%; transform:translateX(-50%); width:38%; height:18px; border-radius:0 0 12px 12px; background:#0a1726; z-index:3; }
.sg-screen{ position:relative; height:100%; border-radius:32px; overflow:hidden; padding:30px 14px 16px;
  background:linear-gradient(180deg, #f7fbff 0%, #eef5fb 100%); color:${INK}; display:flex; flex-direction:column; gap:11px; }
.sg-app-top{ display:flex; align-items:center; gap:8px; }
.sg-app-mark{ display:grid; place-items:center; width:24px; height:24px; border-radius:7px; background:${NAVY}; color:${CYAN}; }
.sg-app-name{ font-weight:700; font-size:14px; letter-spacing:-.01em; color:${NAVY}; }
.sg-app-avatar{ margin-left:auto; display:grid; place-items:center; width:24px; height:24px; border-radius:50%; background:${CYAN}; color:#06243a; font-size:10px; font-weight:700; }
.sg-app-hi{ margin:0; font-size:13px; font-weight:600; color:#43576b; }
.sg-stats{ display:grid; grid-template-columns:repeat(3,1fr); gap:7px; }
.sg-stat{ background:#fff; border:1px solid #e2ecf5; border-radius:11px; padding:9px 8px; }
.sg-stat-accent{ background:${NAVY}; border-color:${NAVY}; }
.sg-stat-accent .sg-stat-k{ color:#9cc7e6; } .sg-stat-accent .sg-stat-v{ color:#fff; }
.sg-stat-k{ display:block; font-size:9.5px; color:#7d93a8; font-weight:600; }
.sg-stat-v{ display:block; font-size:16px; font-weight:700; letter-spacing:-.02em; margin-top:1px; color:${NAVY}; }
.sg-card{ background:#fff; border:1px solid #e2ecf5; border-radius:13px; padding:11px 11px 9px; }
.sg-card-h{ display:flex; align-items:center; justify-content:space-between; font-size:11.5px; font-weight:700; color:${NAVY}; margin-bottom:7px; }
.sg-card-tag{ font-size:9px; font-weight:600; color:#7d93a8; text-transform:uppercase; letter-spacing:.06em; }
.sg-row{ display:flex; align-items:center; justify-content:space-between; gap:8px; padding:5px 0; border-top:1px solid #eef3f8; }
.sg-row:first-of-type{ border-top:0; }
.sg-row-n{ font-size:11px; color:#3a4f63; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.sg-pill{ font-size:9px; font-weight:700; padding:3px 8px; border-radius:999px; white-space:nowrap; }
.sg-cobranza .sg-bar{ height:8px; border-radius:999px; background:#e7eef5; overflow:hidden; margin:2px 0 7px; }
.sg-cobranza .sg-bar span{ display:block; height:100%; border-radius:999px; background:linear-gradient(90deg, ${CYAN}, ${GREEN}); }
.sg-cob-foot{ display:flex; justify-content:space-between; font-size:10.5px; font-weight:600; color:#5a6f83; }

.sg-chip{ position:absolute; z-index:4; display:inline-flex; align-items:center; gap:7px; padding:9px 13px; border-radius:12px;
  background:rgba(255,255,255,.96); color:${NAVY}; font-size:12.5px; font-weight:600;
  box-shadow:0 18px 40px -16px rgba(0,0,0,.5); border:1px solid rgba(255,255,255,.6); }
.sg-chip svg{ color:${CYAN}; }
.sg-dot{ width:8px; height:8px; border-radius:50%; display:inline-block; }
.sg-chip-a{ top:12%; left:-6%; animation:sgfloat 6s ease-in-out infinite .4s; }
.sg-chip-b{ bottom:14%; right:-9%; animation:sgfloat 6.6s ease-in-out infinite .9s; }

/* CTA */
.sg-cta{ position:relative; overflow:hidden; margin:0 22px 64px; border-radius:28px;
  background:linear-gradient(150deg, ${NAVY} 0%, ${NAVY2} 120%); color:#fff; }
.sg-cta-glow{ position:absolute; inset:0; pointer-events:none;
  background:radial-gradient(50% 80% at 80% 20%, rgba(86,183,232,.32) 0%, transparent 60%); }
.sg-cta-inner{ position:relative; z-index:2; text-align:center; padding:64px 22px; max-width:1140px; }
.sg-cta-h{ margin:0; font-size:clamp(1.9rem,4vw,2.8rem); font-weight:700; letter-spacing:-.025em; }
.sg-cta-sub{ margin:14px 0 0; color:#bcd0e1; font-size:1.05rem; }
.sg-cta-actions{ justify-content:center; margin-top:30px; }

/* FOOT */
.sg-foot{ background:${NAVY}; color:#cfe0ee; padding:26px 0; }
.sg-foot-row{ display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
.sg-foot-meta{ font-size:13px; color:#8aa3ba; }

@keyframes sgfloat{ 0%,100%{ transform:translateY(0) rotate(2.4deg);} 50%{ transform:translateY(-14px) rotate(2.4deg);} }

@media (max-width:880px){
  .sg-hero-grid{ grid-template-columns:1fr; gap:44px; }
  .sg-hero-copy{ text-align:center; }
  .sg-sub{ margin-left:auto; margin-right:auto; }
  .sg-hero-actions, .sg-trust{ justify-content:center; }
}
@media (max-width:560px){
  .sg-chip-a{ left:0; } .sg-chip-b{ right:0; }
}
@media (prefers-reduced-motion:reduce){
  .sg-phone, .sg-chip-a, .sg-chip-b{ animation:none; }
}
`
