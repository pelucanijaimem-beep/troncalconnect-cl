import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

/** Intentos fallidos permitidos por cuenta antes del bloqueo temporal. */
const MAX_INTENTOS_CUENTA = 5;
/** Intentos fallidos permitidos desde una misma dirección de internet. */
const MAX_INTENTOS_IP = 20;
/** Duración del bloqueo temporal, en minutos. */
const MINUTOS_BLOQUEO = 15;

/** Mensaje único: nunca revela si el RUT existe en la plataforma. */
const GENERICO = "RUT o contraseña incorrectos.";
const NO_DISPONIBLE = "El inicio de sesión no está disponible temporalmente. Inténtalo nuevamente.";

function exigirConsulta(error: { code?: string } | null, etapa: string) {
  if (error) {
    // Nunca registrar credenciales, RUT, correos ni detalles de filas.
    console.error("[acceso-rut] consulta fallida", { etapa, codigo: error.code });
    throw new Error("Consulta de acceso fallida");
  }
}

function normalizar(valor: string) {
  return valor.replace(/[^0-9kK]/g, "").toLowerCase();
}

function ipDeLaSolicitud(): string {
  const h = getRequest().headers;
  const directa = h.get("cf-connecting-ip") ?? h.get("x-real-ip");
  if (directa) return directa;
  const reenviada = h.get("x-forwarded-for");
  return reenviada?.split(",")[0]?.trim() || "desconocida";
}

type Admin = Awaited<
  typeof import("@/integrations/supabase/client.server")
>["supabaseAdmin"];

async function bloqueoActivo(admin: Admin, claves: string[]) {
  const { data, error } = await admin
    .from("intentos_login")
    .select("clave, bloqueado_hasta")
    .in("clave", claves);
  exigirConsulta(error, "consultar_bloqueo");
  const ahora = Date.now();
  return (data ?? []).some(
    (f) => f.bloqueado_hasta && new Date(f.bloqueado_hasta).getTime() > ahora,
  );
}

async function anotarFallo(admin: Admin, clave: string, maximo: number) {
  const { data, error } = await admin
    .from("intentos_login")
    .select("intentos, bloqueado_hasta")
    .eq("clave", clave)
    .maybeSingle();
  exigirConsulta(error, "consultar_intentos");

  const vencido =
    !data?.bloqueado_hasta || new Date(data.bloqueado_hasta).getTime() <= Date.now();
  const intentos = (vencido && data?.bloqueado_hasta ? 0 : (data?.intentos ?? 0)) + 1;
  const bloqueado_hasta =
    intentos >= maximo
      ? new Date(Date.now() + MINUTOS_BLOQUEO * 60_000).toISOString()
      : null;

  const { error: errorEscritura } = await admin
    .from("intentos_login")
    .upsert(
      { clave, intentos: bloqueado_hasta ? 0 : intentos, bloqueado_hasta },
      { onConflict: "clave" },
    );
  exigirConsulta(errorEscritura, "guardar_intento");
}

async function limpiar(admin: Admin, claves: string[]) {
  const { error } = await admin
    .from("intentos_login")
    .upsert(
      claves.map((clave) => ({ clave, intentos: 0, bloqueado_hasta: null })),
      { onConflict: "clave" },
    );
  exigirConsulta(error, "limpiar_intentos");
}

/**
 * Inicia sesión con RUT y contraseña. El RUT se normaliza (sin puntos ni
 * guión) y los errores son siempre genéricos para no revelar qué cuentas
 * existen. Tras 5 fallos de una cuenta —o 20 desde una misma dirección de
 * internet— el acceso queda bloqueado 15 minutos.
 */
export const iniciarSesionConRut = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({ rut: z.string().min(1), password: z.string().min(1) }).parse(data),
  )
  .handler(async ({ data }) => {
    const rut = normalizar(data.rut);
    if (!rut) return { error: GENERICO } as const;
    let etapa = "cliente_administrativo";
    try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as Admin;
    const claveRut = `rut:${rut}`;
    const claveIp = `ip:${ipDeLaSolicitud()}`;

    etapa = "consultar_bloqueo";
    if (await bloqueoActivo(admin, [claveRut, claveIp])) {
      return {
        error: `Demasiados intentos fallidos. Vuelve a intentarlo en ${MINUTOS_BLOQUEO} minutos.`,
      } as const;
    }

    etapa = "consultar_perfil";
    const { data: perfil, error: errorPerfil } = await admin
      .from("perfiles")
      .select("email")
      .eq("rut_normalizado", rut)
      .maybeSingle();
    exigirConsulta(errorPerfil, etapa);

    if (!perfil?.email) {
      await anotarFallo(admin, claveRut, MAX_INTENTOS_CUENTA);
      await anotarFallo(admin, claveIp, MAX_INTENTOS_IP);
      return { error: GENERICO } as const;
    }

    etapa = "configurar_cliente_acceso";
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) {
      console.error("[acceso-rut] configuración incompleta", {
        urlDisponible: Boolean(url), claveDisponible: Boolean(key),
      });
      return { error: NO_DISPONIBLE } as const;
    }
    // Cliente independiente: el acceso nunca reemplaza la identidad administrativa.
    const cliente = createClient<Database>(url, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => {
        const headers = new Headers(input instanceof Request ? input.headers : undefined);
        new Headers(init?.headers).forEach((value, name) => headers.set(name, value));
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      } },
    });

    etapa = "validar_contraseña";
    const { data: sesion, error } = await cliente.auth.signInWithPassword({
      email: perfil.email,
      password: data.password,
    });

    if (error || !sesion.session) {
      await anotarFallo(admin, claveRut, MAX_INTENTOS_CUENTA);
      await anotarFallo(admin, claveIp, MAX_INTENTOS_IP);
      return { error: GENERICO } as const;
    }

    etapa = "limpiar_intentos";
    await limpiar(admin, [claveRut, claveIp]);
    return {
      access_token: sesion.session.access_token,
      refresh_token: sesion.session.refresh_token,
    } as const;
    } catch (error) {
      console.error("[acceso-rut] excepción", {
        etapa,
        tipo: error instanceof Error ? error.name : "Error desconocido",
      });
      return { error: NO_DISPONIBLE } as const;
    }
  });
