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

/** Motivos al reportar a la empresa dueña de una carga. */
export const MOTIVOS_REPORTE_EMPRESA = ["No pagó", "Trato abusivo", "Datos falsos", "Otro"] as const;

export type TipoReporte = "publicacion" | "usuario" | "empresa";

/** Motivos disponibles según lo que se reporta. */
export function motivosPara(tipo: TipoReporte): readonly string[] {
  return tipo === "empresa" ? MOTIVOS_REPORTE_EMPRESA : MOTIVOS_REPORTE;
}

/** El comentario es opcional al reportar una empresa; obligatorio en los demás casos. */
export function detalleObligatorio(tipo: TipoReporte): boolean {
  return tipo !== "empresa";
}

export type NuevoReporte = {
  reportanteId: string;
  tipo: TipoReporte;
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
    detalle: entrada.detalle.trim().slice(0, 500),
  });
  return error?.message ?? null;
}
