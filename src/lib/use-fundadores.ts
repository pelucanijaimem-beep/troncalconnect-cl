import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const CUPOS_FUNDADOR_TOTAL = 20;

/** Cupos restantes del programa Empresa Fundadora (dato real de la base de datos). */
export function useCuposFundador() {
  const [quedan, setQuedan] = useState<number | null>(null);

  useEffect(() => {
    let vivo = true;
    void supabase
      .rpc("cupos_fundador")
      .then(({ data, error }) => {
        if (!vivo || error) return;
        setQuedan(typeof data === "number" ? data : null);
      });
    return () => {
      vivo = false;
    };
  }, []);

  return { quedan, total: CUPOS_FUNDADOR_TOTAL };
}

/**
 * Reserva un cupo Empresa Fundadora para la empresa autenticada.
 * Devuelve el número de fundador asignado o null si ya no quedan cupos.
 */
export async function reservarCupoFundador(): Promise<number | null> {
  const { data, error } = await supabase.rpc("reservar_cupo_fundador");
  if (error) return null;
  return typeof data === "number" ? data : null;
}
