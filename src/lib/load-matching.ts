import { z } from "zod";

export const coincidenciasSchema = z.object({
  coincidencias: z.array(z.object({ id: z.string(), motivo: z.string() }).strict()),
}).strict();
export type CoincidenciaCarga = z.infer<typeof coincidenciasSchema>["coincidencias"][number];

export function validarCoincidencias(coincidencias: CoincidenciaCarga[], ids: string[]) {
  const permitidos = new Set(ids);
  const vistos = new Set<string>();
  return coincidencias.filter((c) => {
    if (!permitidos.has(c.id) || vistos.has(c.id)) return false;
    vistos.add(c.id);
    return true;
  }).slice(0, 5).map((c) => ({ id: c.id, motivo: c.motivo.slice(0, 300) }));
}

export type CargaCompatible = { id: string; user_id: string; solo_verificados: boolean; tipo_carga: string; fecha: string | null };
export function cargaElegible(carga: CargaCompatible, userId: string, verificado: boolean, peligrosas: boolean, hoy: string) {
  return (!carga.fecha || carga.fecha >= hoy) &&
    (!carga.solo_verificados || verificado) &&
    (carga.tipo_carga !== "peligrosa" || peligrosas || carga.user_id === userId);
}