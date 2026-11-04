import { describe, expect, it } from "vitest";
import { avisoPublicaciones } from "./publication-notice";
import type { ConsumoPublicaciones } from "./membresia.functions";
const consumo = (plan: string, publicadas: number, incluidas: number | null, adicional_uf: number): ConsumoPublicaciones => ({ plan, publicadas, incluidas, adicional_uf, excedentes: 0, importe_uf: 0, siguiente_adicional: false, mes: "2026-11-01" });
describe("avisos de cuota sin bloqueo", () => {
  it("Starter avisa cuando quedan tres de quince", () => expect(avisoPublicaciones(consumo("generador_starter", 12, 15, 0.03))?.restantes).toBe(3));
  it("Pro avisa cuando quedan tres de sesenta", () => expect(avisoPublicaciones(consumo("generador_pro", 57, 60, 0.02))?.restantes).toBe(3));
  it("no avisa antes del umbral", () => expect(avisoPublicaciones(consumo("generador_starter", 11, 15, 0.03))).toBeNull());
  it("al alcanzar cuota muestra cero incluidas, no excedida", () => expect(avisoPublicaciones(consumo("generador_starter", 15, 15, 0.03))?.tipo).toBe("advertencia"));
  it("Starter superada usa tarifa existente 0,03", () => expect(avisoPublicaciones(consumo("generador_starter", 16, 15, 0.03))).toEqual({ tipo: "excedida", restantes: 0, tarifaUf: 0.03 }));
  it("Pro superada usa tarifa existente 0,02", () => expect(avisoPublicaciones(consumo("generador_pro", 61, 60, 0.02))?.tarifaUf).toBe(0.02));
  it("Enterprise nunca avisa", () => expect(avisoPublicaciones(consumo("generador_enterprise", 200, null, 0))).toBeNull());
  it("sin consumo no inventa cuota", () => expect(avisoPublicaciones(null)).toBeNull());
});