import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "./require-session";
import { cargasDelCorredor, estimarRuta, tarifaReferencial } from "./cotizador";

const FUNCION = "asistente_rutas";

/**
 * Asistente IA del cotizador de portada. Calcula distancia, peajes y tarifa desde
 * cargas reales visibles para el usuario (RLS) y el modelo solo redacta esos datos.
 */
export const consultarAsistenteRutas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        origen: z.string().trim().min(1).max(60),
        destino: z.string().trim().min(1).max(60),
        carga: z.string().trim().max(80),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<{ respuesta: string | null }> => {
    const ruta = estimarRuta(data.origen, data.destino);
    if (!ruta) return { respuesta: null };

    const { data: perfil, error: errorPerfil } = await context.supabase.rpc("mi_perfil");
    const parsed = z.object({ bloqueado: z.boolean() }).safeParse(perfil);
    if (errorPerfil || !parsed.success || parsed.data.bloqueado) return { respuesta: null };

    const { data: pausa, error: errorPausa } = await context.supabase
      .from("estado_acceso_ia")
      .select("funcion")
      .eq("funcion", FUNCION)
      .maybeSingle();
    if (errorPausa || pausa) return { respuesta: null };

    const { data: filas, error } = await context.supabase
      .from("cargas")
      .select("origen, destino, valor_km")
      .eq("estado", "activa")
      .eq("pais", "CL")
      .limit(500);
    if (error) {
      console.error("[asistente-rutas] lectura", { codigo: error.code });
      return { respuesta: null };
    }
    const cargas = (filas ?? []).map((f) => ({ origen: f.origen, destino: f.destino, valorKm: Number(f.valor_km) }));
    const { ida, retorno } = cargasDelCorredor(cargas, data.origen, data.destino);
    const tarifa = tarifaReferencial(cargas, data.origen, data.destino);

    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { respuesta: null };
    const { redactarRespuestaRuta } = await import("./asistente-rutas.server");
    const resultado = await redactarRespuestaRuta(getRequest(), key, {
      origen: data.origen,
      destino: data.destino,
      carga: data.carga || "no indicada",
      distanciaKmAprox: ruta.km,
      horasAprox: ruta.horas,
      plazasPeajeTroncal: ruta.plazas,
      peajesClp: { minimo: ruta.peajeMin, maximo: ruta.peajeMax, nota: "camión de más de 2 ejes, solo plazas troncales" },
      tarifaReferencialClpPorKm: tarifa
        ? { valor: tarifa.valorKm, cargasConsideradas: tarifa.muestras, alcance: tarifa.alcance === "tramo" ? "mismo tramo" : "promedio general del tablero" }
        : null,
      cargasPublicadasEnElTramo: ida,
      cargasDeRetornoDesdeDestino: retorno,
    });
    if ("error" in resultado) {
      console.error("[asistente-rutas] ia", { etapa: resultado.error, status: resultado.status });
      if (resultado.status === 402 || resultado.status === 403) {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error: errorGuardar } = await supabaseAdmin.from("estado_acceso_ia").upsert({
          funcion: FUNCION,
          estado: resultado.status,
          mensaje: "El asistente de rutas no está disponible temporalmente.",
        });
        if (errorGuardar) console.error("[asistente-rutas] pausa", { codigo: errorGuardar.code });
      }
      return { respuesta: null };
    }
    return { respuesta: resultado.respuesta };
  });
