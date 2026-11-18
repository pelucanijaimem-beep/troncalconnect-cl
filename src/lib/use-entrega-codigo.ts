import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  interpretarResultado,
  leerCodigoEntrega,
  type CodigoEntrega,
  type ResultadoEntrega,
} from "./entrega-codigo";

export type { CodigoEntrega } from "./entrega-codigo";

/** El transportista inicia el viaje: genera el código de entrega en el servidor. */
export async function iniciarViajeEntrega(cargaId: string): Promise<string | null> {
  const { error } = await supabase.rpc("iniciar_viaje_entrega", { p_carga: cargaId });
  return error ? error.message || "No pudimos iniciar el viaje." : null;
}

/** Posición GPS actual, o null si no hay permiso o tarda demasiado. */
export function posicionActual(): Promise<{ lat: number; lng: number; precision: number | null } | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return Promise.resolve(null);
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (p) =>
        resolve({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          precision: p.coords.accuracy != null ? Math.round(p.coords.accuracy) : null,
        }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 },
    );
  });
}

/** Confirma la entrega en destino con el código y los datos del receptor. */
export async function confirmarEntregaCodigo(entrada: {
  cargaId: string;
  codigo: string;
  nombre: string;
  rut: string;
}): Promise<ResultadoEntrega> {
  const gps = await posicionActual();
  const { data, error } = await supabase.rpc("confirmar_entrega_codigo", {
    p_carga: entrada.cargaId,
    p_codigo: entrada.codigo.trim(),
    p_nombre: entrada.nombre.trim(),
    p_rut: entrada.rut.trim(),
    ...(gps ? { p_lat: gps.lat, p_lng: gps.lng, ...(gps.precision != null ? { p_precision: gps.precision } : {}) } : {}),
  });
  if (error) {
    return { ok: false, error: "otro", restantes: 0, mensaje: error.message || "No pudimos confirmar la entrega." };
  }
  return interpretarResultado(data);
}

/** Código de entrega de una carga: solo lo recibe la empresa dueña. */
export function useCodigoEntrega(cargaId: string | null | undefined) {
  const [datos, setDatos] = useState<CodigoEntrega | null | undefined>(undefined);

  const traer = useCallback(async () => {
    if (!cargaId) {
      setDatos(null);
      return;
    }
    const { data } = await supabase.rpc("codigo_entrega_carga", { p_carga: cargaId });
    setDatos(leerCodigoEntrega(data));
  }, [cargaId]);

  useEffect(() => {
    void traer();
    if (!cargaId) return;
    const t = setInterval(() => void traer(), 20_000);
    return () => clearInterval(t);
  }, [cargaId, traer]);

  const regenerar = useCallback(async (): Promise<string | null> => {
    if (!cargaId) return "Falta la carga";
    const { error } = await supabase.rpc("regenerar_codigo_entrega", { p_carga: cargaId });
    if (error) return error.message || "No pudimos generar un código nuevo.";
    await traer();
    return null;
  }, [cargaId, traer]);

  return { datos, refrescar: traer, regenerar };
}
