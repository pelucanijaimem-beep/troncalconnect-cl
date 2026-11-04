import { describe, expect, it } from "vitest";
import { coordenadasCiudad, origenCercano, referenciaUbicacion, usaMiUbicacion } from "./load-search-location";
describe("ubicación de búsqueda", () => {
  it("detecta cerca de mí con tilde", () => expect(usaMiUbicacion("¿Hay cargas cerca de mí esta semana?")).toBe(true));
  it("no pide GPS para ciudad explícita", () => expect(usaMiUbicacion("cerca de Concepción")).toBe(false));
  it("prioriza GPS sobre ciudad base", () => expect(referenciaUbicacion({ latitud: -36.827, longitud: -73.05 }, "Santiago")?.fuente).toBe("gps"));
  it("usa ciudad base si no hay GPS", () => expect(referenciaUbicacion(null, "Concepción")?.fuente).toBe("base"));
  it("no inventa ubicación si no existe respaldo", () => expect(referenciaUbicacion(null, "")).toBeNull());
  it("cerca de Concepción admite Talcahuano pero no Santiago", () => {
    const ref = referenciaUbicacion(coordenadasCiudad("Concepción"), "");
    expect(origenCercano("Talcahuano", ref)).toBe(true);
    expect(origenCercano("Santiago", ref)).toBe(false);
  });
  it("ciudad base no geocodificada solo compara ciudad exacta", () => expect(origenCercano("Lebu", referenciaUbicacion(null, "Lebu"))).toBe(true));
});