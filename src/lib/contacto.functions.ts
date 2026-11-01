import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { contactoSchema } from "./contacto-schema";

export const enviarMensajeContacto = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => contactoSchema.parse(input))
  .handler(async ({ data }) => {
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) throw new Error("No pudimos enviar tu mensaje. Intenta nuevamente más tarde.");
    const authorization = getRequestHeader("Authorization");
    const client = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        ...(authorization ? { headers: { Authorization: authorization } } : {}),
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        },
      },
    });
    let userId: string | null = null;
    if (authorization) {
      const { data: auth, error } = await client.auth.getUser(authorization.replace(/^Bearer\s+/i, ""));
      if (error || !auth.user) throw new Error("Tu sesión expiró. Vuelve a ingresar o envía el mensaje sin sesión.");
      userId = auth.user.id;
    }
    const { error } = await client.from("mensajes_contacto").insert({ ...data, user_id: userId });
    if (error) throw new Error("No pudimos guardar tu mensaje. Intenta nuevamente.");
    const { avisarMensajeContacto } = await import("./contacto-email.server");
    await avisarMensajeContacto(data);
    return { ok: true };
  });