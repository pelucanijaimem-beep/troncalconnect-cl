import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { TipoCalificacion } from "./calificacion-viaje";

export type { TipoCalificacion } from "./calificacion-viaje";

export type Reputacion = { promedio: number; total: number };

export type Resena = {
  id: string;
  tipo: TipoCalificacion;
  estrellas: number;
  etiquetas: string[];
  comentario: string;
  ruta: string;
  autor: string;
  fecha: string;
};

export type CalificacionPendiente = {
  cargaId: string;
  tipo: TipoCalificacion;
  contraparte: string;
  ruta: string;
};

// Estado compartido: una sola lectura de reputación para todas las tarjetas, y
// un contador de versión que avisa a reseñas y pendientes cuando algo cambia.
let reputacionGlobal = new Map<string, Reputacion>();
let version = 0;
let cargando: Promise<void> | null = null;
let cargadoUnaVez = false;
const oyentes = new Set<() => void>();
const avisar = () => oyentes.forEach((f) => f());

async function traerReputacion() {
  const { data } = await supabase.rpc("reputacion_usuarios");
  const mapa = new Map<string, Reputacion>();
  for (const fila of data ?? []) {
    if (!fila.evaluado_id) continue;
    mapa.set(fila.evaluado_id, { promedio: Number(fila.promedio), total: Number(fila.total) });
  }
  reputacionGlobal = mapa;
  cargadoUnaVez = true;
}

/** Vuelve a leer la reputación y avisa a reseñas y pendientes. */
export async function refrescarCalificaciones() {
  cargando = traerReputacion().finally(() => {
    cargando = null;
  });
  await cargando;
  version += 1;
  avisar();
}

function useVersion() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const oyente = () => setTick((t) => t + 1);
    oyentes.add(oyente);
    return () => {
      oyentes.delete(oyente);
    };
  }, []);
  return version;
}

/** Promedio y viajes calificados de todos los usuarios (por id). */
export function useReputacion() {
  useVersion();
  useEffect(() => {
    if (!cargadoUnaVez && !cargando) void refrescarCalificaciones();
  }, []);
  return reputacionGlobal;
}

export const reputacionDe = (
  mapa: Map<string, Reputacion>,
  id: string | null | undefined,
): Reputacion => (id ? mapa.get(id) : undefined) ?? { promedio: 0, total: 0 };

/** Últimas reseñas recibidas por un usuario (requiere sesión). */
export function useResenas(userId: string | null | undefined, limite = 5) {
  const v = useVersion();
  const [lista, setLista] = useState<Resena[]>([]);
  useEffect(() => {
    if (!userId) {
      setLista([]);
      return;
    }
    let vivo = true;
    void supabase.rpc("resenas_recibidas", { p_id: userId, p_limite: limite }).then(({ data }) => {
      if (!vivo) return;
      setLista(
        (data ?? []).map((f) => ({
          id: f.id,
          tipo: f.tipo === "a_empresa" ? "a_empresa" : "a_camionero",
          estrellas: Number(f.estrellas),
          etiquetas: f.etiquetas ?? [],
          comentario: f.comentario ?? "",
          ruta: f.ruta ?? "",
          autor: f.autor_nombre ?? "Usuario TroncalTrack",
          fecha: f.created_at,
        })),
      );
    });
    return () => {
      vivo = false;
    };
  }, [userId, limite, v]);
  return lista;
}

/** Viajes entregados y conformes que el usuario aún no califica. */
export function useCalificacionesPendientes(userId: string | null | undefined) {
  const v = useVersion();
  const [lista, setLista] = useState<CalificacionPendiente[]>([]);
  useEffect(() => {
    if (!userId) {
      setLista([]);
      return;
    }
    let vivo = true;
    void supabase.rpc("mis_calificaciones_pendientes").then(({ data }) => {
      if (!vivo) return;
      setLista(
        (data ?? []).map((f) => ({
          cargaId: f.carga_id,
          tipo: f.tipo === "a_empresa" ? "a_empresa" : "a_camionero",
          contraparte: f.contraparte,
          ruta: f.ruta,
        })),
      );
    });
    return () => {
      vivo = false;
    };
  }, [userId, v]);
  return lista;
}

/** La empresa confirma "Entregado y Conforme" con el transportista que hizo el viaje. */
export async function confirmarEntregaConforme(
  cargaId: string,
  transportistaId: string,
): Promise<string | null> {
  const { error } = await supabase.rpc("confirmar_entrega_conforme", {
    p_carga: cargaId,
    p_transportista: transportistaId,
  });
  if (!error) void refrescarCalificaciones();
  return error?.message ?? null;
}

/** Guarda la calificación de la contraparte; la base valida viaje, parte y etiquetas. */
export async function calificarViaje(entrada: {
  cargaId: string;
  estrellas: number;
  etiquetas: string[];
  comentario: string;
}): Promise<string | null> {
  const { error } = await supabase.rpc("calificar_viaje", {
    p_carga: entrada.cargaId,
    p_estrellas: entrada.estrellas,
    p_etiquetas: entrada.etiquetas,
    p_comentario: entrada.comentario.trim(),
  });
  if (!error) await refrescarCalificaciones();
  return error?.message ?? null;
}
