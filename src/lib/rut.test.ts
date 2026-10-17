import { describe, expect, it } from "vitest";
import { normalizarRut, rutValido } from "./rut";

describe("RUT de registro", () => {
  it("exige un RUT no vacío", () => {
    expect(rutValido("")).toBe(false);
  });
  it("valida el dígito verificador módulo 11", () => {
    expect(rutValido("12.345.678-5")).toBe(true);
    expect(rutValido("12.345.678-9")).toBe(false);
  });
  it("acepta puntos y guión opcionales y K en ambos casos", () => {
    for (const rut of ["6.000.000-K", "6000000k", "6000000-K", "6.000.000k"]) {
      expect(rutValido(rut)).toBe(true);
      expect(normalizarRut(rut)).toBe("6000000k");
    }
  });
  it("rechaza caracteres inválidos y cuerpos fuera del formato chileno", () => {
    for (const rut of ["abc123456785", "123456785!", "00000000-0", "1234567890-3"]) {
      expect(rutValido(rut)).toBe(false);
    }
  });
});