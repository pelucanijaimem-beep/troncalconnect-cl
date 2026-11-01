import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { canonicalIdentityJson, identityEventSchema, identityRutMatches, identityStatus, verifyIdentitySignature } from "./identity-webhook";

const secret = "solo-para-pruebas-no-es-una-credencial";
const now = 1792247160000;
const raw = JSON.stringify({ timestamp: now / 1000, decision: { id_verifications: [{ document_number: "12.345.678-5" }] } });
function headers(timestamp = now / 1000) {
  return new Headers({ "x-timestamp": String(timestamp), "x-signature-v2": createHmac("sha256", secret).update(canonicalIdentityJson(JSON.parse(raw))).digest("hex") });
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
  it("ordena claves anidadas sin alterar arrays ni Unicode", () => {
    expect(canonicalIdentityJson({ z: [{ b: "Muñoz", a: "cédula" }], a: 1 })).toBe('{"a":1,"z":[{"a":"cédula","b":"Muñoz"}]}');
  });
  it("acepta JSON reordenado con espacios", () => {
    expect(verifyIdentitySignature(JSON.stringify(JSON.parse(raw), null, 2), headers(), secret, now)).toBe(true);
  });
  it("acepta la firma anterior durante rotación", () => {
    const h = headers();
    h.set("x-signature-v2-previous", h.get("x-signature-v2") ?? "");
    h.set("x-signature-v2", "a".repeat(64));
    expect(verifyIdentitySignature(raw, h, secret, now)).toBe(true);
  });
  it("rechaza una fecha de cabecera distinta de la firmada", () => {
    expect(verifyIdentitySignature(raw, headers(now / 1000 + 1), secret, now)).toBe(false);
  });
  it.each([['In Review','in_review'],['Kyc Expired','kyc_expired'],['Not Started','not_started'],['In Progress','in_progress'],['Approved','approved'],['Declined','declined'],['Abandoned','abandoned'],['Expired','expired'],['Resubmitted','resubmitted'],['Awaiting User','awaiting_user']])("normaliza %s", (status, expected) => {
    expect(identityStatus(status)).toBe(expected);
  });
  it("conserva la decisión completa y los campos personales", () => {
    const decision = { id_verifications: [{ personal_number: '12345678-5', document_number: '999', document_type: 'id_card', full_name: 'Ana Muñoz', issuing_state: 'CHL' }], extra: { nested: [1,2] } };
    const parsed = identityEventSchema.parse({ event_id: crypto.randomUUID(), session_id: crypto.randomUUID(), webhook_type: 'data.updated', timestamp: now / 1000, created_at: now / 1000, environment: 'live', status: 'Approved', decision });
    expect(parsed.decision).toEqual(decision);
  });
});