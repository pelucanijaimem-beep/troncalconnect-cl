import { createFileRoute } from "@tanstack/react-router";
import { identityEventSchema, verifyIdentitySignature } from "@/lib/identity-webhook";

export const Route = createFileRoute("/api/public/identidad")({
  server: { handlers: {
    GET: () => Response.json({ servicio: "TroncalCheck", estado: "Recepción de avisos de identidad" }),
    POST: async ({ request }) => {
      const secret = process.env["DIDIT_WEBHOOK_SECRET"];
      if (!secret) return Response.json({ error: "Verificación de avisos aún no configurada" }, { status: 503 });
      if (Number(request.headers.get("content-length")) > 1_000_000) return new Response(null, { status: 413 });
      // Límite también para solicitudes sin Content-Length.
      const reader = request.body?.getReader();
      if (!reader) return new Response(null, { status: 400 });
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        size += part.value.byteLength;
        if (size > 1_000_000) { await reader.cancel(); return new Response(null, { status: 413 }); }
        chunks.push(part.value);
      }
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!verifyIdentitySignature(raw, request.headers, secret)) return new Response(null, { status: 401 });
      let payload: unknown;
      try { payload = JSON.parse(raw); } catch { return new Response(null, { status: 400 }); }
      const parsed = identityEventSchema.safeParse(payload);
      if (!parsed.success) return new Response(null, { status: 400 });
      const event = parsed.data;
      // El timestamp debe estar dentro del cuerpo firmado, no solo en una cabecera reemplazable.
      if (event.timestamp !== Number(request.headers.get("x-timestamp"))) return new Response(null, { status: 401 });
      if (event.decision?.session_id && event.decision.session_id !== event.session_id) return new Response(null, { status: 400 });
      if (!["Approved", "Declined", "In Review", "Expired", "Kyc Expired", "Abandoned"].includes(event.status)) return Response.json({ recibido: true });
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const id = event.decision?.id_verifications?.[0];
      const status = event.status === "Approved" && event.decision?.status === "Approved" && id?.status === "Approved" ? "Approved" : "In Review";
      const { data, error } = await supabaseAdmin.rpc("procesar_resultado_identidad", {
        p_session: event.session_id, p_event: event.event_id, p_fecha: event.created_at,
        p_entorno: event.environment, p_estado: status, p_rut: id?.document_number ?? "",
      });
      if (error) return new Response(null, { status: 500 });
      if (data === "sin_vinculo") return new Response(null, { status: 409 });
      return Response.json({ recibido: true });
    },
  } },
});