import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/** Documentos con fecha de vencimiento que el transportista ingresa manualmente. */
export type ClaveVencimiento =
  | "revision_tecnica"
  | "permiso_circulacion"
  | "soap"
  | "carga_peligrosa";

export const DOCUMENTOS_VENCIMIENTO: {
  clave: ClaveVencimiento;
  label: string;
  ayuda: string;
  opcional?: boolean;
}[] = [
  {
    clave: "revision_tecnica",
    label: "Revisión Técnica",
    ayuda: "Fecha de vencimiento del certificado de la planta revisora.",
  },
  {
    clave: "permiso_circulacion",
    label: "Permiso de Circulación",
    ayuda: "Vence al término del período pagado en la municipalidad.",
  },
  {
    clave: "soap",
    label: "SOAP",
    ayuda: "Seguro Obligatorio de Accidentes Personales del vehículo.",
  },
  {
    clave: "carga_peligrosa",
    label: "Permiso de carga peligrosa",
    ayuda: "Solo si transportas sustancias peligrosas. Déjalo vacío si no aplica.",
    opcional: true,
  },
];

export type Vencimientos = Record<ClaveVencimiento, string> & { patente: string };

export const VENCIMIENTOS_VACIOS: Vencimientos = {
  patente: "",
  revision_tecnica: "",
  permiso_circulacion: "",
  soap: "",
  carga_peligrosa: "",
};

export type EstadoVencimiento = "sin_fecha" | "vigente" | "por_vencer" | "vencido";

/** Días que faltan para la fecha indicada (negativos si ya pasó). */
export function diasRestantes(fecha: string): number | null {
  if (!fecha) return null;
  const objetivo = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(objetivo.getTime())) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.round((objetivo.getTime() - hoy.getTime()) / 86_400_000);
}

/** Semáforo documental: rojo si venció, ámbar si vence en menos de 30 días. */
export function estadoVencimiento(fecha: string): {
  estado: EstadoVencimiento;
  dias: number | null;
  texto: string;
} {
  const dias = diasRestantes(fecha);
  if (dias === null) return { estado: "sin_fecha", dias: null, texto: "Sin fecha registrada" };
  if (dias < 0)
    return {
      estado: "vencido",
      dias,
      texto: `Vencido hace ${Math.abs(dias)} ${Math.abs(dias) === 1 ? "día" : "días"}`,
    };
  if (dias === 0) return { estado: "vencido", dias, texto: "Vence hoy" };
  if (dias <= 30)
    return { estado: "por_vencer", dias, texto: `Vence en ${dias} ${dias === 1 ? "día" : "días"}` };
  return { estado: "vigente", dias, texto: `Vigente · ${dias} días` };
}

/** Resumen para mostrar una alerta general en el panel. */
export function resumenVencimientos(datos: Vencimientos) {
  let vencidos = 0;
  let porVencer = 0;
  for (const d of DOCUMENTOS_VENCIMIENTO) {
    const e = estadoVencimiento(datos[d.clave]).estado;
    if (e === "vencido") vencidos += 1;
    if (e === "por_vencer") porVencer += 1;
  }
  return { vencidos, porVencer };
}

/** Fechas de vencimiento del transportista, guardadas en su propia ficha. */
export function useVencimientos(userId?: string) {
  const [datos, setDatos] = useState<Vencimientos>(VENCIMIENTOS_VACIOS);
  const [cargando, setCargando] = useState(false);

  const recargar = useCallback(async () => {
    if (!userId) {
      setDatos(VENCIMIENTOS_VACIOS);
      return;
    }
    setCargando(true);
    // Espera a que la sesión esté restaurada antes de leer (si no, la lectura vuelve vacía).
    const { data: ses } = await supabase.auth.getSession();
    if (!ses.session || ses.session.user.id !== userId) {
      setCargando(false);
      return;
    }
    const { data, error } = await supabase
      .from("vencimientos_documentales")
      .select("patente, revision_tecnica, permiso_circulacion, soap, carga_peligrosa")
      .eq("user_id", userId)
      .maybeSingle();
    setCargando(false);
    if (error) {
      toast.error("No pudimos cargar tus vencimientos", { description: error.message });
      return;
    }
    setDatos({
      patente: data?.patente ?? "",
      revision_tecnica: data?.revision_tecnica ?? "",
      permiso_circulacion: data?.permiso_circulacion ?? "",
      soap: data?.soap ?? "",
      carga_peligrosa: data?.carga_peligrosa ?? "",
    });
  }, [userId]);

  useEffect(() => {
    void recargar();
    const { data: sub } = supabase.auth.onAuthStateChange((evento) => {
      if (evento === "SIGNED_IN" || evento === "INITIAL_SESSION") void recargar();
    });
    return () => sub.subscription.unsubscribe();
  }, [recargar]);

  const guardar = useCallback(
    async (valores: Vencimientos): Promise<string | null> => {
      if (!userId) return "Debes iniciar sesión para guardar tus vencimientos.";
      const { data: ses } = await supabase.auth.getSession();
      if (!ses.session) return "Tu sesión expiró. Vuelve a iniciar sesión e inténtalo nuevamente.";
      const { data, error } = await supabase
        .from("vencimientos_documentales")
        .upsert(
          {
            user_id: userId,
            patente: valores.patente.trim(),
            revision_tecnica: valores.revision_tecnica || null,
            permiso_circulacion: valores.permiso_circulacion || null,
            soap: valores.soap || null,
            carga_peligrosa: valores.carga_peligrosa || null,
          },
          { onConflict: "user_id" },
        )
        .select("patente, revision_tecnica, permiso_circulacion, soap, carga_peligrosa")
        .single();
      if (error) return error.message;
      if (!data) return "El guardado no fue confirmado. Revisa tu conexión e inténtalo nuevamente.";
      // Refleja exactamente lo que quedó guardado.
      setDatos({
        patente: data.patente ?? "",
        revision_tecnica: data.revision_tecnica ?? "",
        permiso_circulacion: data.permiso_circulacion ?? "",
        soap: data.soap ?? "",
        carga_peligrosa: data.carga_peligrosa ?? "",
      });
      return null;
    },
    [userId],
  );

  return { datos, cargando, guardar, recargar };
}
