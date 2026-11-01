import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/** Valida la sesión sin depender de cambios en archivos administrados. */
export const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) throw new Error("El servicio no está disponible temporalmente. Inténtalo nuevamente.");

    const authorization = getRequest().headers.get("authorization");
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
    if (!token || token.split(".").length !== 3) throw new Response("Sesión no válida", { status: 401 });

    const supabase = createClient<Database>(url, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      global: {
        headers: { Authorization: `Bearer ${token}` },
        fetch: (input, init) => {
          const headers = new Headers(input instanceof Request ? input.headers : undefined);
          new Headers(init?.headers).forEach((value, name) => headers.set(name, value));
          if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        },
      },
    });
    const { data, error } = await supabase.auth.getClaims(token);
    if (error || !data?.claims?.sub) throw new Response("Sesión no válida", { status: 401 });
    return next({ context: { supabase, userId: data.claims.sub, claims: data.claims } });
  },
);