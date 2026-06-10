"use client"

// Modal de eliminación masiva de aseguradoras con 2FA por email.
// Reusa el flujo de OTP del superadmin (purpose: delete_batch).
//
// 3 pasos:
//   1. Confirmar lista → POST /aseguradoras/delete-batch/request-otp
//   2. Ingresar código de 6 dígitos → POST /aseguradoras/delete-batch/confirm
//   3. Mostrar resultado por aseguradora (OK / error)

import { useState } from "react"
import { saAseguradoras } from "@/lib/superadmin-api"
import { AlertTriangle, Loader2, ShieldAlert, Trash2, X, Mail, KeyRound, Check } from "lucide-react"

type AsegLite = { _id: string; nombre: string; slug?: string; email?: string }

interface Props {
  aseguradoras: AsegLite[]
  onClose: () => void
  onSuccess: (result: any) => void
}

export function DeleteBatchModal({ aseguradoras, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<"request" | "confirm" | "ok">("request")
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")
  const [code, setCode] = useState("")
  const [sentTo, setSentTo] = useState("")
  const [result, setResult] = useState<any>(null)

  const ids = aseguradoras.map(a => a._id)

  const enviarCodigo = async () => {
    setLoading(true); setErr("")
    try {
      const r = await saAseguradoras.requestDeleteBatchOtp(ids)
      setSentTo(r.sentTo || r.email || "tu email")
      setStep("confirm")
    } catch (e: any) {
      setErr(e?.message || "No se pudo enviar el código")
    } finally { setLoading(false) }
  }

  const confirmar = async () => {
    if (!/^\d{6}$/.test(code)) { setErr("Ingresá el código de 6 dígitos"); return }
    setLoading(true); setErr("")
    try {
      const r = await saAseguradoras.confirmDeleteBatch(ids, code)
      setResult(r)
      setStep("ok")
    } catch (e: any) {
      setErr(e?.message || "No se pudo confirmar")
    } finally { setLoading(false) }
  }

  const finalizar = () => { onSuccess(result); onClose() }

  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border border-red-500/30 max-w-lg w-full text-white shadow-2xl">
        <div className="flex items-start justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h3 className="font-bold">Eliminar {aseguradoras.length} aseguradora{aseguradoras.length === 1 ? "" : "s"}</h3>
              <p className="text-xs text-slate-400">Verificación por email · acción irreversible</p>
            </div>
          </div>
          {step !== "ok" && (
            <button onClick={onClose} className="text-slate-500 hover:text-white p-1">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="p-5 space-y-4">
          {step === "request" && (
            <>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                <div className="text-xs text-red-200 leading-relaxed">
                  Vas a borrar <strong>{aseguradoras.length}</strong> aseguradora{aseguradoras.length === 1 ? "" : "s"} con
                  todos sus datos (usuarios, pólizas, cobranzas, siniestros, pagos). <strong>No se puede deshacer.</strong>
                </div>
              </div>

              <div className="max-h-44 overflow-auto rounded-lg border border-white/10 bg-black/30">
                <ul className="divide-y divide-white/5">
                  {aseguradoras.map(a => (
                    <li key={a._id} className="px-3 py-2 text-sm flex items-center gap-2">
                      <Trash2 className="h-3 w-3 text-red-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{a.nombre}</p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {a.slug ? <>{a.slug}{a.email ? ` · ${a.email}` : ""}</> : (a.email || "")}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> Te vamos a mandar un código de 6 dígitos al email del SuperAdmin.
              </p>

              {err && <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded p-2">{err}</div>}

              <div className="flex gap-2 pt-2">
                <button onClick={onClose}
                  className="flex-1 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 text-sm font-medium">
                  Cancelar
                </button>
                <button onClick={enviarCodigo} disabled={loading}
                  className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  Enviar código
                </button>
              </div>
            </>
          )}

          {step === "confirm" && (
            <>
              <div className="text-sm text-slate-300">
                Te mandamos un código de 6 dígitos a <strong className="text-white">{sentTo}</strong>.
                Ingresalo abajo para confirmar la eliminación.
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1.5 flex items-center gap-1">
                  <KeyRound className="h-3 w-3" /> Código
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
                  onKeyDown={(e) => e.key === "Enter" && confirmar()}
                  placeholder="••••••"
                  className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white text-2xl font-mono text-center tracking-[0.5em] placeholder-slate-700 focus:outline-none focus:border-red-500/50"
                  autoFocus
                />
                <p className="text-[11px] text-slate-500 mt-1.5">El código vence en 10 minutos.</p>
              </div>

              {err && <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded p-2">{err}</div>}

              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep("request")}
                  className="flex-1 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 text-sm font-medium">
                  Atrás
                </button>
                <button onClick={confirmar} disabled={loading || code.length !== 6}
                  className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Eliminar definitivamente
                </button>
              </div>
            </>
          )}

          {step === "ok" && result && (
            <>
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="h-14 w-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                  <Check className="h-7 w-7 text-emerald-400" />
                </div>
                <p className="text-lg font-bold">Eliminación completa</p>
                <p className="text-sm text-slate-300 text-center">
                  Se borraron <strong className="text-emerald-400">{result.eliminados}</strong> aseguradoras.
                  {result.fallidos > 0 && <> · Fallaron <strong className="text-red-400">{result.fallidos}</strong>.</>}
                </p>
              </div>

              <div className="max-h-44 overflow-auto rounded-lg border border-white/10 bg-black/30 text-xs">
                <table className="w-full">
                  <tbody>
                    {result.detalles.map((d: any) => (
                      <tr key={d.aseguradoraId} className="border-b border-white/5 last:border-0">
                        <td className="px-3 py-2 truncate text-slate-300">{d.nombre || d.aseguradoraId}</td>
                        <td className="px-3 py-2 text-right">
                          {d.ok ? <span className="text-emerald-400">OK</span> : <span className="text-red-400">{d.error || "Error"}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button onClick={finalizar}
                className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold">
                Listo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
