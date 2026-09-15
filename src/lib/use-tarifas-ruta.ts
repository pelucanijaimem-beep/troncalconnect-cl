import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const MINIMO_REGISTROS_RUTA = 3;

export type TarifaRuta = {
  /** Promedio real de $/km pagado en la ruta, o null si no hay datos suficientes. */
  promedio: number | null;
  registros: number;
  cargando: boolean;
};

/**
 * Promedio histórico real de $/km pagado en una ruta específica (origen → destino),
 * calculado solo con cargas completadas dentro de la plataforma.
 */
export function useTarifaRuta(origen?: string, destino?: string): TarifaRuta {
  const [estado, setEstado] = useState<TarifaRuta>({
    promedio: null,
    registros: 0,
    cargando: true,
  });

  useEffect(() => {
    if (!origen || !destino) {
      setEstado({ promedio: null, registros: 0, cargando: false });
      return;
    }
    let vivo = true;
    setEstado((p) => ({ ...p, cargando: true }));

    void supabase
      .rpc("tarifa_ruta", { _origen: origen, _destino: destino })
      .then(({ data, error }) => {
        if (!vivo) return;
        const fila = Array.isArray(data) ? data[0] : null;
        const registros = Number(fila?.registros ?? 0);
        const promedio = Number(fila?.promedio ?? 0);
        setEstado({
          promedio:
            !error && registros >= MINIMO_REGISTROS_RUTA && promedio > 0 ? promedio : null,
          registros: error ? 0 : registros,
          cargando: false,
        });
      });

    return () => {
      vivo = false;
    };
  }, [origen, destino]);

  return estado;
}
