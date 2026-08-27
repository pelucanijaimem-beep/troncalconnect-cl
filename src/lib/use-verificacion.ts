import { useSyncExternalStore } from "react";

export type EstadoVerificacion = "sin_verificar" | "en_revision" | "verificado";

export type Documentos = {
  identidad?: string;
  licencia?: string;
  padron?: string;
  poliza?: string;
};

export type Verificacion = {
  estado: EstadoVerificacion;
  asegurado: boolean;
  documentos: Documentos;
  actualizado: string;
};

export const VERIFICACION_VACIA: Verificacion = {
  estado: "sin_verificar",
  asegurado: false,
  documentos: {},
  actualizado: "",
};

const KEY = "troncaltrack.verificaciones";

type Mapa = Record<string, Verificacion>;

let mapa: Mapa = {};
let cargado = false;
const oyentes = new Set<() => void>();

function cargar() {
  if (cargado || typeof window === "undefined") return;
  cargado = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) mapa = JSON.parse(raw) as Mapa;
  } catch {
    mapa = {};
  }
}

function guardar() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(mapa));
  } catch {
    /* almacenamiento no disponible */
  }
  oyentes.forEach((f) => f());
}

function subscribe(f: () => void) {
  cargar();
  oyentes.add(f);
  return () => oyentes.delete(f);
}

function getSnapshot() {
  cargar();
  return mapa;
}

export function claveUsuario(nombreOEmail: string) {
  return nombreOEmail.trim().toLowerCase();
}

export function getVerificacion(clave: string | undefined | null): Verificacion {
  cargar();
  if (!clave) return VERIFICACION_VACIA;
  return mapa[claveUsuario(clave)] ?? VERIFICACION_VACIA;
}

/** Envía los documentos a revisión de TroncalCheck. */
export function enviarDocumentos(clave: string, documentos: Documentos) {
  cargar();
  const k = claveUsuario(clave);
  mapa = {
    ...mapa,
    [k]: {
      estado: "en_revision",
      asegurado: Boolean(documentos.poliza),
      documentos,
      actualizado: new Date().toISOString(),
    },
  };
  guardar();
}

/** Aprueba la validación documental (simulación del equipo TroncalCheck). */
export function aprobarVerificacion(clave: string) {
  cargar();
  const k = claveUsuario(clave);
  const actual = mapa[k] ?? VERIFICACION_VACIA;
  mapa = {
    ...mapa,
    [k]: { ...actual, estado: "verificado", actualizado: new Date().toISOString() },
  };
  guardar();
}

export function useVerificaciones() {
  return useSyncExternalStore(subscribe, getSnapshot, () => ({}) as Mapa);
}

export function useVerificacion(clave: string | undefined | null): Verificacion {
  const m = useVerificaciones();
  if (!clave) return VERIFICACION_VACIA;
  return m[claveUsuario(clave)] ?? VERIFICACION_VACIA;
}
