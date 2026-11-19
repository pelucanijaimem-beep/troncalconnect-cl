import { describe, expect, it } from "vitest";
import { calcularDador, patenteValida, calcularFlota, convertirUF, DESCUENTO_FUNDADOR, leerUFDelDia, MESES_LANZAMIENTO, PLANES_GENERADORES, PLANES_TRANSPORTE, precioFundador, UF_RESPALDO, importePublicacionesCLP } from "./pricing";

describe("Precios fijos en pesos", () => {
  it("mantiene los precios por camión solicitados", () => {
    expect(PLANES_TRANSPORTE.map(p => p.clp)).toEqual([0, 4990, 3500]);
    expect(calcularFlota(1)?.totalClp).toBe(0);
    expect(calcularFlota(5)?.totalClp).toBe(24950);
    expect(calcularFlota(20)?.totalClp).toBe(99800);
    expect(calcularFlota(21)?.totalClp).toBe(73500);
    expect(calcularFlota(300)?.totalClp).toBe(1050000);
  });
  it("fija los generadores en importes comerciales sin conversión diaria", () => {
    expect(PLANES_GENERADORES.map(p => p.clp)).toEqual([53990, 131990, 412990]);
  });
  it("Starter tiene publicaciones ilimitadas sin cobro adicional", () => {
    expect(calcularDador("generador_starter", 16)?.adicionalesClp).toBe(0);
    expect(calcularDador("generador_starter", 1000)?.totalClp).toBe(53990);
  });
  it("Pro y Enterprise tienen publicaciones ilimitadas sin cobro adicional", () => {
    expect(calcularDador("generador_pro", 1000)?.adicionalesClp).toBe(0);
    expect(calcularDador("generador_pro", 1000)?.totalClp).toBe(131990);
    expect(calcularDador("generador_enterprise", 100000)?.adicionalesClp).toBe(0);
  });
  it("aplica Fundador 20% a los nuevos precios", () => {
    expect(calcularFlota(5)?.fundadorClp).toBe(19960);
    expect(calcularDador("generador_starter", 16)?.fundadorClp).toBe(43192);
    expect(MESES_LANZAMIENTO).toBe(4);
  });
  it("no muestra importes por publicaciones adicionales en ningún plan generador", () => {
    expect(importePublicacionesCLP("generador_starter", 0.03)).toBe(0);
    expect(importePublicacionesCLP("generador_pro", 0.04)).toBe(0);
    expect(importePublicacionesCLP("generador_enterprise", 0)).toBe(0);
  });
});

describe("Membresías y excedentes en UF", () => {
  it("un camión sigue gratis", () => expect(calcularFlota(1)?.totalUf).toBe(0));
  it("Starter y Pro no registran UF adicional por publicaciones", () => {
    expect(calcularDador("generador_starter",100)?.adicionalesUf).toBe(0);
    expect(calcularDador("generador_starter",100)?.totalUf).toBe(1.3);
    expect(calcularDador("generador_pro",100)?.adicionalesUf).toBe(0);
  });
  it("Enterprise no tiene adicionales", () => {
    expect(calcularDador("generador_enterprise",100000)?.adicionalesUf).toBe(0);
    expect(calcularDador("generador_enterprise",100000)?.totalUf).toBe(10);
  });
  it("bases generadoras son UF, no por licencia", () => {
    expect(PLANES_GENERADORES.map(p=>p.uf)).toEqual([1.3,3.2,10]);
    expect(calcularDador("generador_pro",0)?.totalUf).toBe(3.2);
  });
  it("conserva los tramos de flotas con bases UF", () => {
    expect(calcularFlota(5)?.totalUf).toBe(0.605);
    expect(calcularFlota(20)?.totalUf).toBe(2.42);
    expect(calcularFlota(21)?.totalUf).toBe(1.7808);
    expect(calcularFlota(300)?.totalUf).toBe(25.44);
  });
  it("conserva Fundador 20% y lanzamiento cuatro meses", () => {
    expect(DESCUENTO_FUNDADOR).toBe(0.2);
    expect(precioFundador(1.33)).toBe(1.064);
    expect(MESES_LANZAMIENTO).toBe(4);
  });
  it("rechaza conteos inválidos", () => {
    for (const n of [-1,1.5,NaN,Infinity]) {
      expect(calcularFlota(n)).toBeNull(); expect(calcularDador("generador_pro",n)).toBeNull();
    }
    expect(calcularDador("inventado",1)).toBeNull();
  });
  it("valida patentes", () => {
    expect(patenteValida("BCDF-12")).toBe(true);
    expect(patenteValida("AB1234")).toBe(true);
    expect(patenteValida("ABCDE")).toBe(false);
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