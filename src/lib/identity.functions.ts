import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { rutValido } from "./rut";

/** El vínculo se crea únicamente desde una cuenta autenticada, nunca desde el aviso. */
export const iniciarVerificacionIdentidad = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const key = process.env["DIDIT_API_KEY"];
    const workflow = process.env["DIDIT_WORKFLOW_ID"];
    if (!key || !workflow || !process.env["DIDIT_WEBHOOK_SECRET"]) return { error: "La verificación de identidad aún no está configurada." };
    const { data: perfil } = await context.supabase.rpc("mi_perfil");
    const parsedProfile = z.object({ rut: z.string(), rol: z.string() }).safeParse(perfil);
    if (!parsedProfile.success || parsedProfile.data.rol !== "camionero" || !rutValido(parsedProfile.data.rut)) return { error: "Revisa el RUT de tu perfil antes de verificar tu identidad." };
    const response = await fetch("https://verification.didit.me/v3/session/", {
      method: "POST", headers: { "Content-Type": "application/json", "x-api-key": key },
      body: JSON.stringify({ workflow_id: workflow, vendor_data: context.userId, language: "es" }),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return { error: "No pudimos iniciar la verificación. Inténtalo nuevamente." };
    const parsed = z.object({ session_id: z.string().uuid(), url: z.string().url() }).safeParse(await response.json());
    if (!parsed.success) return { error: "No pudimos iniciar la verificación." };
    const url = new URL(parsed.data.url);
    if (url.protocol !== "https:" || !(url.hostname === "didit.me" || url.hostname.endsWith(".didit.me"))) return { error: "No pudimos iniciar la verificación." };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("sesiones_identidad").insert({ session_id: parsed.data.session_id, user_id: context.userId, entorno: "live" });
    if (error) return { error: "No pudimos vincular la verificación con tu cuenta." };
    return { url: parsed.data.url };
  });