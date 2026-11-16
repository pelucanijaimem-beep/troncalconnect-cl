import { z } from "zod";
import {
  coordenadasCiudad,
  distanciaKm,
  referenciaUbicacion,
  type Coordenadas,
} from "./load-search-location";

export const consultaVozSchema = z
  .object({
    origen: z.string().max(120).nullable(),
    destino: z.string().max(120).nullable(),
    desde: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable(),
    hasta: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable(),
    tipo_camion: z.string().max(80).nullable(),
    capacidad_toneladas: z.number().positive().max(200).nullable(),
    cerca: z.boolean(),
  })
  .strict();
export type ConsultaVoz = z.infer<typeof consultaVozSchema>;
export const normalizarCiudadVoz = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
export type CargaVoz = {
  id: string;
  origen: string;
  destino: string;
  fecha: string | null;
  tipo_camion: string;
  toneladas: number;
};
export function filtrarCargasVoz<T extends CargaVoz>(
  cargas: T[],
  consulta: ConsultaVoz,
  gps: Coordenadas | null,
  base: string,
): T[] {
  const referencia = referenciaUbicacion(gps, base);
  const punto = consulta.origen ? coordenadasCiudad(consulta.origen) : referencia?.punto;
  return cargas
    .filter((c) => {
      const origen = coordenadasCiudad(c.origen);
      if (consulta.cerca) {
        if (punto && origen) {
          if (distanciaKm(punto, origen) > 100) return false;
        } else if (
          normalizarCiudadVoz(c.origen) !== normalizarCiudadVoz(consulta.origen || base) ||
          !(consulta.origen || base)
        )
          return false;
      } else if (
        consulta.origen &&
        normalizarCiudadVoz(c.origen) !== normalizarCiudadVoz(consulta.origen)
      )
        return false;
      if (
        consulta.destino &&
        normalizarCiudadVoz(c.destino) !== normalizarCiudadVoz(consulta.destino)
      )
        return false;
      if (consulta.desde && (!c.fecha || c.fecha < consulta.desde)) return false;
      if (consulta.hasta && (!c.fecha || c.fecha > consulta.hasta)) return false;
      if (consulta.capacidad_toneladas !== null && c.toneladas > consulta.capacidad_toneladas)
        return false;
      if (
        consulta.tipo_camion &&
        normalizarCiudadVoz(c.tipo_camion) !== normalizarCiudadVoz(consulta.tipo_camion)
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      const pa = coordenadasCiudad(a.origen),
        pb = coordenadasCiudad(b.origen);
      return punto && pa && pb
        ? distanciaKm(punto, pa) - distanciaKm(punto, pb)
        : (a.fecha || "").localeCompare(b.fecha || "");
    })
    .slice(0, 5);
}
export function reportesDeRuta<T extends { origen: string; destino: string; created_at: string }>(
  reportes: T[],
  origen: string,
  destino: string,
  ahora: number,
) {
  const lugares = [origen, destino].filter(Boolean).map(normalizarCiudadVoz);
  return reportes
    .filter((r) => {
      const edad = ahora - Date.parse(r.created_at);
      return (
        edad >= 0 &&
        edad <= 45 * 86400000 &&
        lugares.length > 0 &&
        [r.origen, r.destino].some((c) => lugares.includes(normalizarCiudadVoz(c)))
      );
    })
    .slice(0, 10);
}
