import { describe, expect, it } from "vitest";
import { fechaValida, normalizarLectura } from "./lectura-vencimientos";

describe("lectura de vencimientos", () => {
  it("acepta solo fechas reales en formato AAAA-MM-DD", () => {
    expect(fechaValida("2027-03-15")).toBe(true);
    expect(fechaValida("2027-02-30")).toBe(false);
    expect(fechaValida("15/03/2027")).toBe(false);
  });
  it("descarta valores dudosos y normaliza la patente", () => {
    expect(
      normalizarLectura({ revision_tecnica: "2027-03-15", soap: "no visible", permiso_circulacion: null, patente: "ab·cd-12" }),
    ).toEqual({ revision_tecnica: "2027-03-15", patente: "ABCD12" });
  });
});
