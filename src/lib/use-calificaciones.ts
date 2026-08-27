import { useSyncExternalStore } from "react";

export type Calificacion = {
  id: string;
  /** Usuario evaluado (nombre de empresa o conductor). */
  evaluado: string;
  /** Quién evalúa. */
  autor: string;
  estrellas: number;
  comentario: string;
  ruta: string;
  fecha: string;
};

const KEY = "troncaltrack.calificaciones";

let lista: Calificacion[] = [];
let cargado = false;
const oyentes = new Set<() => void>();

function cargar() {
  if (cargado || typeof window === "undefined") return;
  cargado = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) lista = JSON.parse(raw) as Calificacion[];
  } catch {
    lista = [];
  }
}

function guardar() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(lista));
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
  return lista;
}

export function calificar(c: Omit<Calificacion, "id" | "fecha">) {
  cargar();
  lista = [
    {
      ...c,
      id: `cal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      fecha: new Date().toISOString(),
    },
    ...lista,
  ];
  guardar();
}

export function useCalificaciones() {
  return useSyncExternalStore(subscribe, getSnapshot, () => [] as Calificacion[]);
}

export function resumen(lista: Calificacion[], evaluado: string) {
  const propias = lista.filter(
    (c) => c.evaluado.trim().toLowerCase() === evaluado.trim().toLowerCase(),
  );
  if (!propias.length) return { promedio: 0, total: 0, propias };
  const promedio = propias.reduce((a, c) => a + c.estrellas, 0) / propias.length;
  return { promedio: Math.round(promedio * 10) / 10, total: propias.length, propias };
}
