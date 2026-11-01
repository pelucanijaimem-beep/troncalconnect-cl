import type { z } from "zod";
import type { contactoSchema } from "./contacto-schema";

export async function avisarMensajeContacto(data: z.infer<typeof contactoSchema>) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["RESEND_API_KEY"];
  if (!apiKey || !connectionKey) return { enviado: false, motivo: "configuracion_pendiente" };
  const destinatario = data.tipo === "soporte" ? "soporte@troncaltrack.com" : "sugerencias@troncaltrack.com";
  const fecha = new Date().toLocaleString("es-CL", { timeZone: "America/Santiago" });
  try {
    const response = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-Connection-Api-Key": connectionKey,
      },
      body: JSON.stringify({
        from: "TroncalTrack <soporte@troncaltrack.com>",
        to: [destinatario],
        reply_to: data.correo,
        subject: data.tipo === "soporte" ? "Nuevo mensaje de soporte — TroncalTrack" : "Nueva sugerencia — TroncalTrack",
        text: `Nombre: ${data.nombre}\nCorreo: ${data.correo}\nFecha y hora de Chile: ${fecha}\n\n${data.mensaje}`,
      }),
    });
    if (!response.ok) {
      const detalle = await response.text();
      console.error(`Aviso de contacto rechazado [${response.status}]: ${detalle}`);
      return { enviado: false, estado: response.status, detalle };
    }
    return { enviado: true };
  } catch {
    console.error("No se pudo enviar el aviso de contacto; el mensaje permanece guardado.");
    return { enviado: false, motivo: "envio_fallido" };
  }
}