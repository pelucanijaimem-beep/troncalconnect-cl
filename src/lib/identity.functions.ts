import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/require-session";
import { rutValido } from "./rut";

/** El vínculo se crea únicamente desde una cuenta autenticada, nunca desde el aviso. */
export const iniciarVerificacionIdentidad = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const key = process.env["DIDIT_API_KEY"];
    const workflow = process.env["DIDIT_WORKFLOW_ID"];
    if (!key) return { error: "La verificación de identidad aún no está configurada: falta DIDIT_API_KEY." };
    if (!workflow) return { error: "La verificación de identidad aún no está configurada: falta DIDIT_WORKFLOW_ID." };
    if (!process.env["DIDIT_WEBHOOK_SECRET"]) return { error: "La verificación de identidad aún no está configurada: falta DIDIT_WEBHOOK_SECRET." };
    const { data: perfil } = await context.supabase.rpc("mi_perfil");
    const parsedProfile = z.object({ rut: z.string(), bloqueado: z.boolean() }).safeParse(perfil);
    if (parsedProfile.success && parsedProfile.data.bloqueado) return { error: "Tu cuenta está bloqueada. Contacta al equipo de soporte.", status: 403 };
    if (!parsedProfile.success || !rutValido(parsedProfile.data.rut)) return { error: "Revisa el RUT de tu perfil antes de verificar tu identidad." };
    try {
    const response = await fetch("https://verification.didit.me/v3/session/", {
      method: "POST", headers: { "Content-Type": "application/json", "x-api-key": key },
      body: JSON.stringify({ workflow_id: workflow, vendor_data: context.userId, language: "es", callback: "https://troncalconnect-cl.lovable.app/?verificacion=identidad" }),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return { error: "No pudimos iniciar la verificación. Inténtalo nuevamente." };
    const parsed = z.object({ session_id: z.string().uuid(), url: z.string().url() }).safeParse(await response.json());
    if (!parsed.success) return { error: "No pudimos iniciar la verificación." };
    const url = new URL(parsed.data.url);
    if (url.protocol !== "https:" || !(url.hostname === "didit.me" || url.hostname.endsWith(".didit.me"))) return { error: "No pudimos iniciar la verificación." };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("registrar_sesion_identidad_v2", { p_session: parsed.data.session_id, p_user: context.userId });
    if (error) return { error: "No pudimos vincular la verificación con tu cuenta." };
    return { url: parsed.data.url, session_id: parsed.data.session_id };
    } catch {
      return { error: "No pudimos conectar con la verificación de identidad. Inténtalo nuevamente." };
    }
  });

export const consultarMiIdentidad = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("verificaciones")
      .select("didit_estado,didit_rut_coincide").eq("user_id", context.userId).maybeSingle();
    if (error) return { error: "No pudimos consultar tu estado de identidad." };
    return { estado: data?.didit_estado ?? null, coincide: data?.didit_rut_coincide ?? null };
  });