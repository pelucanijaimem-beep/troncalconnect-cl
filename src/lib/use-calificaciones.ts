import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type TipoCalificacion = "a_empresa" | "a_camionero";

/** Criterios evaluados según a quién se califica. */
export type Criterios = {
  /** Empresa: puntualidad en el pago acordado. */
  puntualidad_pago?: number;
  /** Empresa: condiciones de carga y descarga. */
  condiciones_carga?: number;
  /** Camionero: puntualidad en retiro y entrega. */
  puntualidad?: number;
  /** Camionero: estado y presentación del camión. */
  estado_camion?: number;
};

export type Calificacion = {
  id: string;
  evaluado: string;
  autor: string;
  tipo: TipoCalificacion;
  estrellas: number;
  criterios: Criterios;
  comentario: string;
  ruta: string;
  fecha: string;
};

type Fila = {
  id: string;
  autor_nombre: string;
  evaluado_nombre: string;
  tipo: string;
  estrellas: number;
  criterios: unknown;
  comentario: string;
  ruta: string;
  created_at: string;
};

const aCalificacion = (f: Fila): Calificacion => ({
  id: f.id,
  evaluado: f.evaluado_nombre,
  autor: f.autor_nombre,
  tipo: f.tipo === "a_empresa" ? "a_empresa" : "a_camionero",
  estrellas: Number(f.estrellas),
  criterios: (f.criterios ?? {}) as Criterios,
  comentario: f.comentario,
  ruta: f.ruta,
  fecha: f.created_at,
});

/** Guarda una calificación cruzada al finalizar un viaje. */
export async function calificar(entrada: {
  autorId: string;
  autor: string;
  evaluado: string;
  evaluadoId?: string | undefined;
  cargaId?: string | undefined;
  tipo: TipoCalificacion;
  estrellas: number;
  criterios: Criterios;
  comentario: string;
  ruta: string;
}): Promise<string | null> {
  const { error } = await supabase.from("calificaciones").insert({
    autor_id: entrada.autorId,
    autor_nombre: entrada.autor,
    evaluado_nombre: entrada.evaluado,
    evaluado_id: entrada.evaluadoId ?? null,
    carga_id: entrada.cargaId ?? null,
    tipo: entrada.tipo,
    estrellas: entrada.estrellas,
    criterios: entrada.criterios,
    comentario: entrada.comentario,
    ruta: entrada.ruta,
  });
  return error?.message ?? null;
}

// Un único canal en vivo compartido por todos los componentes: los callbacks se
// registran antes de suscribir y el canal nunca se reutiliza tras suscribirse.
// Revisado: la suscripción en vivo de calificaciones funciona correctamente.
let listaGlobal: Calificacion[] = [];
const oyentes = new Set<(l: Calificacion[]) => void>();
let canalActivo: ReturnType<typeof supabase.channel> | null = null;

async function traerCalificaciones() {
  const { data } = await supabase
    .from("calificaciones")
    .select(
      "id, autor_nombre, evaluado_nombre, tipo, estrellas, criterios, comentario, ruta, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(300);
  listaGlobal = ((data ?? []) as Fila[]).map(aCalificacion);
  oyentes.forEach((f) => f(listaGlobal));
}

function abrirCanal() {
  if (canalActivo) return;
  try {
    const canal = supabase.channel("calificaciones-live");
    canal.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "calificaciones" },
      () => void traerCalificaciones(),
    );
    canal.subscribe();
    canalActivo = canal;
  } catch {
    // Si la conexión en vivo falla, los datos siguen mostrándose sin tiempo real.
    canalActivo = null;
  }
}

function cerrarCanal() {
  if (!canalActivo) return;
  const canal = canalActivo;
  canalActivo = null;
  try {
    void supabase.removeChannel(canal);
  } catch {
    /* no bloquea la app */
  }
}

/** Todas las calificaciones visibles, en tiempo real. */
export function useCalificaciones() {
  const [lista, setLista] = useState<Calificacion[]>(listaGlobal);

  useEffect(() => {
    const oyente = (l: Calificacion[]) => setLista(l);
    oyentes.add(oyente);
    abrirCanal();
    void traerCalificaciones();
    return () => {
      oyentes.delete(oyente);
      if (oyentes.size === 0) cerrarCanal();
    };
  }, []);

  return lista;
}

const promedioDe = (valores: number[]) =>
  valores.length ? Math.round((valores.reduce((a, v) => a + v, 0) / valores.length) * 10) / 10 : 0;

export function resumen(lista: Calificacion[], evaluado: string) {
  const clave = evaluado.trim().toLowerCase();
  const propias = lista.filter((c) => c.evaluado.trim().toLowerCase() === clave);
  const promedio = promedioDe(propias.map((c) => c.estrellas));
  const pagos = propias
    .map((c) => c.criterios.puntualidad_pago)
    .filter((v): v is number => typeof v === "number");
  const promedioPago = promedioDe(pagos);
  return {
    promedio,
    total: propias.length,
    propias,
    promedioPago,
    totalPagos: pagos.length,
    /** Insignia "Buen historial de pago" para empresas cumplidoras. */
    buenHistorialPago: pagos.length >= 2 && promedioPago >= 4,
  };
}
