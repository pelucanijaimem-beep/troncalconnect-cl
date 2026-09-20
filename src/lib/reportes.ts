import { supabase } from "@/integrations/supabase/client";

/** Motivos disponibles al reportar una publicación o un usuario. */
export const MOTIVOS_REPORTE = [
  "Datos falsos o engañosos",
  "Tarifa irreal o sospechosa",
  "Intento de estafa",
  "Publicación duplicada",
  "Trato inadecuado",
  "Otro motivo",
] as const;

export type MotivoReporte = (typeof MOTIVOS_REPORTE)[number];

export type NuevoReporte = {
  reportanteId: string;
  tipo: "publicacion" | "usuario";
  cargaId?: string | null;
  reportadoId?: string | null;
  reportadoNombre: string;
  motivo: string;
  detalle: string;
};

/** Registra un reporte para que el equipo administrador lo revise. */
export async function crearReporte(entrada: NuevoReporte): Promise<string | null> {
  const { error } = await supabase.from("reportes").insert({
    reportante_id: entrada.reportanteId,
    tipo: entrada.tipo,
    carga_id: entrada.cargaId ?? null,
    reportado_id: entrada.reportadoId ?? null,
    reportado_nombre: entrada.reportadoNombre,
    motivo: entrada.motivo,
    detalle: entrada.detalle,
  });
  return error?.message ?? null;
}
