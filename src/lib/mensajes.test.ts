import { describe, expect, it } from "vitest";
import { totalSinLeer, validarMensaje, type Conversacion } from "./mensajes";

describe("chat por carga", () => {
  it("rechaza mensajes vacíos", () => {
    expect(validarMensaje("   ")).not.toBeNull();
  });
  it("rechaza mensajes sobre 1000 caracteres", () => {
    expect(validarMensaje("a".repeat(1001))).not.toBeNull();
    expect(validarMensaje("a".repeat(1000))).toBeNull();
  });
  it("suma los no leídos de todas las conversaciones", () => {
    const base = { carga_id: "c", transportista_id: "t", ruta: "", soy_empresa: true, contraparte: "", ultimo_texto: null, ultimo_at: null };
    expect(totalSinLeer([{ ...base, sin_leer: 2 }, { ...base, sin_leer: 3 }] as Conversacion[])).toBe(5);
  });
});
