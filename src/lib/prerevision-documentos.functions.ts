import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "./require-session";
import { MAX_BYTES_LECTURA } from "./lectura-vencimientos";
import {
  esClavePrerevision,
  hoyChile,
  tipoDesdeRuta,
  veredictoDesde,
  type ClavePrerevision,
} from "./prerevision-documentos";

const FUNCION = "prerevision_documentos";

/**
 * Pre-revisión orientativa con IA de los documentos recién subidos por el propio usuario.
 * El resultado solo lo ven administradores; nunca aprueba ni rechaza. Si la IA falla,
 * no se guarda veredicto y el documento sigue en revisión manual normal.
 */
export const preRevisarDocumentos = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ claves: z.array(z.string()).max(20) }).parse(input),
  )
  .handler(async ({ data, context }): Promise<{ revisados: number }> => {
    const claves = [...new Set(data.claves.filter(esClavePrerevision))];
    if (claves.length === 0) return { revisados: 0 };

    const { data: perfil, error: errorPerfil } = await context.supabase.rpc("mi_perfil");
    const parsed = z.object({ bloqueado: z.boolean() }).safeParse(perfil);
    if (errorPerfil || !parsed.success || parsed.data.bloqueado) return { revisados: 0 };

    const { data: pausa, error: errorPausa } = await context.supabase
      .from("estado_acceso_ia")
      .select("funcion")
      .eq("funcion", FUNCION)
      .maybeSingle();
    if (errorPausa || pausa) return { revisados: 0 };

    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { revisados: 0 };

    // Lectura privilegiada acotada a la fila y archivos del propio usuario autenticado.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: fila, error: errorFila } = await supabaseAdmin
      .from("verificaciones")
      .select("documentos")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (errorFila || !fila) return { revisados: 0 };
    const documentos = (fila.documentos ?? {}) as Record<string, unknown>;

    const { data: previas } = await supabaseAdmin
      .from("prerevision_documentos")
      .select("clave, ruta")
      .eq("user_id", context.userId);
    const yaRevisadas = new Map((previas ?? []).map((p) => [p.clave, p.ruta]));

    const pendientes = claves.flatMap((clave) => {
      const ruta = documentos[clave];
      if (typeof ruta !== "string" || !ruta.startsWith(`${context.userId}/`)) return [];
      if (yaRevisadas.get(clave) === ruta) return [];
      const tipo = tipoDesdeRuta(ruta);
      return tipo ? [{ clave, ruta, tipo }] : [];
    });
    if (pendientes.length === 0) return { revisados: 0 };

    const { preRevisarDocumento } = await import("./prerevision-documentos.server");
    const request = getRequest();
    const hoy = hoyChile();
    let pausar: number | null = null;

    const resultados = await Promise.all(
      pendientes.map(async ({ clave, ruta, tipo }: { clave: ClavePrerevision; ruta: string; tipo: NonNullable<ReturnType<typeof tipoDesdeRuta>> }) => {
        const { data: archivo, error: errorDescarga } = await supabaseAdmin.storage.from("documentos").download(ruta);
        if (errorDescarga || !archivo || archivo.size === 0 || archivo.size > MAX_BYTES_LECTURA) return false;
        const datos = new Uint8Array(await archivo.arrayBuffer());
        const resultado = await preRevisarDocumento(request, key, {
          clave,
          nombre: ruta.split("/").pop() ?? `${clave}.dat`,
          tipo,
          datos,
          hoy,
        });
        if ("error" in resultado) {
          console.error("[prerevision-documentos] ia", { etapa: resultado.error, status: resultado.status });
          if (resultado.status === 402 || resultado.status === 403) pausar = resultado.status;
          return false;
        }
        const v = veredictoDesde(resultado.lectura, clave, hoy);
        const { error: errorGuardar } = await supabaseAdmin.from("prerevision_documentos").upsert({
          user_id: context.userId,
          clave,
          ruta,
          veredicto: v.veredicto,
          motivo: v.motivo,
          revisado_at: new Date().toISOString(),
        });
        if (errorGuardar) console.error("[prerevision-documentos] guardar", { codigo: errorGuardar.code });
        return !errorGuardar;
      }),
    );

    if (pausar !== null) {
      const { error: errorPausaGuardar } = await supabaseAdmin.from("estado_acceso_ia").upsert({
        funcion: FUNCION,
        estado: pausar,
        mensaje: "La pre-revisión automática de documentos no está disponible temporalmente.",
      });
      if (errorPausaGuardar) console.error("[prerevision-documentos] pausa", { codigo: errorPausaGuardar.code });
    }
    return { revisados: resultados.filter(Boolean).length };
  });
