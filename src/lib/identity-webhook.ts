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
      personal_number: z.string().max(80).nullish(),
      document_type: z.string().max(80).nullish(),
      full_name: z.string().max(300).nullish(),
      first_name: z.string().max(150).nullish(),
      last_name: z.string().max(150).nullish(),
      status: z.string().max(80).optional(),
    }).passthrough()).max(30).optional(),
  }).passthrough().nullish(),
});

export function canonicalIdentityJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalIdentityJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const object = value as Record<string, unknown>;
    return `{${Object.keys(object).sort().map(key => `${JSON.stringify(key)}:${canonicalIdentityJson(object[key])}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

export function identityStatus(status: string): string {
  return status.trim().toLowerCase().replace(/\s+/g, "_");
}

/** Firma canónica de cuerpo completo, incluida la fecha firmada. */
export function verifyIdentitySignature(raw: string, headers: Headers, secret: string, now = Date.now()): boolean {
  const timestamp = headers.get("x-timestamp") ?? "";
  if (!/^\d{10}$/.test(timestamp)) return false;
  if (Math.abs(Math.floor(now / 1000) - Number(timestamp)) > 300) return false;
  try {
    const payload: unknown = JSON.parse(raw);
    if (!payload || typeof payload !== "object" || !("timestamp" in payload) || payload.timestamp !== Number(timestamp)) return false;
    const expected = createHmac("sha256", secret).update(canonicalIdentityJson(payload), "utf8").digest();
    return ["x-signature-v2", "x-signature-v2-previous"].some(header => {
      const signature = headers.get(header) ?? "";
      return /^[a-fA-F0-9]{64}$/.test(signature) && timingSafeEqual(expected, Buffer.from(signature, "hex"));
    });
  } catch { return false; }
}

export function identityRutMatches(registered: string, extracted: string): boolean {
  return rutValido(registered) && rutValido(extracted) && normalizarRut(registered) === normalizarRut(extracted);
}