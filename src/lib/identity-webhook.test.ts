import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { identityEventSchema, identityRutMatches, verifyIdentitySignature } from "./identity-webhook";

const secret = "solo-para-pruebas-no-es-una-credencial";
const now = 1792247160000;
const raw = JSON.stringify({ timestamp: now / 1000, decision: { id_verifications: [{ document_number: "12.345.678-5" }] } });
function headers(timestamp = now / 1000) {
  return new Headers({ "x-timestamp": String(timestamp), "x-signature": createHmac("sha256", secret).update(raw).digest("hex") });
}
describe("Aviso de identidad", () => {
  it("acepta una firma válida del cuerpo completo", () => {
    expect(verifyIdentitySignature(raw, headers(), secret, now)).toBe(true);
  });
  it("rechaza modificar el RUT firmado", () => {
    expect(verifyIdentitySignature(raw.replace("12.345.678-5", "11.111.111-1"), headers(), secret, now)).toBe(false);
  });
  it("rechaza avisos de más de cinco minutos", () => {
    expect(verifyIdentitySignature(raw, headers(now / 1000 - 301), secret, now)).toBe(false);
  });
  it("no acepta una firma limitada al sobre", () => {
    expect(verifyIdentitySignature(raw, new Headers({ "x-timestamp": String(now / 1000), "x-signature-simple": "a".repeat(64) }), secret, now)).toBe(false);
  });
  it("normaliza puntos, guión y K para comparar", () => {
    expect(identityRutMatches("6.000.000-K", "6000000k")).toBe(true);
  });
  it("envía discrepancias y RUT inválido a revisión, no a aprobación", () => {
    expect(identityRutMatches("12.345.678-5", "11.111.111-1")).toBe(false);
    expect(identityRutMatches("12.345.678-5", "12.345.678-9")).toBe(false);
  });
  it("exige una sesión identificable en el aviso", () => {
    expect(identityEventSchema.safeParse({ event_id: crypto.randomUUID() }).success).toBe(false);
  });
});