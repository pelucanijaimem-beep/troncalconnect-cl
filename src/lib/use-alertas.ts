import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PreferenciasAlerta = {
  origenes: string[];
  destinos: string[];
  carrocerias: string[];
  ciudadBase: string;
  alertasEmail: boolean;
  activo: boolean;
};

export const PREFERENCIAS_VACIAS: PreferenciasAlerta = {
  origenes: [],
  destinos: [],
  carrocerias: [],
  ciudadBase: "",
  alertasEmail: true,
  activo: true,
};

type Fila = {
  origenes: string[] | null;
  destinos: string[] | null;
  carrocerias: string[] | null;
  ciudad_base: string | null;
  alertas_email: boolean;
  activo: boolean;
};

/** Preferencias de rutas y carrocerías del camionero para las alertas de coincidencia. */
export function usePreferenciasAlerta(userId: string | undefined | null) {
  const [prefs, setPrefs] = useState<PreferenciasAlerta>(PREFERENCIAS_VACIAS);
  const [cargando, setCargando] = useState(false);

  const recargar = useCallback(async () => {
    if (!userId) {
      setPrefs(PREFERENCIAS_VACIAS);
      return;
    }
    setCargando(true);
    const { data } = await supabase
      .from("preferencias_alertas")
      .select("origenes, destinos, carrocerias, ciudad_base, alertas_email, activo")
      .eq("user_id", userId)
      .maybeSingle();
    const f = data as Fila | null;
    setPrefs(
      f
        ? {
            origenes: f.origenes ?? [],
            destinos: f.destinos ?? [],
            carrocerias: f.carrocerias ?? [],
            ciudadBase: f.ciudad_base ?? "",
            alertasEmail: f.alertas_email,
            activo: f.activo,
          }
        : PREFERENCIAS_VACIAS,
    );
    setCargando(false);
  }, [userId]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  return { prefs, cargando, recargar };
}

export async function guardarPreferencias(entrada: {
  userId: string;
  nombre: string;
  email: string;
  prefs: PreferenciasAlerta;
}): Promise<string | null> {
  const { error } = await supabase.from("preferencias_alertas").upsert(
    {
      user_id: entrada.userId,
      nombre: entrada.nombre,
      email: entrada.email,
      origenes: entrada.prefs.origenes,
      destinos: entrada.prefs.destinos,
      carrocerias: entrada.prefs.carrocerias,
      ciudad_base: entrada.prefs.ciudadBase,
      alertas_email: entrada.prefs.alertasEmail,
      activo: entrada.prefs.activo,
    },
    { onConflict: "user_id" },
  );
  return error?.message ?? null;
}

/** true si una carga calza con las preferencias guardadas del camionero. */
export function calzaConPreferencias(
  prefs: PreferenciasAlerta,
  carga: { origen: string; destino: string; carroceria: string },
): boolean {
  if (!prefs.activo) return false;
  const igual = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
  const origenOk =
    prefs.origenes.length === 0 || prefs.origenes.some((o) => igual(o, carga.origen));
  const destinoOk =
    prefs.destinos.length === 0 || prefs.destinos.some((d) => igual(d, carga.destino));
  const carroceriaOk =
    prefs.carrocerias.length === 0 ||
    prefs.carrocerias.some((c) => igual(c, carga.carroceria));
  const algunaPreferencia =
    prefs.origenes.length + prefs.destinos.length + prefs.carrocerias.length > 0;
  return algunaPreferencia && origenOk && destinoOk && carroceriaOk;
}
