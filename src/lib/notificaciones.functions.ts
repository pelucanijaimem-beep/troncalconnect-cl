import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Envía un correo con una plantilla registrada. Nunca lanza error. */
async function enviarCorreo(params: {
  plantilla: "postulacion" | "coincidencia-carga";
  para: string;
  datos: Record<string, unknown>;
  idempotencyKey: string;
}): Promise<boolean> {
  if (!params.para) return false;
  try {
    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    const r = await sendTemplateEmail(params.plantilla, params.para, {
      templateData: params.datos,
      idempotencyKey: params.idempotencyKey,
    });
    return r.sent;
  } catch {
    return false;
  }
}

/**
 * Reserva instantánea: avisa a la empresa dueña de la carga que un camionero
 * verificado postuló, con sus datos de contacto y su sello TroncalCheck.
 */
export const avisarPostulacion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { cargaId: string }) => {
    if (!input?.cargaId) throw new Error("Falta la carga");
    return { cargaId: input.cargaId };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: carga } = await supabase
      .from("cargas")
      .select("id, user_id, titulo, origen, destino, empresa")
      .eq("id", data.cargaId)
      .maybeSingle();
    if (!carga) return { ok: false, correo: false };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: postulante } = await supabaseAdmin
      .from("perfiles")
      .select("nombre, email, telefono, verificado")
      .eq("id", userId)
      .maybeSingle();

    const nombre = postulante?.nombre ?? "Un camionero";
    const telefono = postulante?.telefono ?? "No informado";
    const sello = postulante?.verificado
      ? "Verificado — TroncalCheck"
      : "Sin verificación TroncalCheck";
    const ruta = `${carga.origen} → ${carga.destino}`;

    await supabaseAdmin.from("notificaciones").insert({
      user_id: carga.user_id,
      tipo: "postulacion",
      titulo: "Nueva postulación a tu carga",
      mensaje: `${nombre} (${sello}) postuló a ${ruta}. Teléfono: ${telefono}.`,
      datos: { carga_id: carga.id, postulante_id: userId, ruta },
    });

    const { data: dueno } = await supabaseAdmin
      .from("perfiles")
      .select("email, nombre")
      .eq("id", carga.user_id)
      .maybeSingle();

    const correo = await enviarCorreo({
      plantilla: "postulacion",
      para: dueno?.email ?? "",
      idempotencyKey: `postulacion-${carga.id}-${userId}`,
      datos: {
        empresa: dueno?.nombre ?? "",
        camionero: nombre,
        sello,
        telefono,
        correo: postulante?.email ?? "No informado",
        carga: carga.titulo,
        ruta,
      },
    });

    return { ok: true, correo };
  });

/**
 * Alertas de coincidencia: al publicar una carga, avisa a los camioneros cuyas
 * rutas frecuentes y tipo de carrocería calzan con la publicación.
 */
export const avisarCoincidencias = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { cargaId: string }) => {
    if (!input?.cargaId) throw new Error("Falta la carga");
    return { cargaId: input.cargaId };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: carga } = await supabase
      .from("cargas")
      .select("id, user_id, titulo, origen, destino, tipo_camion, empresa, valor_km, km")
      .eq("id", data.cargaId)
      .maybeSingle();
    if (!carga || carga.user_id !== userId) return { avisados: 0 };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: prefs } = await supabaseAdmin
      .from("preferencias_alertas")
      .select("user_id, email, nombre, origenes, destinos, carrocerias, alertas_email, activo")
      .eq("activo", true);

    const igual = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
    const ruta = `${carga.origen} → ${carga.destino}`;
    let avisados = 0;

    for (const p of prefs ?? []) {
      if (p.user_id === userId) continue;
      const origenes = (p.origenes ?? []) as string[];
      const destinos = (p.destinos ?? []) as string[];
      const carrocerias = (p.carrocerias ?? []) as string[];
      if (origenes.length + destinos.length + carrocerias.length === 0) continue;
      const calza =
        (origenes.length === 0 || origenes.some((o) => igual(o, carga.origen))) &&
        (destinos.length === 0 || destinos.some((d) => igual(d, carga.destino))) &&
        (carrocerias.length === 0 || carrocerias.some((c) => igual(c, carga.tipo_camion)));
      if (!calza) continue;

      await supabaseAdmin.from("notificaciones").insert({
        user_id: p.user_id,
        tipo: "coincidencia",
        titulo: "Nueva carga que calza con tus alertas",
        mensaje: `${ruta} · ${carga.tipo_camion} · publicada por ${carga.empresa}.`,
        datos: { carga_id: carga.id, ruta },
      });
      avisados += 1;

      if (p.alertas_email) {
        await enviarCorreo({
          para: { email: (p.email as string) ?? "", nombre: (p.nombre as string) ?? "" },
          asunto: `Carga disponible: ${ruta}`,
          titulo: "Una carga nueva calza con tus rutas frecuentes",
          cuerpo: `
            <p><strong>${carga.titulo}</strong></p>
            <p><strong>Ruta:</strong> ${ruta}<br/>
            <strong>Carrocería:</strong> ${carga.tipo_camion}<br/>
            <strong>Kilómetros:</strong> ${carga.km}</p>
            <p>Ingresa a tu tablero para postular con un clic antes que otro transportista.</p>`,
        });
      }
    }

    return { avisados };
  });
