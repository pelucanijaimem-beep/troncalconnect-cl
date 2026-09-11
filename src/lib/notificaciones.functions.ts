import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Destinatario = { email: string; nombre: string };

/** Envía un correo si el servicio de correo está configurado. Nunca lanza error. */
async function enviarCorreo(params: {
  para: Destinatario;
  asunto: string;
  titulo: string;
  cuerpo: string;
}): Promise<boolean> {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey || !params.para.email) return false;
  const remitente = process.env["TRONCALTRACK_EMAIL_FROM"] ?? "TroncalTrack <onboarding@resend.dev>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: remitente,
        to: [params.para.email],
        subject: params.asunto,
        html: `<div style="font-family:Arial,Helvetica,sans-serif;color:#111">
          <h2 style="color:#c1121f;margin:0 0 12px">${params.titulo}</h2>
          <div style="font-size:15px;line-height:1.6">${params.cuerpo}</div>
          <p style="margin-top:24px;font-size:12px;color:#666">
            TroncalTrack — Plataforma de cargas y transporte. Este es un aviso automático.
          </p>
        </div>`,
      }),
    });
    return res.ok;
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
      para: { email: dueno?.email ?? "", nombre: dueno?.nombre ?? "" },
      asunto: `Nueva postulación: ${ruta}`,
      titulo: "Recibiste una postulación en TroncalTrack",
      cuerpo: `
        <p><strong>${nombre}</strong> postuló a tu carga <strong>${carga.titulo}</strong> (${ruta}).</p>
        <p><strong>Sello de confianza:</strong> ${sello}<br/>
        <strong>Teléfono de contacto:</strong> ${telefono}<br/>
        <strong>Correo:</strong> ${postulante?.email ?? "No informado"}</p>
        <p>Ingresa a tu panel para revisar el perfil completo y confirmar el viaje.</p>`,
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
