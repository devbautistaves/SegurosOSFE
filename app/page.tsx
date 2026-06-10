import Link from "next/link"
import { Spectral, Public_Sans, IBM_Plex_Mono } from "next/font/google"
import {
  Shield, ArrowRight, Check, Users, Bell, FileText, CreditCard,
  AlertTriangle, BarChart3, Smartphone, Layers,
  CalendarX2, FileSpreadsheet, ShieldOff,
} from "lucide-react"

// Tipografías de la landing — solo acá, no tocan el panel.
// Spectral: serif de documento legal (titulares). Public Sans: tipo oficial
// (cuerpo). IBM Plex Mono: ledger actuarial (pólizas, fechas, primas).
const spectral = Spectral({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-spectral", style: ["normal", "italic"] })
const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-public" })
const plex = IBM_Plex_Mono({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--font-plex" })

const PAPER = "#F6F4EE"
const INK = "#0E1A2B"
const GREEN = "#1B5E4A"
const GOLD = "#B08738"
const OXBLOOD = "#B23A2E"

const SERIF = spectral.className
const MONO = plex.className

const RIESGOS = [
  { icon: CalendarX2, text: "Una póliza vence y te enterás cuando el cliente ya se fue a otro broker." },
  { icon: FileSpreadsheet, text: "El Excel lo edita cualquiera y nadie sabe cuál es la versión buena." },
  { icon: CreditCard, text: "Las cuotas vencidas se acumulan y no sabés a quién reclamarle." },
  { icon: ShieldOff, text: "Un siniestro sin seguimiento es, casi siempre, un cliente perdido." },
]

const COBERTURAS = [
  { cod: "01", icon: FileText, title: "Pólizas", text: "Cargás, renovás y anulás pólizas con todos sus datos. Búsqueda instantánea por número, asegurado o ramo." },
  { cod: "02", icon: CreditCard, title: "Cobranzas", text: "Control mes a mes de cuotas: cobradas, vencidas, compromisos. Recordatorios por email y WhatsApp." },
  { cod: "03", icon: AlertTriangle, title: "Siniestros", text: "Registrás y seguís el ciclo completo de cada siniestro con su número y estado." },
  { cod: "04", icon: Bell, title: "Vencimientos", text: "Avisos automáticos de renovación y alertas de cuotas vencidas antes de que se te pasen." },
  { cod: "05", icon: Users, title: "Multi-usuario", text: "Sumás a tu equipo con roles (admin, vendedor, soporte). Cada uno con sus permisos." },
  { cod: "06", icon: BarChart3, title: "Dashboard", text: "Cartera total, vigentes, anuladas y cobranzas del mes, todo en una pantalla." },
  { cod: "07", icon: Layers, title: "Catálogos propios", text: "Cargás las aseguradoras y ramos que vos vendés. SegurOS no te impone listas cerradas." },
  { cod: "08", icon: Smartphone, title: "En el celular", text: "Instalable como app (PWA) en Android, iOS, Mac y Windows. Tu cartera, siempre encima." },
]

const FAQS = [
  { q: "¿Cómo funcionan los 7 días gratis?", a: "Al registrarte arrancás con acceso PRO completo durante 7 días, sin tarjeta. Cargás pólizas, cobranzas y siniestros sin límites. Si al día 8 no elegiste un plan, tus datos quedan guardados pero no podés crear cosas nuevas hasta suscribirte." },
  { q: "¿Qué pasa con la PROMO de lanzamiento?", a: "Pagás $25.000/mes durante los primeros 3 meses con acceso PRO completo. Al mes 4 se renueva automáticamente como PRO Mensual ($45.000). Cancelás cuando quieras desde el panel." },
  { q: "¿Mis datos quedan aislados?", a: "Sí. Cada cuenta es 100% multi-tenant: ningún otro broker puede ver tus clientes, pólizas o cobranzas." },
  { q: "¿Puedo cancelar cuando quiera?", a: "Sí. La suscripción se cancela desde el panel y mantenés acceso PRO hasta el final del ciclo pagado. No reembolsamos el período en curso." },
  { q: "¿Cómo pago?", a: "Con MercadoPago. Los planes mensuales (PROMO y PRO Mensual) son suscripción recurrente; el PRO Anual se paga una vez. Procesamiento seguro, sin guardar datos de tarjeta en nuestro sistema." },
  { q: "¿Cuántos usuarios puedo tener?", a: "Sin límite en cualquier plan PRO. Sumá a todo tu equipo con roles diferenciados (admin, vendedor, soporte)." },
  { q: "¿Quién está detrás de SegurOS?", a: "TusVentas, una empresa argentina con experiencia en CRMs para brokers de seguros." },
]

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className={`${MONO} inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[0.22em]`} style={{ color: GOLD }}>
      <span className="inline-block h-px w-7" style={{ background: GOLD }} />
      {children}
    </span>
  )
}

function Seal({ label = "Vigente" }: { label?: string }) {
  return (
    <span className="sg-seal sg-seal-in">
      <span className="flex flex-col items-center leading-none">
        <Check className="h-4 w-4" strokeWidth={3} style={{ color: GREEN }} />
        <span className={`${MONO} mt-1 text-[9px] font-bold uppercase tracking-[0.12em]`} style={{ color: GREEN }}>{label}</span>
      </span>
    </span>
  )
}

export default function LandingPage() {
  return (
    <div
      className={`${spectral.variable} ${publicSans.variable} ${plex.variable} min-h-screen selection:bg-[#1B5E4A] selection:text-white`}
      style={{ background: PAPER, color: INK, fontFamily: "var(--font-public), system-ui, sans-serif" }}
    >
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b backdrop-blur" style={{ borderColor: "rgba(14,26,43,0.1)", background: "rgba(246,244,238,0.88)" }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md" style={{ background: INK }}>
              <Shield className="h-5 w-5" style={{ color: GOLD }} />
            </div>
            <span className={`${SERIF} text-xl font-semibold tracking-tight`}>SegurOS</span>
          </Link>
          <nav className={`${MONO} flex items-center gap-5 text-[12px] uppercase tracking-wider sm:gap-7`}>
            <a href="#coberturas" className="hidden text-slate-600 transition-colors hover:text-[#0E1A2B] sm:inline">Coberturas</a>
            <a href="#planes" className="hidden text-slate-600 transition-colors hover:text-[#0E1A2B] sm:inline">Planes</a>
            <a href="#letra-chica" className="hidden text-slate-600 transition-colors hover:text-[#0E1A2B] sm:inline">Letra chica</a>
            <Link href="/login" className="font-medium text-slate-700 transition-colors hover:text-[#0E1A2B]">Entrar</Link>
            <Link href="/registro" className="rounded-md px-3.5 py-2 font-semibold text-white transition-opacity hover:opacity-90" style={{ background: GREEN }}>
              7 días gratis
            </Link>
          </nav>
        </div>
      </header>

      <div className="sg-band h-2.5" aria-hidden />

      {/* HERO */}
      <section className="sg-guilloche relative overflow-hidden px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Eyebrow>Art. 00 · tu cartera al día</Eyebrow>
            <h1 className={`${SERIF} mt-5 text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl`}>
              Que no se te<br />venza una sola<br /><span style={{ color: GREEN }}>póliza</span> <span className="italic" style={{ color: GOLD }}>nunca más</span>.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed" style={{ color: "#42505f" }}>
              Pólizas, cobranzas, siniestros y vencimientos con aviso automático.
              Sin Excel, sin perderle el rastro a una renovación. Tu cartera, ordenada de verdad.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/registro"
                className={`${MONO} inline-flex items-center justify-center gap-2 rounded-md px-7 py-4 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:scale-[1.02]`}
                style={{ background: GREEN, boxShadow: `0 14px 30px -12px ${GREEN}` }}
              >
                Empezar 7 días gratis <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#planes" className={`${MONO} inline-flex items-center justify-center gap-2 rounded-md border px-7 py-4 text-xs uppercase tracking-wider transition-colors hover:border-[#0E1A2B]`} style={{ borderColor: "rgba(14,26,43,0.25)", color: INK }}>
                Ver planes
              </a>
            </div>
            <p className={`${MONO} mt-4 text-[11px] uppercase tracking-wider`} style={{ color: "#8a93a1" }}>Sin tarjeta · acceso PRO completo · 1 minuto</p>
          </div>

          {/* CERTIFICADO DE COBERTURA — firma de la página */}
          <div className="sg-cert-in mx-auto w-full max-w-md">
            <div className="sg-cert rounded-lg p-7" style={{ transform: "rotate(1.5deg)" }}>
              <div className={`${MONO} flex items-center justify-between text-[10px] uppercase tracking-[0.18em]`} style={{ color: GOLD }}>
                <span>Certificado de cobertura</span>
                <Shield className="h-4 w-4" />
              </div>
              <div className={`${SERIF} mt-2 text-lg font-semibold`}>Póliza vigente</div>
              <dl className={`${MONO} mt-4 space-y-2.5 text-[12px]`}>
                {[
                  ["Póliza N°", "04-118827"],
                  ["Asegurado", "Gómez, Juan A."],
                  ["Ramo", "Automotor"],
                  ["Vigencia", "01/06/26 → 01/06/27"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4">
                    <dt className="uppercase tracking-wider" style={{ color: "#7c8492" }}>{k}</dt>
                    <dd className="font-medium" style={{ color: INK }}>{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="sg-rule my-5" />
              <div className="flex items-end justify-between">
                <div>
                  <div className={`${MONO} text-[10px] uppercase tracking-wider`} style={{ color: "#7c8492" }}>Prima mensual</div>
                  <div className={`${SERIF} text-2xl font-semibold`}>$48.500</div>
                </div>
                <Seal />
              </div>
            </div>
            <p className={`${MONO} mt-5 text-center text-[10px] uppercase tracking-[0.18em]`} style={{ color: "#8a93a1" }}>
              Tu cartera, sin una sola póliza vencida
            </p>
          </div>
        </div>

        <div className={`${MONO} mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-md border text-center`} style={{ borderColor: "rgba(14,26,43,0.12)", background: "rgba(14,26,43,0.08)" }}>
          {[["100%", "multi-tenant"], ["0", "pólizas perdidas"], ["24/7", "tu cartera"]].map(([v, l]) => (
            <div key={l} className="px-3 py-4" style={{ background: PAPER }}>
              <div className={`${SERIF} text-3xl font-semibold`} style={{ color: GREEN }}>{v}</div>
              <div className="mt-1 text-[10px] uppercase tracking-wider" style={{ color: "#7c8492" }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="sg-band h-2.5" aria-hidden />

      {/* EL RIESGO */}
      <section id="riesgo" className="px-4 py-20 sm:px-6" style={{ background: INK }}>
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <span className={`${MONO} inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[0.22em]`} style={{ color: GOLD }}>
              <span className="inline-block h-px w-7" style={{ background: GOLD }} /> Art. 01 · el riesgo
            </span>
            <h2 className={`${SERIF} mt-4 text-4xl font-semibold text-white md:text-5xl`}>Lo que pasa sin un sistema</h2>
            <p className="mt-3" style={{ color: "#9aa6b4" }}>Con que te haya pasado uno solo, ya sabés de qué hablamos.</p>
          </div>
          <div className="mt-10 grid gap-3 md:grid-cols-2">
            {RIESGOS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-4 rounded-lg p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: OXBLOOD }} />
                <p className="text-sm leading-relaxed" style={{ color: "#c9d2dc" }}>{text}</p>
              </div>
            ))}
          </div>
          <p className={`${MONO} mt-8 text-center text-[11px] uppercase tracking-wider`} style={{ color: "#7c8492" }}>
            La cobertura → un sistema hecho para tu agencia
          </p>
        </div>
      </section>

      {/* COBERTURAS (features) */}
      <section id="coberturas" className="sg-guilloche px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <Eyebrow>Art. 02 · la cobertura</Eyebrow>
            <h2 className={`${SERIF} mt-4 text-4xl font-semibold md:text-5xl`}>Todo lo que necesita un broker</h2>
            <p className="mx-auto mt-3 max-w-xl" style={{ color: "#5a6675" }}>Pensado por gente que vivió la operación diaria de una agencia.</p>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border sm:grid-cols-2 lg:grid-cols-4" style={{ borderColor: "rgba(14,26,43,0.12)", background: "rgba(14,26,43,0.1)" }}>
            {COBERTURAS.map(({ cod, icon: Icon, title, text }) => (
              <div key={title} className="group p-6 transition-colors hover:bg-[#FBFAF5]" style={{ background: PAPER }}>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md" style={{ background: "rgba(27,94,74,0.1)" }}>
                    <Icon className="h-5 w-5" style={{ color: GREEN }} />
                  </div>
                  <span className={`${MONO} text-xs`} style={{ color: GOLD }}>{cod}</span>
                </div>
                <h3 className={`${SERIF} mt-4 text-lg font-semibold`}>{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "#5a6675" }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="sg-band h-2.5" aria-hidden />

      {/* PLANES (pricing) */}
      <section id="planes" className="px-4 py-20 sm:px-6" style={{ background: "#EFECE2" }}>
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <Eyebrow>Art. 03 · la prima</Eyebrow>
            <h2 className={`${SERIF} mt-4 text-4xl font-semibold md:text-5xl`}>Planes simples, sin letra chica acá</h2>
            <p className="mt-3" style={{ color: "#5a6675" }}>7 días gratis sin tarjeta. Después elegís el plan que mejor te quede.</p>
          </div>

          {/* PROMO destacada — póliza de lanzamiento */}
          <div className="sg-cert relative mt-10 overflow-hidden rounded-xl p-7 sm:p-9" style={{ transform: "none" }}>
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
              <div className="min-w-0 flex-1">
                <span className={`${MONO} inline-block rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white`} style={{ background: OXBLOOD }}>
                  Promo de lanzamiento
                </span>
                <h3 className={`${SERIF} mt-3 text-3xl font-semibold`}>$25.000/mes los primeros 3 meses</h3>
                <p className="mt-1.5 text-sm" style={{ color: "#5a6675" }}>Después se renueva como PRO Mensual ($45.000). Cancelás cuando quieras.</p>
                <ul className={`${MONO} mt-4 grid gap-x-6 gap-y-1.5 text-[12px] sm:grid-cols-2`} style={{ color: "#42505f" }}>
                  {["Acceso PRO completo", "Sin límites en nada", "Usuarios ilimitados", "Soporte prioritario"].map((f) => (
                    <li key={f} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 flex-shrink-0" style={{ color: GREEN }} /> {f}</li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col items-start gap-3 md:items-end">
                <div className={`${SERIF} text-5xl font-semibold`} style={{ color: GREEN }}>$25.000</div>
                <Link href="/registro" className={`${MONO} inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:scale-[1.02]`} style={{ background: GREEN }}>
                  Empezar gratis <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <p className={`${MONO} mt-10 text-center text-[11px] uppercase tracking-wider`} style={{ color: "#7c8492" }}>o elegí el plan PRO directo</p>

          <div className="mx-auto mt-8 grid max-w-3xl gap-5 md:grid-cols-2">
            {/* PRO MENSUAL */}
            <div className="sg-cert relative rounded-xl p-7" style={{ transform: "none" }}>
              <span className={`${MONO} absolute -top-3 left-7 rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white`} style={{ background: GREEN }}>Más elegido</span>
              <p className={`${MONO} text-[11px] uppercase tracking-widest`} style={{ color: GREEN }}>PRO Mensual</p>
              <p className={`${SERIF} mt-2 text-4xl font-semibold`}>$45.000</p>
              <p className={`${MONO} text-[11px] uppercase tracking-wider`} style={{ color: "#7c8492" }}>por mes · suscripción recurrente</p>
              <ul className="mt-5 space-y-2 text-sm" style={{ color: "#42505f" }}>
                {["Pólizas, cobranzas y siniestros ilimitados", "Usuarios ilimitados", "Email masivo a tus asegurados", "Soporte prioritario", "Cancelás cuando quieras"].map((f) => (
                  <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: GREEN }} /> {f}</li>
                ))}
              </ul>
              <Link href="/registro" className={`${MONO} mt-6 block rounded-md py-3 text-center text-xs font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-90`} style={{ background: GREEN }}>Empezar gratis</Link>
            </div>
            {/* PRO ANUAL */}
            <div className="sg-cert relative rounded-xl p-7" style={{ transform: "none" }}>
              <span className={`${MONO} absolute -top-3 left-7 inline-flex items-center gap-1 rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white`} style={{ background: GOLD }}>Ahorrás $70.000</span>
              <p className={`${MONO} text-[11px] uppercase tracking-widest`} style={{ color: GOLD }}>PRO Anual</p>
              <p className={`${SERIF} mt-2 text-4xl font-semibold`}>$470.000</p>
              <p className={`${MONO} text-[11px] uppercase tracking-wider`} style={{ color: "#7c8492" }}>por año · equivale a $39.166/mes</p>
              <ul className="mt-5 space-y-2 text-sm" style={{ color: "#42505f" }}>
                {["Todo lo del PRO Mensual", "Precio congelado 12 meses", "Un solo pago, sin renovaciones", "Ideal si ya estás convencido"].map((f) => (
                  <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: GOLD }} /> {f}</li>
                ))}
              </ul>
              <Link href="/registro" className={`${MONO} mt-6 block rounded-md border py-3 text-center text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-[#FBFAF5]`} style={{ borderColor: GOLD, color: INK }}>Empezar gratis</Link>
            </div>
          </div>

          <p className={`${MONO} mt-8 text-center text-[10px] uppercase tracking-wider`} style={{ color: "#8a93a1" }}>
            Todos los planes arrancan con 7 días gratis · pagás recién si decidís seguir
          </p>
        </div>
      </section>

      {/* LETRA CHICA (FAQ) */}
      <section id="letra-chica" className="sg-guilloche px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <Eyebrow>Art. 04 · la letra chica</Eyebrow>
            <h2 className={`${SERIF} mt-4 text-4xl font-semibold`}>Sin sorpresas. Acá está todo.</h2>
          </div>
          <div className="mt-10 space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-lg border p-5" style={{ borderColor: "rgba(14,26,43,0.12)", background: "#FBFAF5" }}>
                <summary className={`${MONO} flex cursor-pointer list-none items-center justify-between gap-3 text-[13px] font-semibold uppercase tracking-wide`} style={{ color: INK }}>
                  {f.q}
                  <span className="text-xl leading-none transition-transform group-open:rotate-45" style={{ color: GOLD }}>+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "#5a6675" }}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-4 py-24 text-center sm:px-6" style={{ background: INK }}>
        <div className="mx-auto max-w-2xl">
          <div className="mb-7 flex justify-center"><Seal label="Al día" /></div>
          <h2 className={`${SERIF} text-4xl font-semibold text-white md:text-5xl`}>
            Tu cartera, <span className="italic" style={{ color: GOLD }}>asegurada</span> contra el olvido.
          </h2>
          <p className="mt-4" style={{ color: "#9aa6b4" }}>7 días gratis, sin tarjeta. Acceso PRO completo desde el día uno.</p>
          <Link href="/registro" className={`${MONO} mt-8 inline-flex items-center gap-2 rounded-md px-9 py-4 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:scale-[1.02]`} style={{ background: GREEN, boxShadow: `0 16px 36px -14px ${GREEN}` }}>
            Crear mi cuenta gratis <ArrowRight className="h-4 w-4" />
          </Link>
          <p className={`${MONO} mt-4 text-[10px] uppercase tracking-wider`} style={{ color: "#6b7888" }}>Sin tarjeta · sin compromiso · 1 minuto</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t px-4 py-9 sm:px-6" style={{ background: PAPER, borderColor: "rgba(14,26,43,0.1)" }}>
        <div className={`${MONO} mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-[11px] uppercase tracking-wider sm:flex-row`} style={{ color: "#7c8492" }}>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" style={{ color: GREEN }} />
            <span>© {new Date().getFullYear()} SegurOS — un producto de TusVentas</span>
          </div>
          <div className="flex gap-5">
            <Link href="/login" className="transition-colors hover:text-[#0E1A2B]">Entrar</Link>
            <Link href="/registro" className="transition-colors hover:text-[#0E1A2B]">Registrarse</Link>
            <Link href="/terminos" className="transition-colors hover:text-[#0E1A2B]">Términos</Link>
            <a href="mailto:segurosos@tusventas.com.ar" className="transition-colors hover:text-[#0E1A2B]">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
