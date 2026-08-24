import { useSyncExternalStore } from "react";
import type { Rol } from "@/components/troncal/RoleSwitcher";

export type Sesion = {
  nombre: string;
  email: string;
  rol: Rol;
  telefono?: string;
};

const KEY = "troncaltrack.sesion";
let sesion: Sesion | null = null;
let cargada = false;
const oyentes = new Set<() => void>();

function cargar() {
  if (cargada || typeof window === "undefined") return;
  cargada = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) sesion = JSON.parse(raw) as Sesion;
  } catch {
    sesion = null;
  }
}

function emitir() {
  oyentes.forEach((f) => f());
}

function subscribe(f: () => void) {
  cargar();
  oyentes.add(f);
  return () => oyentes.delete(f);
}

function getSnapshot() {
  cargar();
  return sesion;
}

export function iniciarSesion(nueva: Sesion) {
  sesion = nueva;
  cargada = true;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(nueva));
  } catch {
    /* almacenamiento no disponible */
  }
  emitir();
}

export function cerrarSesion() {
  sesion = null;
  cargada = true;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* almacenamiento no disponible */
  }
  emitir();
}

export function useSesion() {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => null as Sesion | null,
  );
}
