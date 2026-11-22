import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { cargaElegible } from "./load-matching";
import { filtrarCargasVoz, reportesDeRuta, type ConsultaVoz } from "./voice-route";
import type { Coordenadas } from "./load-search-location";

export type ContextoVoz = {
  supabase: SupabaseClient<Database>;
  userId: string;
  ids: string[];
  gps: Coordenadas | null;
};
const inicioSchema = z.object({
  token: z.string().min(20).max(12000),
  ids: z.array(z.string().uuid()).max(1000),
  gps: z
    .object({ latitud: z.number().min(-90).max(90), longitud: z.number().min(-180).max(180) })
    .strict()
    .nullable(),
});
export async function autorizarVoz(
  entrada: unknown,
  url: string,
  key: string,
): Promise<ContextoVoz> {
  const datos = inicioSchema.parse(entrada);
  const supabase = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      headers: { Authorization: `Bearer ${datos.token}` },
      fetch: (input, init) => {
        const headers = new Headers(input instanceof Request ? input.headers : undefined);
        new Headers(init?.headers).forEach((value, name) => headers.set(name, value));
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`)
          headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
  const { data, error } = await supabase.auth.getClaims(datos.token);
  if (error || !data?.claims?.sub) throw new Error("Tu sesión venció. Vuelve a iniciar sesión.");
  const contexto = { supabase, userId: data.claims.sub, ids: datos.ids, gps: datos.gps };
  await verificarAccesoVoz(contexto);
  return contexto;
}
export async function verificarAccesoVoz(contexto: ContextoVoz) {
  const { data, error } = await contexto.supabase.rpc("mi_perfil");
  const perfil = z.object({ rol: z.string(), bloqueado: z.boolean() }).safeParse(data);
  if (error || !perfil.success) throw new Error("No pudimos comprobar tu cuenta.");
  if (perfil.data.bloqueado || perfil.data.rol !== "camionero")
    throw new Error("El asistente está disponible para transportistas habilitados.");
  const { data: pausa, error: errorPausa } = await contexto.supabase
    .from("estado_acceso_ia")
    .select("mensaje,estado")
    .in("funcion", ["voz_ruta", "cargas"]);
  if (errorPausa) throw new Error("El asistente no está disponible temporalmente.");
  if (pausa?.length) throw new Error(pausa[0]?.mensaje || "El asistente está pausado.");
}
export async function cargasParaVoz(contexto: ContextoVoz, consulta: ConsultaVoz) {
  await verificarAccesoVoz(contexto);
  const hoy = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [cargas, verificacion, insignias, preferencias] = await Promise.all([
    contexto.supabase
      .from("cargas")
      .select(
        "id,user_id,titulo,origen,destino,tipo_camion,toneladas,fecha,fecha_entrega,hora_retiro,km,tipo_carga,solo_verificados,precio",
      )
      .in("id", contexto.ids)
      .eq("estado", "activa")
      .eq("pais", "CL"),
    contexto.supabase.rpc("mi_verificacion_resumen"),
    contexto.supabase.rpc("insignias_transportista", { p_id: contexto.userId }),
    contexto.supabase
      .from("preferencias_alertas")
      .select("ciudad_base")
      .eq("user_id", contexto.userId)
      .maybeSingle(),
  ]);
  if (cargas.error || verificacion.error || insignias.error || preferencias.error)
    throw new Error("No pudimos consultar las cargas disponibles.");
  const verificado = z.object({ estado: z.string() }).safeParse(verificacion.data);
  const permisos = z.object({ peligrosas: z.boolean() }).safeParse(insignias.data);
  const disponibles = (cargas.data || []).filter((c) =>
    cargaElegible(
      c,
      contexto.userId,
      verificado.success && verificado.data.estado === "verificado",
      permisos.success && permisos.data.peligrosas,
      hoy,
    ),
  );
  const base = preferencias.data?.ciudad_base || "";
  if (consulta.cerca && !consulta.origen && !contexto.gps && !base)
    return {
      cargas: [],
      pregunta: "¿En qué ciudad estás ahora? No contamos con ubicación ni ciudad base.",
    };
  const seleccionadas = filtrarCargasVoz(disponibles, consulta, contexto.gps, base);
  return {
    hoy,
    proximidad: "Aproximada por centro de ciudad, no distancia por carretera",
    cargas: seleccionadas.map(({ user_id, ...c }) => c),
  };
}
export async function reportesParaVoz(contexto: ContextoVoz, origen: string, destino: string) {
  await verificarAccesoVoz(contexto);
  const ahora = Date.now();
  const lugares = [origen, destino].filter(Boolean);
  if (!lugares.length)
    return { reportes: [], pregunta: "¿Qué origen y destino quieres consultar?" };
  const { data, error } = await contexto.supabase.rpc("reportes_ruta_recientes", {
    p_ciudades: lugares,
    p_exacta: true,
    p_dias: 45,
    p_limite: 100,
  });
  if (error) throw new Error("No pudimos consultar los reportes de ruta.");
  return {
    fuente: "Reportes de camioneros en TroncalTrack",
    verificados: false,
    tiempo_real: false,
    reportes: reportesDeRuta(data || [], origen, destino, ahora),
    advertencia:
      "Sin reportes no significa ruta segura; vehículos detenidos solo si alguien los reportó, sin ubicación vial exacta.",
  };
}
export async function pausarVoz(status: number, mensaje: string) {
  if (status !== 402 && status !== 403) return;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("estado_acceso_ia")
    .upsert({ funcion: "voz_ruta", estado: status, mensaje });
  if (error) console.error("[voz-ruta] pausa", { codigo: error.code });
}
