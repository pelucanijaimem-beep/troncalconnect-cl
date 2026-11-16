import { coordenadasCiudad, distanciaKm } from "@/lib/load-search-location";

/** Road distance is longer than a straight line; 1.1 matches Ruta 5 corridors (Chillán–Santiago ≈ 400 km). */
export const FACTOR_CARRETERA = 1.1;
/** Average loaded-truck speed used for the travel-time reference. */
export const VELOCIDAD_CAMION_KMH = 70;
/** Approximate spacing of main (troncal) toll plazas on Ruta 5. */
export const KM_POR_PLAZA_TRONCAL = 100;
/** 2026 reference fare range for a truck with more than 2 axles at a troncal plaza. */
export const PEAJE_TRONCAL_MIN = 10_400;
export const PEAJE_TRONCAL_MAX = 12_200;

export type EstimacionRuta = {
  km: number;
  horas: number;
  plazas: number;
  peajeMin: number;
  peajeMax: number;
};

const normalizar = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export function mismaCiudadFlexible(a: string, b: string) {
  return normalizar(a) !== "" && normalizar(a) === normalizar(b);
}

/** Reference estimate between two known cities; null when a city is unknown or both are the same. */
export function estimarRuta(origen: string, destino: string): EstimacionRuta | null {
  const a = coordenadasCiudad(origen);
  const b = coordenadasCiudad(destino);
  if (!a || !b || mismaCiudadFlexible(origen, destino)) return null;
  const km = Math.round((distanciaKm(a, b) * FACTOR_CARRETERA) / 10) * 10;
  const horas = Math.round((km / VELOCIDAD_CAMION_KMH) * 2) / 2;
  const plazas = Math.max(1, Math.round(km / KM_POR_PLAZA_TRONCAL));
  return {
    km,
    horas,
    plazas,
    peajeMin: plazas * PEAJE_TRONCAL_MIN,
    peajeMax: plazas * PEAJE_TRONCAL_MAX,
  };
}

/** Real published loads on the corridor (ida) and back from the destination (retorno). */
export function cargasDelCorredor(
  cargas: { origen: string; destino: string }[],
  origen: string,
  destino: string,
) {
  let ida = 0;
  let retorno = 0;
  for (const c of cargas) {
    if (mismaCiudadFlexible(c.origen, origen) && mismaCiudadFlexible(c.destino, destino)) ida += 1;
    if (mismaCiudadFlexible(c.origen, destino)) retorno += 1;
  }
  return { ida, retorno };
}

export type TarifaReferencial = { valorKm: number; muestras: number; alcance: "tramo" | "general" };

/**
 * Reference $/km from real published loads: the same corridor first, otherwise the
 * average of every published load. Null when no load carries a usable value.
 */
export function tarifaReferencial(
  cargas: { origen: string; destino: string; valorKm: number }[],
  origen: string,
  destino: string,
): TarifaReferencial | null {
  const validas = cargas.filter((c) => Number.isFinite(c.valorKm) && c.valorKm > 0);
  const tramo = validas.filter(
    (c) => mismaCiudadFlexible(c.origen, origen) && mismaCiudadFlexible(c.destino, destino),
  );
  const base = tramo.length ? tramo : validas;
  if (!base.length) return null;
  const promedio = base.reduce((a, c) => a + c.valorKm, 0) / base.length;
  return { valorKm: Math.round(promedio), muestras: base.length, alcance: tramo.length ? "tramo" : "general" };
}

/** Data typed in the home quote box, kept so publishing or signing up does not lose it. */
export type BorradorFlete = { origen: string; destino: string; carga: string };
