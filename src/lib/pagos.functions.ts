import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type PlanPago = "transportista" | "empresa";

const PLANES: Record<PlanPago, { titulo: string; precio: number }> = {
  transportista: { titulo: "TroncalTrack · Transportista Pro (mensual)", precio: 14990 },
  empresa: { titulo: "TroncalTrack · Empresa Pro (mensual)", precio: 29990 },
};

export type RespuestaPago =
  | { ok: true; url: string }
  | { ok: false; motivo: "sin_credenciales" | "error"; mensaje: string };

/**
 * Crea una preferencia de pago (Checkout) y devuelve la URL de cobro.
 * Requiere la credencial MERCADOPAGO_ACCESS_TOKEN configurada en el backend.
 */
export const crearPagoPlan = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        plan: z.enum(["transportista", "empresa"]),
        email: z.string().email().optional(),
        origen: z.string().url().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<RespuestaPago> => {
    const token = process.env["MERCADOPAGO_ACCESS_TOKEN"];
    if (!token) {
      return {
        ok: false,
        motivo: "sin_credenciales",
        mensaje: "El cobro en línea aún no está habilitado.",
      };
    }

    const plan = PLANES[data.plan];
    const base = data.origen?.replace(/\/$/, "") ?? "";

    try {
      const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              id: data.plan,
              title: plan.titulo,
              quantity: 1,
              currency_id: "CLP",
              unit_price: plan.precio,
            },
          ],
          ...(data.email ? { payer: { email: data.email } } : {}),
          ...(base
            ? {
                back_urls: {
                  success: `${base}/planes?pago=exito`,
                  pending: `${base}/planes?pago=pendiente`,
                  failure: `${base}/planes?pago=fallido`,
                },
                auto_return: "approved",
              }
            : {}),
          metadata: { plan: data.plan },
          statement_descriptor: "TRONCALTRACK",
        }),
      });

      if (!res.ok) {
        return {
          ok: false,
          motivo: "error",
          mensaje: "No pudimos iniciar el cobro en este momento.",
        };
      }

      const json = (await res.json()) as { init_point?: string; sandbox_init_point?: string };
      const url = json.init_point ?? json.sandbox_init_point;
      if (!url) {
        return { ok: false, motivo: "error", mensaje: "No pudimos iniciar el cobro." };
      }
      return { ok: true, url };
    } catch {
      return { ok: false, motivo: "error", mensaje: "No pudimos iniciar el cobro." };
    }
  });
