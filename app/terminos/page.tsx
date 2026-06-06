// Página pública de Términos y Condiciones + Política de Privacidad.
// Versión "2026-06" — debe sincronizarse con TERMINOS_VERSION del BE.
//
// Linkeada desde:
//   - footer de la landing
//   - checkbox del registro
//   - confirmación de baja en /admin/settings/catalogos

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Términos y Condiciones — SegurOS",
}

const VERSION = "2026-06"
const VIGENTE_DESDE = "5 de junio de 2026"

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
          <span className="text-[11px] text-slate-400 uppercase tracking-wider">v {VERSION}</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Términos y Condiciones de Uso · Política de Privacidad</h1>
        <p className="text-sm text-slate-500 mt-2">
          Versión {VERSION} — vigente desde el {VIGENTE_DESDE}.
        </p>

        <div className="prose prose-slate prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-xl prose-h2:mt-10 prose-h3:text-base prose-h3:mt-6 prose-p:leading-relaxed prose-li:leading-relaxed max-w-none mt-8">
          <h2>1. Aceptación</h2>
          <p>
            Al crear una cuenta en <strong>SegurOS</strong> (seguros.tusventas.com.ar), un servicio operado por <strong>TusVentas</strong>{" "}
            (Argentina), aceptás estos Términos y la Política de Privacidad que forma parte de los mismos. Si no estás de acuerdo, no debés crear ni usar la cuenta.
          </p>

          <h2>2. Servicio</h2>
          <p>
            SegurOS es un software como servicio (SaaS) que permite a brokers de seguros (en adelante, <strong>el Broker</strong>) gestionar
            su cartera: clientes, pólizas, cobranzas, siniestros, seguimiento de prospectos, recordatorios automáticos y reportes.
          </p>
          <p>
            El servicio se brinda <em>"tal cual"</em> sobre la disponibilidad razonable del sistema (objetivo 99% mensual, sin SLA contractual).
          </p>

          <h2>3. Cuenta y responsabilidades del Broker</h2>
          <ul>
            <li>El Broker es responsable de mantener la confidencialidad de su usuario y contraseña.</li>
            <li>El Broker es el <strong>responsable del tratamiento</strong> de los datos personales de sus propios clientes en los términos de la <strong>Ley 25.326 de Protección de Datos Personales</strong> y normativa vigente.</li>
            <li>El Broker se compromete a cargar y tratar únicamente datos para los cuales tiene base legal (consentimiento, ejecución de contrato, etc.).</li>
            <li>El Broker se compromete a no usar SegurOS para fines ilícitos, ofensivos, o que infrinjan derechos de terceros.</li>
          </ul>

          <h2>4. Rol de SegurOS · Encargado del Tratamiento</h2>
          <p>
            SegurOS actúa como <strong>Encargado del Tratamiento</strong> de los datos cargados por el Broker. Esto significa que:
          </p>
          <ul>
            <li>Solo accedemos a esos datos para operar el sistema (almacenamiento, backups, soporte técnico bajo pedido del Broker).</li>
            <li>No usamos esos datos para fines comerciales propios ni los compartimos con terceros, salvo obligación legal.</li>
            <li>Implementamos medidas técnicas razonables para protegerlos (ver Sección 6).</li>
          </ul>

          <h2>5. Aislamiento entre Brokers</h2>
          <p>
            Cada cuenta de SegurOS funciona en <strong>aislamiento multi-tenant</strong>: las consultas a la base de datos están filtradas por
            un identificador único de cuenta (<code>aseguradoraId</code>) en todos los endpoints. Ningún Broker puede ver, leer ni modificar
            datos de otro Broker. Tenemos pruebas automatizadas que validan este aislamiento.
          </p>

          <h2>6. Seguridad</h2>
          <ul>
            <li>Transferencia de datos cifrada con TLS/HTTPS.</li>
            <li>Contraseñas almacenadas con hash bcrypt (no las vemos en texto claro).</li>
            <li>Autenticación por token JWT con expiración.</li>
            <li>Servidor en datacenter ubicado en Argentina, con firewall y acceso restringido por SSH.</li>
            <li>Backup automático diario de la base de datos.</li>
            <li>Acceso del equipo técnico a datos de cuentas únicamente cuando el Broker lo solicita expresamente para soporte; toda intervención queda registrada.</li>
          </ul>
          <p>
            Ningún sistema es 100 % invulnerable. En caso de detectar un incidente de seguridad relevante, lo informaremos al Broker afectado a la brevedad razonable.
          </p>

          <h2>7. Planes, pagos y trial</h2>
          <ul>
            <li>SegurOS ofrece un período de prueba gratuita de <strong>7 días</strong> sin requerir tarjeta.</li>
            <li>Finalizado el trial, el Broker puede contratar un plan pago. Los precios y características vigentes se publican en /precios.</li>
            <li>Los pagos se procesan a través de <strong>MercadoPago</strong>. SegurOS no almacena datos de tarjeta de crédito en sus servidores.</li>
            <li>Las suscripciones mensuales se cobran de forma recurrente y se pueden cancelar en cualquier momento desde el panel.</li>
          </ul>

          <h2>8. Derecho de exportación de datos</h2>
          <p>
            El Broker puede <strong>descargar en cualquier momento</strong> una copia completa de sus datos desde el panel
            (Configuración → Mis datos → Exportar). La descarga incluye un archivo ZIP con CSVs de clientes, pólizas, cobranzas,
            siniestros, prospectos y usuarios.
          </p>

          <h2>9. Derecho de baja y borrado</h2>
          <p>
            El Broker puede dar de baja la cuenta en cualquier momento desde el panel (Configuración → Mis datos → Dar de baja).
            El flujo es:
          </p>
          <ol>
            <li>El Broker confirma la baja escribiendo <code>BAJA &lt;slug-del-broker&gt;</code>.</li>
            <li>La cuenta queda <strong>deshabilitada inmediatamente</strong> y nadie puede iniciar sesión.</li>
            <li>Los datos quedan en una cuarentena de <strong>30 días</strong> durante los cuales el Broker puede revertir la baja.</li>
            <li>Pasados los 30 días, se borran físicamente todos los datos del Broker (clientes, pólizas, cobranzas, siniestros, usuarios, notificaciones). Esta acción es <strong>irreversible</strong>.</li>
            <li>Los backups que contengan datos del Broker se rotan en el ciclo de purga estándar (~30 días) y por lo tanto no contienen datos del Broker más allá de ese plazo.</li>
            <li>Se conserva únicamente un registro mínimo de auditoría (nombre comercial, fecha de alta, fecha de baja) por las obligaciones contables y legales.</li>
            <li>El Broker recibe un email de confirmación cuando se completa la purga.</li>
          </ol>

          <h2>10. Derechos del titular de los datos (Ley 25.326)</h2>
          <p>
            Los clientes finales del Broker (cuyos datos están cargados en SegurOS) tienen los derechos de Acceso, Rectificación y Supresión.
            Estos derechos se ejercen <strong>frente al Broker</strong>, que es el responsable del tratamiento.
          </p>
          <p>
            SegurOS, como Encargado del Tratamiento, colaborará con el Broker para satisfacer estas solicitudes (eliminación puntual de un
            cliente, exportación parcial, etc.) cuando éste lo requiera.
          </p>

          <h2>11. Propiedad intelectual</h2>
          <p>
            El software, el diseño, la marca y los textos de SegurOS son propiedad de TusVentas. El Broker conserva la propiedad sobre los
            datos que carga.
          </p>

          <h2>12. Limitación de responsabilidad</h2>
          <p>
            SegurOS no será responsable por pérdidas indirectas, lucro cesante o daños derivados del uso o imposibilidad de uso del
            servicio, salvo los casos de dolo o culpa grave establecidos por la ley aplicable. La responsabilidad agregada de SegurOS frente
            al Broker se limita al monto efectivamente pagado por el Broker en los últimos 12 meses.
          </p>

          <h2>13. Modificaciones</h2>
          <p>
            SegurOS puede actualizar estos Términos. Cuando haya cambios sustanciales, lo notificaremos por email y se mostrará en el panel
            la nueva versión para su aceptación. La versión actual está identificada en el encabezado de este documento.
          </p>

          <h2>14. Legislación y jurisdicción</h2>
          <p>
            Estos Términos se rigen por las leyes de la República Argentina. Para cualquier controversia, las partes se someten a los
            tribunales ordinarios con asiento en la Ciudad Autónoma de Buenos Aires, renunciando a todo otro fuero.
          </p>

          <h2>15. Contacto</h2>
          <p>
            Para cualquier consulta sobre estos Términos, ejercicio de derechos o reportes de seguridad, escribinos a{" "}
            <a href="mailto:seguros@tusventas.com.ar">seguros@tusventas.com.ar</a>.
          </p>
        </div>

        <div className="mt-12 p-4 rounded-xl border bg-slate-50 text-sm text-slate-600">
          ¿Querés una copia de este documento para tu archivo? Imprimí esta página o guardala como PDF desde tu navegador.
        </div>
      </main>

      <footer className="border-t mt-16">
        <div className="max-w-3xl mx-auto px-4 py-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} SegurOS — un producto de TusVentas.</span>
          <Link href="/" className="hover:text-slate-900">Volver al sitio</Link>
        </div>
      </footer>
    </div>
  )
}
