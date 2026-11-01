import { createFileRoute } from "@tanstack/react-router";
import { identityEventSchema, identityStatus, verifyIdentitySignature } from "@/lib/identity-webhook";
import type { Json } from "@/integrations/supabase/types";

export const identityHandlers = {
    GET: () => Response.json({ servicio: "TroncalCheck", estado: "Recepción de avisos de identidad" }),
    POST: async ({ request }: { request: Request }) => {
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
      if (payload && typeof payload === "object" && !("session_id" in payload)) return new Response("OK");
      const parsed = identityEventSchema.safeParse(payload);
      if (!parsed.success) return new Response(null, { status: 400 });
      const event = parsed.data;
      // El timestamp debe estar dentro del cuerpo firmado, no solo en una cabecera reemplazable.
      if (event.timestamp !== Number(request.headers.get("x-timestamp"))) return new Response(null, { status: 401 });
      if (event.decision?.session_id && event.decision.session_id !== event.session_id) return new Response(null, { status: 400 });
      if (!["Not Started", "In Progress", "In Review", "Approved", "Declined", "Abandoned", "Expired", "Kyc Expired", "Resubmitted", "Awaiting User"].includes(event.status)) return new Response("OK");
      try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.rpc("procesar_identidad_v2", {
        p_session: event.session_id, p_event: event.event_id, p_fecha: event.created_at,
        p_entorno: event.environment, p_estado: identityStatus(event.status), p_decision: JSON.parse(JSON.stringify(event.decision ?? null)) as Json,
      });
      if (error) return Response.json({ error: "No pudimos guardar el resultado de identidad." }, { status: 500 });
      return new Response("OK");
      } catch { return Response.json({ error: "No pudimos procesar el aviso de identidad." }, { status: 500 }); }
    },
};

export const Route = createFileRoute("/api/public/identidad")({
  server: { handlers: identityHandlers },
});