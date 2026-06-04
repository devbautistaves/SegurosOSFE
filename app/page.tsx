import Link from "next/link"
import {
  Shield, ArrowRight, Check, Zap, Users, Bell,
  FileText, CreditCard, AlertTriangle, BarChart3, Smartphone, Crown,
} from "lucide-react"

const features = [
  { icon: FileText,       title: "Pólizas",           text: "Cargá, renovás y anulás pólizas con todos sus datos. Búsqueda instantánea." },
  { icon: CreditCard,     title: "Cobranzas",         text: "Control mes a mes de cuotas: cobradas, vencidas, compromisos. Recordatorios por email y WhatsApp." },
  { icon: AlertTriangle,  title: "Siniestros",        text: "Registrá y trackeá el ciclo completo de cada siniestro con su número y estado." },
  { icon: Users,          title: "Multi-usuario",     text: "Invitá a tu equipo con roles (admin, vendedor, soporte). Cada uno con sus permisos." },
  { icon: Bell,           title: "Notificaciones",    text: "Vencimientos automáticos, alertas de cuotas vencidas, anuncios internos." },
  { icon: BarChart3,      title: "Dashboard",         text: "Cartera total, vigentes, anuladas, cobranzas del mes — todo en una pantalla." },
  { icon: Zap,            title: "Catálogos propios", text: "Cargá las aseguradoras y ramos que vos vendés. SegurOS no te impone listas cerradas." },
  { icon: Smartphone,     title: "Funciona en móvil", text: "Instalable como app (PWA) en Android, iOS, Mac y Windows." },
]

const faqs = [
  { q: "¿Es gratis?",                    a: "El plan FREE te deja cargar 1 póliza, 1 cobranza, 1 siniestro y 1 usuario para evaluar el sistema. Para uso real necesitás el plan PRO." },
  { q: "¿Mis datos quedan aislados?",    a: "Sí. Cada cuenta es 100% multi-tenant: ningún otro broker puede ver tus clientes, pólizas o cobranzas." },
  { q: "¿Puedo cancelar cuando quiera?", a: "Sí. La suscripción se cancela desde el panel y mantenés acceso PRO hasta el vencimiento." },
  { q: "¿Cómo pago el plan PRO?",        a: "Con MercadoPago, tarjeta o transferencia. Procesamiento seguro, sin guardar datos de tarjeta en nuestro sistema." },
  { q: "¿Quién soporta SegurOS?",        a: "TusVentas, una empresa argentina con experiencia en CRMs para brokers de seguros." },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">SegurOS</span>
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6 text-sm">
            <a href="#features" className="hidden sm:inline text-slate-600 hover:text-slate-900">Funciones</a>
            <a href="#pricing"  className="hidden sm:inline text-slate-600 hover:text-slate-900">Precios</a>
            <a href="#faq"      className="hidden sm:inline text-slate-600 hover:text-slate-900">Preguntas</a>
            <Link href="/login" className="text-slate-700 hover:text-slate-900 font-medium">Entrar</Link>
            <Link href="/registro" className="rounded-md bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 font-semibold transition-colors">
              Probar gratis
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, #3b82f6 0%, transparent 50%)" }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 mb-6 uppercase tracking-wider">
            <Zap className="h-3 w-3" /> CRM SaaS para brokers de seguros
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold leading-tight tracking-tight max-w-3xl mx-auto">
            Tu cartera de seguros, <span className="text-blue-600">ordenada de verdad</span>.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Pólizas, cobranzas, siniestros y recordatorios automáticos. Sin Excel, sin perderle el rastro a las renovaciones.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/registro" className="rounded-md bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-colors">
              Empezá gratis <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="#features" className="rounded-md border border-slate-300 hover:border-slate-400 text-slate-700 px-6 py-3 font-semibold transition-colors">
              Ver cómo funciona
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">Sin tarjeta. Plan FREE para siempre. Tardás 1 minuto.</p>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Todo lo que necesita un broker</h2>
            <p className="mt-3 text-slate-600">Pensado por gente que vivió la operación diaria de una agencia.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 mb-3">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Precios simples</h2>
            <p className="mt-3 text-slate-600">Arrancá gratis y subí a PRO cuando lo necesites.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {/* FREE */}
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">FREE</p>
              <p className="text-4xl font-bold mt-2">$0</p>
              <p className="text-sm text-slate-500">para siempre</p>
              <ul className="mt-5 space-y-2 text-sm">
                <li className="flex gap-2"><Check className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" /> 1 póliza de prueba</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" /> 1 cobranza, 1 siniestro</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" /> 1 usuario admin</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" /> Acceso a todas las funciones</li>
                <li className="flex gap-2 text-slate-500"><Check className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" /> Ideal para evaluar el sistema</li>
              </ul>
              <Link href="/registro" className="w-full mt-6 block text-center rounded-md border border-slate-300 hover:border-slate-400 px-4 py-2.5 font-semibold transition-colors">
                Empezar gratis
              </Link>
            </div>
            {/* PRO MENSUAL */}
            <div className="rounded-2xl border-2 border-blue-600 bg-white p-6 relative shadow-xl shadow-blue-600/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                Recomendado
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">PRO Mensual</p>
              <p className="text-4xl font-bold mt-2">$45.000</p>
              <p className="text-sm text-slate-500">por mes</p>
              <ul className="mt-5 space-y-2 text-sm">
                <li className="flex gap-2"><Check className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" /> Pólizas ilimitadas</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" /> Cobranzas y siniestros ilimitados</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" /> Usuarios ilimitados</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" /> Soporte prioritario</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" /> Cancelás cuando quieras</li>
              </ul>
              <Link href="/registro" className="w-full mt-6 block text-center rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 font-semibold transition-colors">
                Probar PRO
              </Link>
            </div>
            {/* PRO ANUAL */}
            <div className="rounded-2xl border-2 border-amber-300 bg-white p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
                <Crown className="h-3 w-3" /> Ahorrás 2 meses
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">PRO Anual</p>
              <p className="text-4xl font-bold mt-2">$470.000</p>
              <p className="text-sm text-slate-500">por año ($39.166/mes)</p>
              <ul className="mt-5 space-y-2 text-sm">
                <li className="flex gap-2"><Check className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" /> Todo lo de PRO Mensual</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" /> Ahorrás $70.000 por año</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" /> Precio congelado 12 meses</li>
              </ul>
              <Link href="/registro" className="w-full mt-6 block text-center rounded-md bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 font-semibold transition-colors">
                Elegir anual
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Preguntas frecuentes</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-lg border border-slate-200 p-4 open:bg-slate-50">
                <summary className="cursor-pointer list-none flex items-center justify-between font-semibold">
                  {f.q}
                  <span className="text-slate-400 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Probalo gratis ahora</h2>
          <p className="mt-3 text-blue-100">Tardás 1 minuto. Sin tarjeta. Empezá a cargar tu primera póliza hoy.</p>
          <Link href="/registro" className="inline-flex items-center gap-2 mt-7 rounded-md bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 font-semibold transition-colors">
            Crear mi cuenta gratis <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t bg-slate-50 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <span>© {new Date().getFullYear()} SegurOS — un producto de TusVentas.</span>
          </div>
          <div className="flex gap-5">
            <Link href="/login" className="hover:text-slate-900">Entrar</Link>
            <Link href="/registro" className="hover:text-slate-900">Registrarse</Link>
            <a href="mailto:segurosos@tusventas.com.ar" className="hover:text-slate-900">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
