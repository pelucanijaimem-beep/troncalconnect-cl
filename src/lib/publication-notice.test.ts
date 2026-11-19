import { describe, expect, it } from "vitest";
import { avisoPublicaciones } from "./publication-notice";
import type { ConsumoPublicaciones } from "./membresia.functions";
const consumo = (plan: string, publicadas: number, incluidas: number | null, adicional_uf: number): ConsumoPublicaciones => ({ plan, publicadas, incluidas, adicional_uf, excedentes: 0, importe_uf: 0, siguiente_adicional: false, mes: "2026-11-01" });
describe("planes generadores sin medidor de publicaciones", () => {
  it("Starter nunca muestra aviso de cuota", () => {
    expect(avisoPublicaciones(consumo("generador_starter", 14, null, 0))).toBeNull();
    expect(avisoPublicaciones(consumo("generador_starter", 500, null, 0))).toBeNull();
  });
  it("Pro nunca muestra aviso de cuota", () => expect(avisoPublicaciones(consumo("generador_pro", 500, null, 0))).toBeNull());
  it("Starter y Pro no avisan aunque llegue un consumo antiguo con cuota", () => {
    expect(avisoPublicaciones(consumo("generador_starter", 16, 15, 0.03))).toBeNull();
    expect(avisoPublicaciones(consumo("generador_pro", 61, 60, 0.02))).toBeNull();
  });
  it("Enterprise nunca avisa", () => expect(avisoPublicaciones(consumo("generador_enterprise", 200, null, 0))).toBeNull());
  it("sin consumo no inventa cuota", () => expect(avisoPublicaciones(null)).toBeNull());
});
