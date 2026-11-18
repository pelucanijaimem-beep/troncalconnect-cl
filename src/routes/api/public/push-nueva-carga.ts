import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Entrada = z.object({
  carga_id: z.string().uuid(),
  token: z.string().regex(/^[a-f0-9]{64}$/),
});

/**
 * Llamado por la base de datos al publicarse una carga pública. Solo actúa con
 * el token de un solo uso que la propia base guardó en su cola privada.
 */
export const Route = createFileRoute("/api/public/push-nueva-carga")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let cuerpo: unknown;
        try {
          cuerpo = await request.json();
        } catch {
          return Response.json({ ok: false }, { status: 400 });
        }
        const entrada = Entrada.safeParse(cuerpo);
        if (!entrada.success) return Response.json({ ok: false }, { status: 400 });

        const { procesarPushNuevaCarga } = await import("@/lib/push-envio.server");
        const r = await procesarPushNuevaCarga(entrada.data.carga_id, entrada.data.token);
        if (!r.aceptado) return Response.json({ ok: false }, { status: 401 });
        return Response.json({ ok: true, enviados: r.enviados });
      },
    },
  },
});
