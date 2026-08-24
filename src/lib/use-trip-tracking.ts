import { useCallback, useEffect, useRef, useState } from "react";

export type EstadoViaje = "disponible" | "en_ruta" | "entregada";

export type Posicion = {
  lat: number;
  lng: number;
  precision: number | null;
  simulada: boolean;
  actualizado: number;
};

export type Viaje = {
  estado: EstadoViaje;
  inicio: number | null;
  fin: number | null;
  avance: number; // 0 a 1
  posicion: Posicion | null;
};

const VIAJE_INICIAL: Viaje = {
  estado: "disponible",
  inicio: null,
  fin: null,
  avance: 0,
  posicion: null,
};

/**
 * Seguimiento GPS de viajes: activa la geolocalización del dispositivo al
 * iniciar un viaje y la detiene al marcar la carga como entregada.
 */
export function useTripTracking() {
  const [viajes, setViajes] = useState<Record<string, Viaje>>({});
  const watchers = useRef<Record<string, number>>({});
  const timers = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const detener = useCallback((id: string) => {
    const w = watchers.current[id];
    if (w !== undefined && typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.clearWatch(w);
    }
    delete watchers.current[id];
    const t = timers.current[id];
    if (t) clearInterval(t);
    delete timers.current[id];
  }, []);

  useEffect(() => {
    const ws = watchers.current;
    const ts = timers.current;
    return () => {
      Object.values(ws).forEach((w) => navigator.geolocation?.clearWatch(w));
      Object.values(ts).forEach((t) => clearInterval(t));
    };
  }, []);

  const iniciarViaje = useCallback((id: string) => {
    setViajes((prev) => ({
      ...prev,
      [id]: { ...VIAJE_INICIAL, estado: "en_ruta", inicio: Date.now() },
    }));

    // Avance simulado de la ruta para la vista de rastreo del cargador.
    timers.current[id] = setInterval(() => {
      setViajes((prev) => {
        const v = prev[id];
        if (!v || v.estado !== "en_ruta") return prev;
        return { ...prev, [id]: { ...v, avance: Math.min(0.98, v.avance + 0.012) } };
      });
    }, 1500);

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      watchers.current[id] = navigator.geolocation.watchPosition(
        (pos) => {
          setViajes((prev) => {
            const v = prev[id];
            if (!v) return prev;
            return {
              ...prev,
              [id]: {
                ...v,
                posicion: {
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                  precision: pos.coords.accuracy ?? null,
                  simulada: false,
                  actualizado: Date.now(),
                },
              },
            };
          });
        },
        () => {
          // Sin permiso de GPS: se mantiene el seguimiento estimado por ruta.
          setViajes((prev) => {
            const v = prev[id];
            if (!v) return prev;
            return {
              ...prev,
              [id]: {
                ...v,
                posicion: {
                  lat: -36.826,
                  lng: -73.05,
                  precision: null,
                  simulada: true,
                  actualizado: Date.now(),
                },
              },
            };
          });
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
      );
    }
  }, []);

  const finalizarViaje = useCallback(
    (id: string) => {
      detener(id);
      setViajes((prev) => {
        const v = prev[id] ?? VIAJE_INICIAL;
        return { ...prev, [id]: { ...v, estado: "entregada", fin: Date.now(), avance: 1 } };
      });
    },
    [detener],
  );

  const getViaje = useCallback((id: string): Viaje => viajes[id] ?? VIAJE_INICIAL, [viajes]);

  return { viajes, getViaje, iniciarViaje, finalizarViaje };
}
