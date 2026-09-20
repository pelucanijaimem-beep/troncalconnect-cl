import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const HITOS = [30, 15, 7] as const;

const ETIQUETAS: Record<string, string> = {
  revision_tecnica: "Revisión Técnica",
  permiso_circulacion: "Permiso de Circulación",
  soap: "SOAP",
  carga_peligrosa: "Permiso de carga peligrosa",
};

function dias(fecha: string): number {
  const objetivo = new Date(`${fecha}T00:00:00`);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.round((objetivo.getTime() - hoy.getTime()) / 86_400_000);
}

/**
 * Revisa las fechas de vencimiento del propio usuario y le envía un aviso
 * cuando faltan 30, 15 o 7 días. Cada aviso se envía una sola vez.
 */
export const revisarVencimientos = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: fila } = await supabase
      .from("vencimientos_documentales")
      .select("patente, revision_tecnica, permiso_circulacion, soap, carga_peligrosa, avisos")
      .eq("user_id", userId)
      .maybeSingle();
    if (!fila) return { avisos: 0 };

    const avisos = { ...((fila.avisos ?? {}) as Record<string, string>) };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patente = (fila.patente ?? "").trim();
    let enviados = 0;

    for (const clave of Object.keys(ETIQUETAS)) {
      const fecha = (fila as Record<string, unknown>)[clave] as string | null;
      if (!fecha) continue;
      const restantes = dias(fecha);
      const hito = HITOS.find((h) => restantes <= h && restantes >= 0);
      const marca = restantes < 0 ? `${clave}:vencido` : hito ? `${clave}:${hito}` : null;
      if (!marca || avisos[marca]) continue;

      await supabaseAdmin.from("notificaciones").insert({
        user_id: userId,
        tipo: "vencimiento",
        titulo:
          restantes < 0
            ? `${ETIQUETAS[clave]} vencida`
            : `${ETIQUETAS[clave]} por vencer`,
        mensaje:
          restantes < 0
            ? `Tu ${ETIQUETAS[clave]}${patente ? ` (${patente})` : ""} venció el ${fecha}. Renuévala para seguir operando.`
            : `Tu ${ETIQUETAS[clave]}${patente ? ` (${patente})` : ""} vence en ${restantes} ${restantes === 1 ? "día" : "días"} (${fecha}).`,
        datos: { documento: clave, fecha, dias: restantes },
      });
      avisos[marca] = new Date().toISOString();
      enviados += 1;
    }

    if (enviados > 0) {
      await supabaseAdmin
        .from("vencimientos_documentales")
        .update({ avisos })
        .eq("user_id", userId);
    }

    return { avisos: enviados };
  });
