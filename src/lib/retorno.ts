import type { Carga } from "@/lib/troncal-data";
import { mismaCiudad, regionDe } from "@/lib/regiones";

export type SugerenciaRetorno = {
  carga: Carga;
  cercania: "misma_ciudad" | "misma_region";
  mismoEquipo: boolean;
};

/**
 * Cargas de retorno: compara el destino del último viaje del transportista
 * contra el origen de las cargas publicadas, priorizando la misma ciudad y
 * el mismo tipo de carrocería. No usa geolocalización.
 */
export function sugerenciasRetorno(
  cargas: Carga[],
  destino: string,
  carroceria?: string,
  excluirId?: string,
): SugerenciaRetorno[] {
  if (!destino.trim()) return [];
  const region = regionDe(destino);

  const lista: SugerenciaRetorno[] = [];
  for (const c of cargas) {
    if (excluirId && c.id === excluirId) continue;
    if (mismaCiudad(c.destino, destino)) continue; // no sugerir la misma ruta de ida
    const enCiudad = mismaCiudad(c.origen, destino);
    const enRegion = !!region && regionDe(c.origen) === region;
    if (!enCiudad && !enRegion) continue;
    lista.push({
      carga: c,
      cercania: enCiudad ? "misma_ciudad" : "misma_region",
      mismoEquipo: !!carroceria && c.carroceria === carroceria,
    });
  }

  return lista
    .sort((a, b) => {
      const peso = (s: SugerenciaRetorno) =>
        (s.cercania === "misma_ciudad" ? 2 : 0) + (s.mismoEquipo ? 1 : 0);
      return peso(b) - peso(a) || b.carga.valorKm - a.carga.valorKm;
    })
    .slice(0, 6);
}
