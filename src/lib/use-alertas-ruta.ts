import { supabase } from "@/integrations/supabase/client";

export const TIPOS_ALERTA_RUTA = [
  "Robo o intento de robo",
  "Vehículo sospechoso siguiendo",
  "Ruta cortada o bloqueada",
  "Accidente o congestión grave",
  "Otro peligro",
] as const;

export type TipoAlertaRuta = (typeof TIPOS_ALERTA_RUTA)[number];

export type AlertaRuta = {
  id: string;
  tipo: string;
  origen: string;
  destino: string;
  detalle: string;
  created_at: string;
};

const DIAS_VIGENCIA_ALERTA = 45;

/** Registra una alerta de un camionero sobre algo visto en la ruta. */
export async function crearAlertaRuta(entrada: {
  userId: string;
  tipo: string;
  origen: string;
  destino: string;
  detalle: string;
}): Promise<string | null> {
  const { error } = await supabase.from("alertas_ruta").insert({
    user_id: entrada.userId,
    tipo: entrada.tipo,
    origen: entrada.origen,
    destino: entrada.destino,
    detalle: entrada.detalle,
  });
  return error?.message ?? null;
}

/** Alertas recientes reportadas en rutas con el mismo origen o destino (coincidencia por nombre de ciudad). */
export async function alertasRecientesPara(
  origen: string,
  destino: string,
): Promise<AlertaRuta[]> {
  const desde = new Date(Date.now() - DIAS_VIGENCIA_ALERTA * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("alertas_ruta")
    .select("id, tipo, origen, destino, detalle, created_at")
    .gte("created_at", desde)
    .or(
      [
        `origen.ilike.%${origen}%`,
        `destino.ilike.%${origen}%`,
        `origen.ilike.%${destino}%`,
        `destino.ilike.%${destino}%`,
      ].join(","),
    )
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) return [];
  return data ?? [];
}
