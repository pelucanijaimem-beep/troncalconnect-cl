import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { normalizarRut, rutValido } from "./rut";

export const identityEventSchema = z.object({
  event_id: z.string().uuid(),
  session_id: z.string().uuid(),
  webhook_type: z.enum(["status.updated", "data.updated"]),
  timestamp: z.number().int().positive(),
  created_at: z.number().int().positive(),
  environment: z.enum(["live", "sandbox"]),
  status: z.string().min(1).max(80),
  decision: z.object({
    session_id: z.string().uuid().optional(),
    status: z.string().max(80).optional(),
    id_verifications: z.array(z.object({
      document_number: z.string().max(80).nullish(),
      status: z.string().max(80).optional(),
    })).max(30).optional(),
  }).nullish(),
});

/** Firma de cuerpo completo: no admite la variante que solo firma el sobre. */
export function verifyIdentitySignature(raw: string, headers: Headers, secret: string, now = Date.now()): boolean {
  const timestamp = headers.get("x-timestamp") ?? "";
  const signature = headers.get("x-signature") ?? "";
  if (!/^\d{10}$/.test(timestamp) || !/^[a-fA-F0-9]{64}$/.test(signature)) return false;
  if (Math.abs(Math.floor(now / 1000) - Number(timestamp)) > 300) return false;
  const expected = createHmac("sha256", secret).update(raw, "utf8").digest();
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}

export function identityRutMatches(registered: string, extracted: string): boolean {
  return rutValido(registered) && rutValido(extracted) && normalizarRut(registered) === normalizarRut(extracted);
}