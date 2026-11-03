import { describe, expect, it } from "vitest";
import { calcularDador, patenteValida, calcularFlota, convertirUF, DESCUENTO_FUNDADOR, leerUFDelDia, MESES_LANZAMIENTO, PLANES_GENERADORES, PLANES_TRANSPORTE, precioFundador, UF_RESPALDO } from "./pricing";

describe("Membresías en CLP", () => {
  it("un camión es gratis para siempre", () => { expect(calcularFlota(1)?.totalClp).toBe(0); });
  it("Flota Mediana cobra 4990 por camión de 2 a 20", () => {
    expect(calcularFlota(2)?.totalClp).toBe(9980);
    expect(calcularFlota(5)?.totalClp).toBe(24950);
    expect(calcularFlota(20)?.totalClp).toBe(99800);
  });
  it("Enterprise aplica 3500 a todos los camiones desde 21", () => {
    expect(calcularFlota(21)?.totalClp).toBe(73500);
    expect(calcularFlota(300)?.totalClp).toBe(1050000);
  });
  it("cobra por patentes registradas y no por actividad", () => {
    expect(calcularFlota(300)?.totalClp).not.toBe(calcularFlota(200)?.totalClp);
  });
  it("Empresa Pyme cuesta 49990 e incluye 10 publicaciones y un usuario", () => {
    expect(PLANES_GENERADORES[0]).toMatchObject({ clp: 49990, publicaciones: 10, usuarios: 1 });
    expect(calcularDador("empresa_pyme", 1)?.totalClp).toBe(49990);
    expect(calcularDador("empresa_pyme", 2)).toBeNull();
  });
  it("Premium cuesta 149990 por licencia activa con publicaciones ilimitadas", () => {
    expect(PLANES_GENERADORES[1]).toMatchObject({ clp: 149990, publicaciones: Infinity });
    expect(calcularDador("corporativo_premium", 2)?.totalClp).toBe(299980);
    expect(calcularDador("corporativo_premium", 5)?.totalClp).toBe(749950);
  });
  it("mantiene Fundador 20% sobre los nuevos precios", () => {
    expect(DESCUENTO_FUNDADOR).toBe(0.2);
    expect(calcularFlota(5)?.fundadorClp).toBe(19960);
    expect(calcularDador("empresa_pyme", 1)?.fundadorClp).toBe(39992);
  });
  it("mantiene cuatro meses de lanzamiento sin cambiar tarifa normal", () => {
    expect(MESES_LANZAMIENTO).toBe(4);
    expect(calcularFlota(5)?.totalClp).toBe(24950);
  });
  it("rechaza conteos inválidos", () => {
    for (const n of [-1, 1.5, NaN, Infinity]) expect(calcularFlota(n)).toBeNull();
    for (const n of [0, -1, 1.5, NaN]) expect(calcularDador("corporativo_premium", n)).toBeNull();
    expect(calcularDador("plan_inventado", 1)).toBeNull();
  });
  it("valida patentes chilenas y normaliza guiones", () => {
    expect(patenteValida("BCDF-12")).toBe(true);
    expect(patenteValida("AB1234")).toBe(true);
    expect(patenteValida("ABCDE")).toBe(false);
    expect(patenteValida("BCDF12<script>")).toBe(false);
  });
});

describe("UF diaria", () => {
  const ahora = new Date("2026-11-01T23:09:00Z");
  it("Convierte la referencia 41.252,94 CLP a pesos enteros", () => {
    expect(UF_RESPALDO).toBe(41252.94);
    expect(convertirUF(1.3, UF_RESPALDO)).toBe(53629);
    expect(convertirUF(3.2, UF_RESPALDO)).toBe(132009);
    expect(convertirUF(10, UF_RESPALDO)).toBe(412529);
    expect(convertirUF(0.25, UF_RESPALDO)).toBe(10313);
    expect(convertirUF(0.17, UF_RESPALDO)).toBe(7013);
    expect(convertirUF(0.08, UF_RESPALDO)).toBe(3300);
  });
  it("Lee el valor del día calendario de Chile", () => {
    expect(leerUFDelDia({ serie: [{ fecha: "2026-11-01T03:00:00Z", valor: 41252.94 }] }, ahora)).toEqual({ valor: 41252.94, fecha: "2026-11-01" });
  });
  it("No presenta un dato anterior como actualizado", () => {
    expect(leerUFDelDia({ serie: [{ fecha: "2026-10-31T03:00:00Z", valor: 41000 }] }, ahora)).toBeNull();
  });
  it("Rechaza respuestas incorrectas, no finitas y sin serie", () => {
    for (const payload of [null, {}, { serie: [] }, { serie: [{ fecha: "2026-11-01T03:00:00Z", valor: 0 }] }, { serie: [{ fecha: "2026-11-01T03:00:00Z", valor: Infinity }] }]) {
      expect(leerUFDelDia(payload, ahora)).toBeNull();
    }
  });
});