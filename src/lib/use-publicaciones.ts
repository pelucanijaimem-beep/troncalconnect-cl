import { useSyncExternalStore } from "react";
import type { Camion, Carga } from "@/lib/troncal-data";

type Datos = { cargas: Carga[]; camiones: Camion[] };

const KEY = "troncaltrack.publicaciones";
const VACIO: Datos = { cargas: [], camiones: [] };

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
      datos = { cargas: p.cargas ?? [], camiones: p.camiones ?? [] };
    }
  } catch {
    datos = VACIO;
  }
}

function guardar() {
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

export function nuevoId(prefijo: string) {
  return `${prefijo}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function publicarCarga(carga: Carga) {
  cargar();
  datos = { ...datos, cargas: [carga, ...datos.cargas] };
  guardar();
}

export function publicarCamion(camion: Camion) {
  cargar();
  datos = { ...datos, camiones: [camion, ...datos.camiones] };
  guardar();
}

export function usePublicaciones() {
  return useSyncExternalStore(subscribe, getSnapshot, () => VACIO);
}
