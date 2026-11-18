import { describe, expect, it } from "vitest";
import { calcularContraoferta, esContraoferta, mensajeContraoferta } from "./contraoferta";

describe("contraoferta", () => {
  it("compara una propuesta por $/km con la tarifa publicada", () => {
    const c = calcularContraoferta(400, 2_000, "km", 2_200)!;
    expect(c.totalPublicado).toBe(800_000);
    expect(c.totalPropuesto).toBe(880_000);
    expect(c.diferencia).toBe(80_000);
    expect(c.porcentaje).toBe(10);
  });
  it("acepta un monto total y calcula su $/km", () => {
    const c = calcularContraoferta(400, 2_000, "total", 720_000)!;
    expect(c.valorKmPropuesto).toBe(1_800);
    expect(c.porcentaje).toBe(-10);
  });
  it("rechaza montos vacíos o en cero", () => {
    expect(calcularContraoferta(400, 2_000, "total", 0)).toBeNull();
    expect(calcularContraoferta(400, 2_000, "km", Number.NaN)).toBeNull();
  });
  it("limita el mensaje opcional a 140 caracteres y queda marcado como contraoferta", () => {
    const c = calcularContraoferta(400, 2_000, "km", 2_200)!;
    const texto = mensajeContraoferta(c, "x".repeat(300));
    expect(esContraoferta(texto)).toBe(true);
    expect(texto.endsWith("Mensaje: " + "x".repeat(140))).toBe(true);
  });
});
