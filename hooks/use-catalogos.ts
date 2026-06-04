// SegurOS multi-tenant: catálogos por aseguradora.
// Lee de localStorage.aseguradora (hidratado por dashboard-layout al cargar y
// por settings/catalogos al guardar). Reacciona a "branding-updated".

"use client"

import { useEffect, useState } from "react"

interface CatalogosState {
  aseguradoras: string[]
  ramos: string[]
  mediosPago: string[]
}

function readFromStorage(defaultAseg: string[], defaultRamos: string[], defaultMedios: string[]): CatalogosState {
  if (typeof window === "undefined") return { aseguradoras: defaultAseg, ramos: defaultRamos, mediosPago: defaultMedios }
  try {
    const raw = localStorage.getItem("aseguradora")
    if (!raw) return { aseguradoras: defaultAseg, ramos: defaultRamos, mediosPago: defaultMedios }
    const a = JSON.parse(raw)
    return {
      aseguradoras: Array.isArray(a.aseguradorasCatalogo) && a.aseguradorasCatalogo.length ? a.aseguradorasCatalogo : defaultAseg,
      ramos: Array.isArray(a.ramosCatalogo) && a.ramosCatalogo.length ? a.ramosCatalogo : defaultRamos,
      mediosPago: Array.isArray(a.medioDePagoCatalogo) && a.medioDePagoCatalogo.length ? a.medioDePagoCatalogo : defaultMedios,
    }
  } catch {
    return { aseguradoras: defaultAseg, ramos: defaultRamos, mediosPago: defaultMedios }
  }
}

export function useCatalogos(
  defaultAseguradoras: string[] = [],
  defaultRamos: string[] = [],
  defaultMediosPago: string[] = [],
): CatalogosState {
  const [state, setState] = useState<CatalogosState>(() =>
    readFromStorage(defaultAseguradoras, defaultRamos, defaultMediosPago)
  )

  useEffect(() => {
    const sync = () => setState(readFromStorage(defaultAseguradoras, defaultRamos, defaultMediosPago))
    sync()
    window.addEventListener("branding-updated", sync)
    const onStorage = (e: StorageEvent) => { if (e.key === "aseguradora") sync() }
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener("branding-updated", sync)
      window.removeEventListener("storage", onStorage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return state
}
