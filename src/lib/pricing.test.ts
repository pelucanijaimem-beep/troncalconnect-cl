import { describe, expect, it } from "vitest";
import { calcularFlota, convertirUF, DESCUENTO_FUNDADOR, leerUFDelDia, MESES_LANZAMIENTO, PLANES_GENERADORES, PLANES_TRANSPORTE, precioFundador, UF_RESPALDO } from "./pricing";

describe("Matriz comercial", () => {
  it("Starter cuesta 1,3 UF con 15 publicaciones y 1 administrador", () => {
    expect(PLANES_GENERADORES[0]).toMatchObject({ uf: 1.3, publicaciones: 15, usuarios: 1 });
  });
  it("Pro cuesta 3,2 UF con 60 publicaciones y 3 usuarios", () => {
    expect(PLANES_GENERADORES[1]).toMatchObject({ uf: 3.2, publicaciones: 60, usuarios: 3 });
  });
  it("Enterprise parte en 10 UF y tiene publicaciones ilimitadas", () => {
    expect(PLANES_GENERADORES[2]).toMatchObject({ uf: 10, desde: true, publicaciones: Infinity });
  });
  it("Un camión es gratis permanente, independiente de lanzamiento", () => {
    expect(PLANES_TRANSPORTE[0]).toMatchObject({ uf: 0, min: 1, max: 1 });
    expect(calcularFlota(1)?.totalUf).toBe(0);
  });
  it("Pyme aplica 0,25 UF a los 2–9 activos", () => {
    expect(calcularFlota(2)?.totalUf).toBe(0.5);
    expect(calcularFlota(9)?.totalUf).toBe(2.25);
  });
  it("Mediana aplica 0,17 UF a los 10–49 activos", () => {
    expect(calcularFlota(10)?.totalUf).toBe(1.7);
    expect(calcularFlota(49)?.totalUf).toBe(8.33);
  });
  it("Enterprise aplica 0,08 UF desde 50 activos", () => {
    expect(calcularFlota(50)?.totalUf).toBe(4);
    expect(calcularFlota(200)?.totalUf).toBe(16);
  });
  it("500 declarados y solo 200 activos pagan por 200, no 500", () => {
    const empresa = { declarados: 500, activos: 200 };
    expect(calcularFlota(empresa.activos)?.totalUf).toBe(16);
    expect(calcularFlota(empresa.activos)?.totalUf).not.toBe(calcularFlota(empresa.declarados)?.totalUf);
  });
  it("Fundador descuenta 20% al precio real de generadores", () => {
    expect(DESCUENTO_FUNDADOR).toBe(0.2);
    expect(PLANES_GENERADORES.map(p => precioFundador(p.uf))).toEqual([1.04, 2.56, 8]);
  });
  it("Fundador de 5 activos paga 1 UF y de 200 paga 12,8 UF", () => {
    expect(calcularFlota(5)?.fundadorUf).toBe(1);
    expect(calcularFlota(200)?.fundadorUf).toBe(12.8);
  });
  it("Lanzamiento dura cuatro meses sin alterar la tarifa normal", () => {
    expect(MESES_LANZAMIENTO).toBe(4);
    expect(calcularFlota(5)?.totalUf).toBe(1.25);
  });
  it("Sin camiones activos no hay cobro; rechaza cantidades inválidas", () => {
    expect(calcularFlota(0)?.totalUf).toBe(0);
    expect(calcularFlota(-1)).toBeNull();
    expect(calcularFlota(1.5)).toBeNull();
    expect(calcularFlota(NaN)).toBeNull();
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