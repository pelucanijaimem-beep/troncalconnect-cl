import { supabase } from "@/integrations/supabase/client";
import { DIAS_VIGENCIA_REPORTE, ciudadesConsulta } from "./alertas-ruta-resumen";

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
  const ciudades = ciudadesConsulta(origen, destino);
  if (!ciudades.length) return [];
  const { data, error } = await supabase.rpc("reportes_ruta_recientes", {
    p_ciudades: ciudades,
    p_dias: DIAS_VIGENCIA_REPORTE,
    p_limite: 10,
  });
  if (error) return [];
  return data ?? [];
}
