import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "./require-session";
import { MAX_BYTES_LECTURA, TIPOS_LECTURA, type LecturaDocumento } from "./lectura-vencimientos";

const FUNCION = "lectura_vencimientos";

export type ResultadoLectura =
  | { ok: true; lectura: LecturaDocumento }
  | { ok: false; motivo: "pausa" | "error" };

/**
 * Reads expiry dates from a photo or PDF uploaded by the signed-in user. The file is
 * only forwarded to the model for this read and never stored; dates fill the form for review.
 */
export const leerVencimientosDocumento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        nombre: z.string().trim().min(1).max(120),
        tipo: z.enum(TIPOS_LECTURA),
        base64: z
          .string()
          .min(16)
          .max(Math.ceil((MAX_BYTES_LECTURA * 4) / 3) + 8)
          .regex(/^[A-Za-z0-9+/=]+$/),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<ResultadoLectura> => {
    const { data: perfil, error: errorPerfil } = await context.supabase.rpc("mi_perfil");
    const parsed = z.object({ bloqueado: z.boolean() }).safeParse(perfil);
    if (errorPerfil || !parsed.success || parsed.data.bloqueado) return { ok: false, motivo: "error" };

    const { data: pausa, error: errorPausa } = await context.supabase
      .from("estado_acceso_ia")
      .select("funcion")
      .eq("funcion", FUNCION)
      .maybeSingle();
    if (errorPausa) return { ok: false, motivo: "error" };
    if (pausa) return { ok: false, motivo: "pausa" };

    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { ok: false, motivo: "error" };
    const { leerDocumentoVencimientos } = await import("./lectura-vencimientos.server");
    const resultado = await leerDocumentoVencimientos(getRequest(), key, data);
    if ("error" in resultado) {
      console.error("[lectura-vencimientos] ia", { etapa: resultado.error, status: resultado.status });
      if (resultado.status === 402 || resultado.status === 403) {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error: errorGuardar } = await supabaseAdmin.from("estado_acceso_ia").upsert({
          funcion: FUNCION,
          estado: resultado.status,
          mensaje: "La lectura automática de documentos no está disponible temporalmente.",
        });
        if (errorGuardar) console.error("[lectura-vencimientos] pausa", { codigo: errorGuardar.code });
        return { ok: false, motivo: "pausa" };
      }
      return { ok: false, motivo: "error" };
    }
    return { ok: true, lectura: resultado.lectura };
  });
