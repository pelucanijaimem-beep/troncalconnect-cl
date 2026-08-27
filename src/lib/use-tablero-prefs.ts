import { useSyncExternalStore } from "react";

export type Pod = {
  /** Imagen de la guía de despacho firmada en base64. */
  imagen: string;
  nombreArchivo: string;
  fecha: string;
  observacion: string;
};

type Datos = {
  /** IDs de cargas guardadas en favoritos. */
  favoritos: string[];
  /** Nombres de empresas bloqueadas (en minúsculas). */
  bloqueadas: string[];
  /** Guías de despacho firmadas por carga. */
  pods: Record<string, Pod>;
};

const KEY = "troncaltrack.tablero";
const VACIO: Datos = { favoritos: [], bloqueadas: [], pods: {} };

let datos: Datos = VACIO;
let cargado = false;
const oyentes = new Set<() => void>();

function cargar() {
  if (cargado || typeof window === "undefined") return;
  cargado = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Datos>;
      datos = {
        favoritos: p.favoritos ?? [],
        bloqueadas: p.bloqueadas ?? [],
        pods: p.pods ?? {},
      };
    }
  } catch {
    datos = VACIO;
  }
}

function guardar(nuevo: Datos) {
  datos = nuevo;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(datos));
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
  return datos;
}

const clave = (s: string) => s.trim().toLowerCase();

export function alternarFavorito(id: string) {
  cargar();
  const existe = datos.favoritos.includes(id);
  guardar({
    ...datos,
    favoritos: existe ? datos.favoritos.filter((f) => f !== id) : [id, ...datos.favoritos],
  });
  return !existe;
}

export function bloquearEmpresa(empresa: string) {
  cargar();
  const k = clave(empresa);
  if (datos.bloqueadas.includes(k)) return;
  guardar({ ...datos, bloqueadas: [k, ...datos.bloqueadas] });
}

export function desbloquearEmpresa(empresa: string) {
  cargar();
  const k = clave(empresa);
  guardar({ ...datos, bloqueadas: datos.bloqueadas.filter((b) => b !== k) });
}

export function estaBloqueada(bloqueadas: string[], empresa: string) {
  return bloqueadas.includes(clave(empresa));
}

export function guardarPod(cargaId: string, pod: Pod) {
  cargar();
  guardar({ ...datos, pods: { ...datos.pods, [cargaId]: pod } });
}

export function useTableroPrefs() {
  return useSyncExternalStore(subscribe, getSnapshot, () => VACIO);
}
