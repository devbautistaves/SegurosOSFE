"use client"

// FASE 2 del onboarding: cargá tu primera póliza con datos REALES (los tuyos
// o los de un cliente). Wizard de 4 sub-steps:
//   0. Asegurado (con CTA "usar mi mail" para autocompletar y poder recibir
//      el aviso de cobranza vos mismo en Fase 3)
//   1. Datos de la póliza (aseguradora + ramo del catálogo, número, vigencia)
//   2. Vehículo / objeto (solo si ramo es auto/moto)
//   3. Cobranza (medio de pago + día vto)
//
// Al final POST /api/seguros/polizas. El BE crea automáticamente la cobranza
// asociada si medioDePago ∈ {CUPON, EFECTIVO}. Forzamos default EFECTIVO para
// que Fase 3 tenga una fila que notificar.

import { useEffect, useState } from "react"
import { ChevronRight, FileText, User, Car, CreditCard, Mail, AlertCircle, Sparkles } from "lucide-react"
import { aseguradoraAPI, segurosAPI } from "@/lib/api"

interface Props {
  initialSubStep?: number
  onSubStepChange: (subStep: number) => void
  onPolizaCreada: (polizaId: string, esPrueba: boolean) => void
  onPrevFase: () => void
}

interface DraftPoliza {
  // Asegurado
  nombreApellido: string
  dni: string
  email: string
  celular: string
  domicilio: string
  localidad: string
  // Poliza
  aseguradora: string
  ramo: string
  numPoliza: string
  tipoCobertura: string
  fechaInicVig: string  // YYYY-MM-DD
  fechaFinVig: string
  // Vehiculo (opcional)
  patente: string
  chasis: string
  motor: string
  gnc: boolean
  // Cobranza
  medioDePago: "EFECTIVO" | "CUPON" | "CBU" | "TARJ_CRED" | "OTRO"
}

const RAMOS_VEHICULO = ["AUTOS","MOTOS","FLOTA_AUTOMOTOR","REMISES","TRANSPORTE_CARGAS"]

const SUB_STEPS = [
  { key: "asegurado", title: "Datos del asegurado",     desc: "Quién es tu cliente." },
  { key: "poliza",    title: "Datos de la póliza",      desc: "Qué cubrís." },
  { key: "vehiculo",  title: "Datos del vehículo",      desc: "Si la póliza es de auto/moto." },
  { key: "cobranza",  title: "Cómo y cuándo cobrás",    desc: "Para armar la cobranza automática." },
] as const

const TODAY = new Date().toISOString().slice(0, 10)
const ONE_YEAR = (() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toISOString().slice(0, 10) })()

const INITIAL: DraftPoliza = {
  nombreApellido: "", dni: "", email: "", celular: "", domicilio: "", localidad: "",
  aseguradora: "", ramo: "", numPoliza: "", tipoCobertura: "",
  fechaInicVig: TODAY, fechaFinVig: ONE_YEAR,
  patente: "", chasis: "", motor: "", gnc: false,
  medioDePago: "EFECTIVO",
}

