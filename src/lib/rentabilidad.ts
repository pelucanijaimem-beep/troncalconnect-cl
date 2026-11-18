import { KM_POR_PLAZA_TRONCAL, PEAJE_TRONCAL_MAX, PEAJE_TRONCAL_MIN } from "./cotizador";

/** Reference fare per troncal plaza for a 2-axle truck (category 2). */
export const PEAJE_TRONCAL_2_EJES = 6_200;
/** Midpoint of the >2-axle troncal fare range (category 3). */
export const PEAJE_TRONCAL_MAS_2_EJES = Math.round((PEAJE_TRONCAL_MIN + PEAJE_TRONCAL_MAX) / 2);

export type CategoriaPeaje = "2_ejes" | "mas_2_ejes";

/** Only light trucks travel on two axles; every other body type uses a tractor + trailer. */
export function categoriaPeaje(carroceria: string): CategoriaPeaje {
  return carroceria.trim().toLowerCase() === "camión 3/4" ? "2_ejes" : "mas_2_ejes";
}

/** Reference Ruta 5 tolls: one troncal plaza every ~100 km, priced by axle category. */
export function peajesEstimados(km: number, carroceria: string) {
  const categoria = categoriaPeaje(carroceria);
  const plazas = km > 0 ? Math.max(1, Math.round(km / KM_POR_PLAZA_TRONCAL)) : 0;
  const tarifaPlaza = categoria === "2_ejes" ? PEAJE_TRONCAL_2_EJES : PEAJE_TRONCAL_MAS_2_EJES;
  return { categoria, plazas, tarifaPlaza, total: plazas * tarifaPlaza };
}

/** What is left for the carrier after fuel and tolls, in total and per km. */
export function margenOperativo(totalFlete: number, diesel: number, peajes: number, km: number) {
  const neto = Math.round(totalFlete - diesel - peajes);
  return { neto, porKm: km > 0 ? Math.round(neto / km) : 0 };
}
