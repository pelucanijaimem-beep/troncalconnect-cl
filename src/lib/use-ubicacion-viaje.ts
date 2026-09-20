import { useCallback, useEffect, useId, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UbicacionViaje = {
  lat: number;
  lng: number;
  velocidad: number;
  precision: number | null;
  activo: boolean;
  actualizado: string;
};

/** Cada cuánto se envía la posición a la plataforma mientras el viaje está en curso. */
const INTERVALO_MS = 15_000;

/**
 * Compartir ubicación durante un viaje: es opt-in del transportista, usa el GPS
 * del teléfono y se apaga solo al finalizar el viaje o al desactivarlo.
 */
export function useCompartirUbicacion(cargaId?: string, userId?: string) {
  const [activo, setActivo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ultima, setUltima] = useState<UbicacionViaje | null>(null);
  const watch = useRef<number | null>(null);
  const ultimoEnvio = useRef(0);

  const limpiarWatch = useCallback(() => {
    if (watch.current !== null && typeof navigator !== "undefined") {
      navigator.geolocation?.clearWatch(watch.current);
    }
    watch.current = null;
  }, []);

  const desactivar = useCallback(async () => {
    limpiarWatch();
    setActivo(false);
    setUltima(null);
    if (cargaId && userId) {
      // Privacidad: al detener el viaje se borra la posición compartida.
      await supabase
        .from("viajes_ubicacion")
        .delete()
        .eq("carga_id", cargaId)
        .eq("transportista_id", userId);
    }
  }, [cargaId, userId, limpiarWatch]);

  const activar = useCallback(() => {
    if (!cargaId || !userId) {
      setError("Debes iniciar sesión para compartir tu ubicación en el viaje.");
      return;
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Tu teléfono o navegador no permite compartir la ubicación.");
      return;
    }
    setError(null);
    setActivo(true);
    ultimoEnvio.current = 0;
    watch.current = navigator.geolocation.watchPosition(
      (pos) => {
        const registro: UbicacionViaje = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          velocidad:
            pos.coords.speed != null && pos.coords.speed >= 0
              ? Math.round(pos.coords.speed * 3.6)
              : 0,
          precision: pos.coords.accuracy != null ? Math.round(pos.coords.accuracy) : null,
          activo: true,
          actualizado: new Date().toISOString(),
        };
        setUltima(registro);
        const ahora = Date.now();
        if (ahora - ultimoEnvio.current < INTERVALO_MS) return;
        ultimoEnvio.current = ahora;
        void supabase.from("viajes_ubicacion").upsert(
          {
            carga_id: cargaId,
            transportista_id: userId,
            lat: registro.lat,
            lng: registro.lng,
            velocidad: registro.velocidad,
            precision_m: registro.precision,
            activo: true,
            updated_at: registro.actualizado,
          },
          { onConflict: "carga_id,transportista_id" },
        );
      },
      (err) => {
        setActivo(false);
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Permiso de ubicación denegado. Actívalo en tu teléfono para compartir el viaje."
            : "No pudimos obtener tu ubicación GPS. Intenta nuevamente.",
        );
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
  }, [cargaId, userId]);

  useEffect(() => () => limpiarWatch(), [limpiarWatch]);

  return { activo, error, ultima, activar, desactivar };
}

/** Ubicación compartida por el transportista de una carga (solo la ve el dueño). */
export function useUbicacionViaje(cargaId?: string) {
  const [ubicacion, setUbicacion] = useState<UbicacionViaje | null>(null);
  const canalId = useId();

  useEffect(() => {
    if (!cargaId) {
      setUbicacion(null);
      return;
    }
    let vivo = true;

    const traer = async () => {
      const { data } = await supabase
        .from("viajes_ubicacion")
        .select("lat, lng, velocidad, precision_m, activo, updated_at")
        .eq("carga_id", cargaId)
        .eq("activo", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!vivo) return;
      setUbicacion(
        data
          ? {
              lat: Number(data.lat),
              lng: Number(data.lng),
              velocidad: Number(data.velocidad ?? 0),
              precision: data.precision_m != null ? Number(data.precision_m) : null,
              activo: Boolean(data.activo),
              actualizado: data.updated_at ?? "",
            }
          : null,
      );
    };

    void traer();
    const timer = setInterval(() => void traer(), 15_000);

    let canal: ReturnType<typeof supabase.channel> | null = null;
    try {
      canal = supabase
        .channel(`ubicacion-viaje-${canalId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "viajes_ubicacion" },
          () => void traer(),
        )
        .subscribe();
    } catch {
      canal = null;
    }

    return () => {
      vivo = false;
      clearInterval(timer);
      if (canal) {
        try {
          void supabase.removeChannel(canal);
        } catch {
          /* el seguimiento sigue funcionando sin tiempo real */
        }
      }
    };
  }, [cargaId, canalId]);

  return ubicacion;
}