export function FasePrimerPoliza({ initialSubStep = 0, onSubStepChange, onPolizaCreada, onPrevFase }: Props) {
  const [draft, setDraft] = useState<DraftPoliza>(INITIAL)
  const [subStep, setSubStep] = useState(initialSubStep)
  const [aseguradoras, setAseguradoras] = useState<string[]>([])
  const [ramos, setRamos] = useState<string[]>([])
  const [userEmail, setUserEmail] = useState("")
  const [isPrueba, setIsPrueba] = useState(false)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState("")

  // Cargar catálogos + email del admin (para el "usar mi mail")
  useEffect(() => {
    const token = localStorage.getItem("token") || ""
    if (!token) return
    aseguradoraAPI.getCatalogos(token).then(r => {
      setAseguradoras(r.aseguradorasCatalogo || [])
      setRamos(r.ramosCatalogo || [])
    }).catch(() => {})
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}")
      if (u?.email) setUserEmail(u.email)
    } catch {}
  }, [])

  useEffect(() => { onSubStepChange(subStep) }, [subStep, onSubStepChange])

  const current = SUB_STEPS[subStep]
  const isVehiculoStep = current.key === "vehiculo"
  const skipVehiculo = !RAMOS_VEHICULO.includes(draft.ramo)
  const isLast = subStep === SUB_STEPS.length - 1

  // Validación liviana por step
  const validateCurrent = (): string | null => {
    if (current.key === "asegurado") {
      if (!draft.nombreApellido.trim()) return "Indicá el nombre del asegurado"
      if (draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) return "Email inválido"
    }
    if (current.key === "poliza") {
      if (!draft.fechaFinVig) return "La fecha de fin de vigencia es obligatoria"
      if (new Date(draft.fechaFinVig) <= new Date(draft.fechaInicVig)) return "La fecha de fin tiene que ser posterior al inicio"
    }
    return null
  }

  const next = async () => {
    const v = validateCurrent()
    if (v) { setErr(v); return }
    setErr("")
    // Skip step Vehículo si el ramo no aplica
    let target = subStep + 1
    if (target === 2 && skipVehiculo) target = 3
    if (subStep === 2 || isLast) {
      // En el último step (o post-vehículo si saltamos), nada que hacer hasta el final
    }
    if (target >= SUB_STEPS.length) {
      return submitFinal()
    }
    setSubStep(target)
  }

  const back = () => {
    if (subStep === 0) { onPrevFase(); return }
    let target = subStep - 1
    if (target === 2 && skipVehiculo) target = 1
    setSubStep(target)
  }

  const submitFinal = async () => {
    setSaving(true); setErr("")
    try {
      const token = localStorage.getItem("token") || ""
      if (!token) throw new Error("Sin sesión")
      const body: any = {
        nombreApellido: draft.nombreApellido.trim(),
        dni: draft.dni || undefined,
        email: draft.email || undefined,
        celular: draft.celular || undefined,
        domicilio: draft.domicilio || undefined,
        localidad: draft.localidad || undefined,
        aseguradora: draft.aseguradora || undefined,
        ramo: draft.ramo || undefined,
        numPoliza: draft.numPoliza || undefined,
        tipoCobertura: draft.tipoCobertura || undefined,
        fechaInicVig: draft.fechaInicVig || undefined,
        fechaFinVig: draft.fechaFinVig,
        medioDePago: draft.medioDePago,
      }
      if (!skipVehiculo) {
        Object.assign(body, {
          patente: draft.patente || undefined,
          chasis: draft.chasis || undefined,
          motor: draft.motor || undefined,
          gnc: draft.gnc,
        })
      }
      const r = await segurosAPI.createPoliza(token, body)
      if (!r.success) throw new Error("No se pudo guardar la póliza")
      // Heurística: si el email coincide con el del admin → es póliza de prueba
      const esPrueba = !!(userEmail && draft.email && userEmail.toLowerCase() === draft.email.toLowerCase()) || isPrueba
      onPolizaCreada((r.poliza as any)._id, esPrueba)
    } catch (e: any) {
      setErr(e?.message || "No se pudo guardar la póliza")
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-1">
          Fase 2 · Primera póliza · {Math.min(subStep, SUB_STEPS.length - 1) + 1}/{SUB_STEPS.length}
        </p>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          {current.key === "asegurado" && <User className="h-6 w-6 text-blue-400" />}
          {current.key === "poliza" && <FileText className="h-6 w-6 text-blue-400" />}
          {current.key === "vehiculo" && <Car className="h-6 w-6 text-blue-400" />}
          {current.key === "cobranza" && <CreditCard className="h-6 w-6 text-blue-400" />}
          {current.title}
        </h2>
        <p className="text-sm text-slate-400 mt-1">{current.desc}</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
        {current.key === "asegurado" && (
          <StepAsegurado draft={draft} setDraft={setDraft} userEmail={userEmail} isPrueba={isPrueba} setIsPrueba={setIsPrueba} />
        )}
        {current.key === "poliza" && (
          <StepPoliza draft={draft} setDraft={setDraft} aseguradoras={aseguradoras} ramos={ramos} />
        )}
        {current.key === "vehiculo" && (
          skipVehiculo ? (
            <div className="text-center py-6 text-slate-400 text-sm">
              El ramo <b className="text-white">{draft.ramo}</b> no requiere datos de vehículo. Saltamos al siguiente paso.
            </div>
          ) : (
            <StepVehiculo draft={draft} setDraft={setDraft} />
          )
        )}
        {current.key === "cobranza" && (
          <StepCobranza draft={draft} setDraft={setDraft} />
        )}
      </div>

      {err && (
        <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded p-2 flex items-start gap-2">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" /> {err}
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={back} disabled={saving}
          className="px-4 py-2 rounded-lg border border-white/10 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-30">
          ← Atrás
        </button>
        <button onClick={next} disabled={saving}
          className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50">
          {saving ? "Guardando..." : (isLast ? <>Crear póliza <Sparkles className="h-4 w-4" /></> : <>Siguiente <ChevronRight className="h-4 w-4" /></>)}
        </button>
      </div>
    </div>
  )
}

// ── Sub-steps ────────────────────────────────────────────────────────────────

function StepAsegurado({ draft, setDraft, userEmail, isPrueba, setIsPrueba }: any) {
  const set = (k: keyof DraftPoliza, v: any) => setDraft((d: DraftPoliza) => ({ ...d, [k]: v }))
  const usarMiMail = () => {
    if (!userEmail) return
    set("email", userEmail)
    setIsPrueba(true)
  }
  return (
    <div className="space-y-3">
      {/* Tip clave del onboarding */}
      {userEmail && draft.email !== userEmail && (
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 flex items-start gap-2 text-xs">
          <Mail className="h-4 w-4 text-blue-300 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-blue-100">
            <p className="font-semibold">¿Querés ver cómo se ve el aviso de cobranza?</p>
            <p className="text-blue-200/70 mt-0.5">Poné tu propio mail como asegurado y vas a recibirlo vos mismo en el paso siguiente.</p>
          </div>
          <button onClick={usarMiMail}
            className="text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-1 rounded">
            Usar mi mail
          </button>
        </div>
      )}

      <Row>
        <Field label="Nombre y apellido *">
          <input value={draft.nombreApellido} onChange={e => set("nombreApellido", e.target.value)}
            placeholder="Juan Carlos Pérez" className={inp} />
        </Field>
        <Field label="DNI">
          <input value={draft.dni} onChange={e => set("dni", e.target.value)} placeholder="30123456" className={inp} />
        </Field>
      </Row>

      <Row>
        <Field label="Email">
          <input value={draft.email} onChange={e => set("email", e.target.value)} placeholder="cliente@mail.com" className={inp} type="email" />
        </Field>
        <Field label="Celular">
          <input value={draft.celular} onChange={e => set("celular", e.target.value)} placeholder="+54 11 2345-6789" className={inp} />
        </Field>
      </Row>

      <Row>
        <Field label="Domicilio">
          <input value={draft.domicilio} onChange={e => set("domicilio", e.target.value)} placeholder="Av. Corrientes 1234" className={inp} />
        </Field>
        <Field label="Localidad">
          <input value={draft.localidad} onChange={e => set("localidad", e.target.value)} placeholder="CABA" className={inp} />
        </Field>
      </Row>
    </div>
  )
}

function StepPoliza({ draft, setDraft, aseguradoras, ramos }: any) {
  const set = (k: keyof DraftPoliza, v: any) => setDraft((d: DraftPoliza) => ({ ...d, [k]: v }))
  return (
    <div className="space-y-3">
      <Row>
        <Field label="Aseguradora">
          <select value={draft.aseguradora} onChange={e => set("aseguradora", e.target.value)} className={selectInp}>
            <option value="" className={optCls}>— Elegí una —</option>
            {aseguradoras.map((a: string) => <option key={a} value={a} className={optCls}>{a}</option>)}
          </select>
        </Field>
        <Field label="Ramo">
          <select value={draft.ramo} onChange={e => set("ramo", e.target.value)} className={selectInp}>
            <option value="" className={optCls}>— Elegí uno —</option>
            {ramos.map((r: string) => <option key={r} value={r} className={optCls}>{r}</option>)}
          </select>
        </Field>
      </Row>

      <Row>
        <Field label="Número de póliza">
          <input value={draft.numPoliza} onChange={e => set("numPoliza", e.target.value)} placeholder="POL-12345" className={inp} />
        </Field>
        <Field label="Tipo de cobertura">
          <input value={draft.tipoCobertura} onChange={e => set("tipoCobertura", e.target.value)} placeholder="Todo riesgo" className={inp} />
        </Field>
      </Row>

      <Row>
        <Field label="Vigencia desde">
          <input type="date" value={draft.fechaInicVig} onChange={e => set("fechaInicVig", e.target.value)} className={inp} />
        </Field>
        <Field label="Vigencia hasta *">
          <input type="date" value={draft.fechaFinVig} onChange={e => set("fechaFinVig", e.target.value)} className={inp} />
        </Field>
      </Row>
    </div>
  )
}

function StepVehiculo({ draft, setDraft }: any) {
  const set = (k: keyof DraftPoliza, v: any) => setDraft((d: DraftPoliza) => ({ ...d, [k]: v }))
  return (
    <div className="space-y-3">
      <Row>
        <Field label="Patente">
          <input value={draft.patente} onChange={e => set("patente", e.target.value.toUpperCase())} placeholder="AB123CD" className={inp} maxLength={10} />
        </Field>
        <Field label="Chasis">
          <input value={draft.chasis} onChange={e => set("chasis", e.target.value)} placeholder="N° de chasis" className={inp} />
        </Field>
      </Row>
      <Row>
        <Field label="Motor">
          <input value={draft.motor} onChange={e => set("motor", e.target.value)} placeholder="N° de motor" className={inp} />
        </Field>
        <Field label="GNC">
          <div className="h-10 flex items-center">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={draft.gnc} onChange={e => set("gnc", e.target.checked)}
                className="h-4 w-4 rounded accent-blue-500" />
              <span className="text-sm text-slate-300">Tiene GNC instalado</span>
            </label>
          </div>
        </Field>
      </Row>
    </div>
  )
}

function StepCobranza({ draft, setDraft }: any) {
  const set = (k: keyof DraftPoliza, v: any) => setDraft((d: DraftPoliza) => ({ ...d, [k]: v }))
  return (
    <div className="space-y-3">
      <Field label="Medio de pago">
        <select value={draft.medioDePago} onChange={e => set("medioDePago", e.target.value)} className={selectInp}>
          <option value="EFECTIVO" className={optCls}>Efectivo</option>
          <option value="CUPON" className={optCls}>Cupón</option>
          <option value="CBU" className={optCls}>Débito automático (CBU)</option>
          <option value="TARJ_CRED" className={optCls}>Tarjeta de crédito</option>
          <option value="OTRO" className={optCls}>Otro</option>
        </select>
      </Field>
      {!["EFECTIVO","CUPON"].includes(draft.medioDePago) && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-200">
          <p className="font-semibold">💡 Para que el siguiente paso (enviar el aviso de cobranza) funcione, el medio de pago tiene que ser <b>Efectivo</b> o <b>Cupón</b>.</p>
          <p className="text-amber-300/70 mt-1">Los pagos por débito/tarjeta los maneja directo la aseguradora y no requieren aviso de tu lado.</p>
        </div>
      )}
      <p className="text-[11px] text-slate-500">El sistema crea automáticamente una fila en Cobranzas con el día de vencimiento sacado de la vigencia desde. Después podés editar día y cuotas desde el panel de Cobranzas.</p>
    </div>
  )
}

// ── Helpers visuales ─────────────────────────────────────────────────────────

const inp = "w-full px-3 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
// Los <select> necesitan fondo SÓLIDO (no bg-white/[0.02] casi transparente),
// si no el popup nativo de opciones del navegador se ve blanco con texto blanco.
const selectInp = "w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500/50"
const optCls = "bg-slate-900 text-white"

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase tracking-wider text-slate-500">{label}</label>
      {children}
    </div>
  )
}
