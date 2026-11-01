import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "./require-session";
import { cargaElegible, validarCoincidencias } from "./load-matching";

export const buscarCargasCompatibles = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ descripcion: z.string().trim().min(10).max(2000), ids: z.array(z.string().uuid()).max(100) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: perfil, error: errorPerfil } = await context.supabase.rpc("mi_perfil");
    const parsed = z.object({ rol: z.string(), bloqueado: z.boolean() }).safeParse(perfil);
    if (errorPerfil || !parsed.success) return { error: "No pudimos consultar tu cuenta.", status: 503 };
    if (parsed.data.bloqueado || parsed.data.rol !== "camionero") return { error: "Esta búsqueda está disponible para cuentas de transportistas habilitadas.", status: 403 };
    const { data: pausa, error: errorPausa } = await context.supabase.from("estado_acceso_ia").select("mensaje,estado").eq("funcion", "cargas").maybeSingle();
    if (errorPausa) return { error: "La búsqueda con IA no está disponible temporalmente.", status: 503 };
    if (pausa) return { error: pausa.mensaje, status: pausa.estado };
    if (!data.ids.length) return { coincidencias: [] };
    const [verificacion, insignias, consulta] = await Promise.all([
      context.supabase.rpc("mi_verificacion_resumen"),
      context.supabase.rpc("insignias_transportista", { p_id: context.userId }),
      context.supabase.from("cargas").select("id,user_id,titulo,origen,destino,tipo_camion,toneladas,fecha,fecha_entrega,hora_retiro,km,tipo_carga,solo_verificados").in("id", data.ids).eq("estado", "activa").eq("pais", "CL"),
    ]);
    if (consulta.error || verificacion.error || insignias.error) return { error: "No pudimos consultar las cargas disponibles.", status: 503 };
    const verificado = z.object({ estado: z.string() }).safeParse(verificacion.data);
    const habilitado = z.object({ peligrosas: z.boolean() }).safeParse(insignias.data);
    const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    const cargas = (consulta.data ?? []).filter((c) => cargaElegible(c, context.userId, verificado.success && verificado.data.estado === "verificado", habilitado.success && habilitado.data.peligrosas, hoy));
    if (!cargas.length) return { coincidencias: [] };
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { error: "La búsqueda con IA aún no está configurada.", status: 503 };
    const { analizarCargas } = await import("./load-matching.server");
    const resultado = await analizarCargas(getRequest(), key, data.descripcion, cargas.map(({ user_id, ...c }) => c));
    if ("error" in resultado) {
      if (resultado.status === 403) {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.from("estado_acceso_ia").upsert({ funcion: "cargas", mensaje: resultado.error, estado: resultado.status });
        if (error) console.error("[cargas-ia] no se pudo persistir pausa", { codigo: error.code });
      }
      return resultado;
    }
    return { coincidencias: validarCoincidencias(resultado.coincidencias, cargas.map((c) => c.id)) };
  });