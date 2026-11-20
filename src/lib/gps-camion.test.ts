import { describe, expect, it } from "vitest";
import { camionesSinGps, gpsValido, normalizarGps } from "./gps-camion";

describe("rastreador GPS del camión", () => {
  it("acepta un IMEI de 15 dígitos aunque venga con espacios o guiones", () => {
    expect(normalizarGps("3586 8805-1234567")).toBe("358688051234567");
    expect(gpsValido("3586 8805-1234567")).toBe(true);
  });
  it("rechaza IDs muy cortos o con símbolos", () => {
    expect(gpsValido("12")).toBe(false);
    expect(gpsValido("ABC#123")).toBe(false);
  });
  it("detecta los camiones que aún no registran su GPS", () => {
    const lista = [{ id: "a", gps_dispositivo_id: "358688051234567" }, { id: "b", gps_dispositivo_id: null }, { id: "c" }];
    expect(camionesSinGps(lista).map((c) => c.id)).toEqual(["b", "c"]);
  });
});
