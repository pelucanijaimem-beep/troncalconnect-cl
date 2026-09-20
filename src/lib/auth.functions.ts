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
  const { data } = await admin
    .from("intentos_login")
    .select("clave, bloqueado_hasta")
    .in("clave", claves);
  const ahora = Date.now();
  return (data ?? []).some(
    (f) => f.bloqueado_hasta && new Date(f.bloqueado_hasta).getTime() > ahora,
  );
}

async function anotarFallo(admin: Admin, clave: string, maximo: number) {
  const { data } = await admin
    .from("intentos_login")
    .select("intentos, bloqueado_hasta")
    .eq("clave", clave)
    .maybeSingle();

  const vencido =
    !data?.bloqueado_hasta || new Date(data.bloqueado_hasta).getTime() <= Date.now();
  const intentos = (vencido && data?.bloqueado_hasta ? 0 : (data?.intentos ?? 0)) + 1;
  const bloqueado_hasta =
    intentos >= maximo
      ? new Date(Date.now() + MINUTOS_BLOQUEO * 60_000).toISOString()
      : null;

  await admin
    .from("intentos_login")
    .upsert(
      { clave, intentos: bloqueado_hasta ? 0 : intentos, bloqueado_hasta },
      { onConflict: "clave" },
    );
}

async function limpiar(admin: Admin, claves: string[]) {
  await admin
    .from("intentos_login")
    .upsert(
      claves.map((clave) => ({ clave, intentos: 0, bloqueado_hasta: null })),
      { onConflict: "clave" },
    );
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

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as Admin;
    const claveRut = `rut:${rut}`;
    const claveIp = `ip:${ipDeLaSolicitud()}`;

    if (await bloqueoActivo(admin, [claveRut, claveIp])) {
      return {
        error: `Demasiados intentos fallidos. Vuelve a intentarlo en ${MINUTOS_BLOQUEO} minutos.`,
      } as const;
    }

    const { data: perfil } = await admin
      .from("perfiles")
      .select("email")
      .eq("rut_normalizado", rut)
      .maybeSingle();

    if (!perfil?.email) {
      await anotarFallo(admin, claveRut, MAX_INTENTOS_CUENTA);
      await anotarFallo(admin, claveIp, MAX_INTENTOS_IP);
      return { error: GENERICO } as const;
    }

    const cliente = createClient<Database>(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_PUBLISHABLE_KEY"]!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );

    const { data: sesion, error } = await cliente.auth.signInWithPassword({
      email: perfil.email,
      password: data.password,
    });

    if (error || !sesion.session) {
      await anotarFallo(admin, claveRut, MAX_INTENTOS_CUENTA);
      await anotarFallo(admin, claveIp, MAX_INTENTOS_IP);
      return { error: GENERICO } as const;
    }

    await limpiar(admin, [claveRut, claveIp]);
    return {
      access_token: sesion.session.access_token,
      refresh_token: sesion.session.refresh_token,
    } as const;
  });
