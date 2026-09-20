import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Solicitud pública de eliminación de cuenta: cualquier persona puede pedirla
 * desde la página web, sin iniciar sesión.
 */
export const solicitarEliminacionCuenta = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string; motivo?: string }) => {
    const email = (input?.email ?? "").trim().toLowerCase();
    if (!email || !email.includes("@")) throw new Error("Correo no válido");
    return { email, motivo: (input?.motivo ?? "").slice(0, 1000) };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("solicitudes_eliminacion").insert({
      email: data.email,
      motivo: data.motivo,
      origen: "web",
    });
    if (error) throw new Error("No pudimos registrar la solicitud");
    return { ok: true };
  });

/** Elimina la cuenta del usuario conectado y todos sus datos asociados. */
export const eliminarMiCuenta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    await supabaseAdmin.from("solicitudes_eliminacion").insert({
      email: (context.claims?.email as string | undefined) ?? "",
      motivo: "Eliminación solicitada desde la aplicación",
      origen: "app",
      estado: "procesada",
    });

    await supabaseAdmin.from("favoritos").delete().eq("user_id", userId);
    await supabaseAdmin.from("postulaciones").delete().eq("user_id", userId);
    await supabaseAdmin.from("notificaciones").delete().eq("user_id", userId);
    await supabaseAdmin.from("preferencias_alertas").delete().eq("user_id", userId);
    await supabaseAdmin.from("verificaciones").delete().eq("user_id", userId);
    await supabaseAdmin.from("cargas").delete().eq("user_id", userId);
    await supabaseAdmin.from("perfiles").delete().eq("id", userId);

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw new Error("No pudimos eliminar la cuenta");
    return { ok: true };
  });
