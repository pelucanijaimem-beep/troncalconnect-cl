import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "./require-session";
import { DIAS_VIGENCIA_REPORTE, datosParaResumen, filtroCiudades } from "./alertas-ruta-resumen";

/**
 * Resume con IA los reportes recientes de camioneros para una ruta. El modelo
 * solo redacta a partir de reportes reales; si no hay reportes no se consulta.
 */
export const resumirAlertasRuta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ origen: z.string().max(120), destino: z.string().max(120) }).parse(input),
  )
  .handler(async ({ data, context }): Promise<{ resumen: string | null }> => {
    const filtro = filtroCiudades(data.origen, data.destino);
    if (!filtro) return { resumen: null };

    const { data: perfil, error: errorPerfil } = await context.supabase.rpc("mi_perfil");
    const parsed = z.object({ bloqueado: z.boolean() }).safeParse(perfil);
    if (errorPerfil || !parsed.success || parsed.data.bloqueado) return { resumen: null };

    const { data: pausa, error: errorPausa } = await context.supabase
      .from("estado_acceso_ia")
      .select("funcion")
      .eq("funcion", "resumen_ruta")
      .maybeSingle();
    if (errorPausa || pausa) return { resumen: null };

    const desde = new Date(Date.now() - DIAS_VIGENCIA_REPORTE * 86_400_000).toISOString();
    const { data: reportes, error } = await context.supabase
      .from("alertas_ruta")
      .select("tipo, origen, destino, detalle, created_at")
      .gte("created_at", desde)
      .or(filtro)
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) {
      console.error("[resumen-ruta] lectura", { codigo: error.code });
      return { resumen: null };
    }
    if (!reportes?.length) return { resumen: null };

    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { resumen: null };
    const { redactarResumen } = await import("./alertas-ruta.server");
    const resultado = await redactarResumen(getRequest(), key, datosParaResumen(reportes, new Date()));
    if ("error" in resultado) {
      console.error("[resumen-ruta] ia", { etapa: resultado.error, status: resultado.status });
      if (resultado.status === 402 || resultado.status === 403) {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error: errorGuardar } = await supabaseAdmin.from("estado_acceso_ia").upsert({
          funcion: "resumen_ruta",
          estado: resultado.status,
          mensaje: "El resumen automático de reportes no está disponible temporalmente.",
        });
        if (errorGuardar) console.error("[resumen-ruta] pausa", { codigo: errorGuardar.code });
      }
      return { resumen: null };
    }
    return { resumen: resultado.resumen };
  });
