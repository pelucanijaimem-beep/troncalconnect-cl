import { describe, expect, it } from "vitest";
import { filtrarCargasVoz, reportesDeRuta, type ConsultaVoz } from "./voice-route";
const consulta: ConsultaVoz = {
  origen: "Concepción",
  destino: "Santiago",
  desde: "2026-11-16",
  hasta: "2026-11-22",
  tipo_camion: "Sider",
  capacidad_toneladas: 20,
  cerca: false,
};
const carga = {
  id: "1",
  origen: "Concepción",
  destino: "Santiago",
  fecha: "2026-11-18",
  tipo_camion: "Sider",
  toneladas: 18,
};
describe("cargas por voz", () => {
  it("excluye sobrepeso para el camión informado", () =>
    expect(
      filtrarCargasVoz([carga, { ...carga, id: "2", toneladas: 21 }], consulta, null, "").map(
        (c) => c.id,
      ),
    ).toEqual(["1"]));
  it("excluye sentido contrario", () =>
    expect(
      filtrarCargasVoz(
        [{ ...carga, origen: "Santiago", destino: "Concepción" }],
        consulta,
        null,
        "",
      ),
    ).toEqual([]));
  it("excluye fechas fuera de disponibilidad", () =>
    expect(filtrarCargasVoz([{ ...carga, fecha: "2026-11-23" }], consulta, null, "")).toEqual([]));
  it("excluye carrocería incompatible", () =>
    expect(filtrarCargasVoz([{ ...carga, tipo_camion: "Tolva" }], consulta, null, "")).toEqual([]));
  it("usa ciudad base sin GPS para cercanía", () =>
    expect(
      filtrarCargasVoz(
        [carga, { ...carga, id: "2", origen: "Santiago" }],
        { ...consulta, origen: null, cerca: true },
        null,
        "Concepción",
      ).map((c) => c.id),
    ).toEqual(["1"]));
  it("prefiere GPS sobre ciudad base", () =>
    expect(
      filtrarCargasVoz(
        [carga],
        { ...consulta, origen: null, cerca: true },
        { latitud: -33.4489, longitud: -70.6693 },
        "Concepción",
      ),
    ).toEqual([]));
});
describe("reportes comunitarios", () => {
  it("solo incluye reportes de la ruta durante los últimos 45 días", () => {
    const ahora = Date.parse("2026-11-16T00:00:00Z");
    const r = { origen: "Concepción", destino: "Santiago", created_at: "2026-11-15T00:00:00Z" };
    expect(
      reportesDeRuta(
        [
          r,
          { ...r, created_at: "2026-09-01T00:00:00Z" },
          { ...r, origen: "Arica", destino: "Iquique" },
        ],
        "Concepción",
        "Santiago",
        ahora,
      ),
    ).toEqual([r]);
  });
});
