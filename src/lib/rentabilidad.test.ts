import { describe, expect, it } from "vitest";
import { categoriaPeaje, margenOperativo, peajesEstimados } from "./rentabilidad";

describe("peajes estimados Ruta 5", () => {
  it("cobra 4 plazas a $11.300 a un camión de más de 2 ejes en 400 km", () => {
    const p = peajesEstimados(400, "Rampla Plana");
    expect(p.categoria).toBe("mas_2_ejes");
    expect(p.plazas).toBe(4);
    expect(p.total).toBe(45_200);
  });
  it("usa la tarifa de 2 ejes para el Camión 3/4", () => {
    expect(categoriaPeaje("Camión 3/4")).toBe("2_ejes");
    expect(peajesEstimados(400, "Camión 3/4").total).toBe(24_800);
  });
  it("cobra al menos una plaza en tramos cortos", () => {
    expect(peajesEstimados(30, "Tolva").plazas).toBe(1);
  });
});

describe("margen operativo estimado", () => {
  it("resta diésel y peajes del total y calcula $/km neto", () => {
    const m = margenOperativo(800_000, 300_000, 45_200, 400);
    expect(m.neto).toBe(454_800);
    expect(m.porKm).toBe(1_137);
  });
  it("puede quedar negativo cuando los costos superan el flete", () => {
    expect(margenOperativo(100_000, 120_000, 10_000, 100).neto).toBe(-30_000);
  });
});
