import { useCallback, useEffect, useRef, useState } from "react";

export type CamionDisponible = {
  id: string;
  nombre: string;
  telefono?: string;
  lat: number;
  lng: number;
  velocidad: number;
  precision: number | null;
  actualizado: number;
};

const CLAVE = "troncaltrack:disponibles";
/** Se descarta un camión si no envía posición en 5 minutos. */
const VIGENCIA_MS = 5 * 60 * 1000;

function leer(): Record<string, CamionDisponible> {
  if (typeof window === "undefined") return {};
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    const datos = crudo ? (JSON.parse(crudo) as Record<string, CamionDisponible>) : {};
    const ahora = Date.now();
    return Object.fromEntries(
      Object.entries(datos).filter(([, c]) => ahora - c.actualizado < VIGENCIA_MS),
    );
  } catch {
    return {};
  }
}

function escribir(datos: Record<string, CamionDisponible>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CLAVE, JSON.stringify(datos));
  window.dispatchEvent(new Event("troncaltrack:disponibles"));
}

/** Camiones que están transmitiendo su posición GPS en este momento. */
export function useCamionesDisponibles() {
  const [camiones, setCamiones] = useState<CamionDisponible[]>([]);

  useEffect(() => {
    const actualizar = () => setCamiones(Object.values(leer()));
    actualizar();
    window.addEventListener("storage", actualizar);
    window.addEventListener("troncaltrack:disponibles", actualizar);
    const t = setInterval(actualizar, 3000);
    return () => {
      window.removeEventListener("storage", actualizar);
      window.removeEventListener("troncaltrack:disponibles", actualizar);
      clearInterval(t);
    };
  }, []);

  return camiones;
}

/**
 * Control del estado "Disponible en Ruta" del transportista: activa la
 * geolocalización del teléfono y comparte la posición en vivo con las empresas.
 */
export function useMiDisponibilidad(usuario: { id?: string; nombre?: string; telefono?: string }) {
  const [activo, setActivo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posicion, setPosicion] = useState<CamionDisponible | null>(null);
  const watch = useRef<number | null>(null);

  const quitar = useCallback(() => {
    if (!usuario.id) return;
    const datos = leer();
    delete datos[usuario.id];
    escribir(datos);
  }, [usuario.id]);

  const desactivar = useCallback(() => {
    if (watch.current !== null && typeof navigator !== "undefined") {
      navigator.geolocation?.clearWatch(watch.current);
    }
    watch.current = null;
    setActivo(false);
    setPosicion(null);
    quitar();
  }, [quitar]);

  const activar = useCallback(() => {
    if (!usuario.id) {
      setError("Debes iniciar sesión para compartir tu ubicación.");
      return;
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Tu navegador no permite compartir la ubicación GPS.");
      return;
    }
    setError(null);
    setActivo(true);
    watch.current = navigator.geolocation.watchPosition(
      (pos) => {
        const registro: CamionDisponible = {
          id: usuario.id!,
          nombre: usuario.nombre || "Transportista",
          ...(usuario.telefono ? { telefono: usuario.telefono } : {}),
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          velocidad:
            pos.coords.speed != null && pos.coords.speed >= 0
              ? Math.round(pos.coords.speed * 3.6)
              : 0,
          precision: pos.coords.accuracy ?? null,
          actualizado: Date.now(),
        };
        setPosicion(registro);
        escribir({ ...leer(), [registro.id]: registro });
      },
      (err) => {
        setActivo(false);
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Permiso de ubicación denegado. Actívalo en tu teléfono para aparecer en el mapa."
            : "No pudimos obtener tu ubicación GPS. Intenta nuevamente.",
        );
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
  }, [usuario.id, usuario.nombre, usuario.telefono]);

  useEffect(() => {
    return () => {
      if (watch.current !== null && typeof navigator !== "undefined") {
        navigator.geolocation?.clearWatch(watch.current);
      }
    };
  }, []);

  return { activo, error, posicion, activar, desactivar };
}
