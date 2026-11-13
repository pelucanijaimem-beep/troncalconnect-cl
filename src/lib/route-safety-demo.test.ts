import { describe, expect, it } from "vitest";
import { DEMO_LINK_TTL_MS, enlaceDemoVigente, validarPinDemostracion } from "./route-safety-demo";

describe("seguridad en ruta demostrativa", () => {
  it("acepta únicamente el PIN de cuatro dígitos 8492", () => {
    expect(validarPinDemostracion("8492", "origen", false)).toBeNull();
    for (const pin of ["", "849", "84922", "abcd", "0000"]) expect(validarPinDemostracion(pin, "origen", false)).not.toBeNull();
  });
  it("requiere retiro validado antes de la entrega", () => {
    expect(validarPinDemostracion("8492", "destino", false)).not.toBeNull();
    expect(validarPinDemostracion("8492", "destino", true)).toBeNull();
  });
  it("el enlace de muestra vence a los 15 minutos", () => {
    expect(DEMO_LINK_TTL_MS).toBe(900000);
    expect(enlaceDemoVigente(900000, false, 899999)).toBe(true);
    expect(enlaceDemoVigente(900000, false, 900000)).toBe(false);
  });
  it("no permite reutilizar un enlace de muestra consumido", () => {
    expect(enlaceDemoVigente(900000, true, 0)).toBe(false);
  });
});