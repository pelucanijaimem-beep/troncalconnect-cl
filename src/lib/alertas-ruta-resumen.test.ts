import { describe, expect, it } from "vitest";
import { datosParaResumen, filtroCiudades, limpiarCiudad } from "./alertas-ruta-resumen";

describe("resumen de reportes de ruta", () => {
  it("limpia caracteres que rompen el filtro por ciudad", () => {
    expect(limpiarCiudad("Concepción, (Biobío)%")).toBe("Concepción Biobío");
  });

  it("no filtra cuando no hay ciudades", () => {
    expect(filtroCiudades(" ", "")).toBeNull();
    expect(filtroCiudades("Temuco", "")).toBe("origen.ilike.%Temuco%,destino.ilike.%Temuco%");
  });

  it("entrega a la IA solo tipo, ruta, antigüedad y detalle, máximo 10 reportes", () => {
    const ahora = new Date("2026-11-16T12:00:00Z");
    const reporte = { tipo: "Ruta cortada o bloqueada", origen: "Santiago", destino: "Temuco", detalle: "x", created_at: "2026-11-13T12:00:00Z" };
    const datos = datosParaResumen(Array.from({ length: 12 }, () => reporte), ahora);
    expect(datos).toHaveLength(10);
    expect(datos[0]).toEqual({ tipo: "Ruta cortada o bloqueada", ruta: "Santiago → Temuco", hace_dias: 3, detalle: "x" });
  });
});
