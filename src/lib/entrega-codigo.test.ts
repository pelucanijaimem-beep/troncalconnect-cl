import { describe, expect, it } from "vitest";
import { interpretarResultado, limpiarCodigo, validarEntrega } from "./entrega-codigo";

const base = { codigo: "849201", nombre: "Carolina Soto", rut: "11.111.111-1" };

describe("cierre de entrega con código", () => {
  it("el código acepta solo 6 dígitos", () => {
    expect(limpiarCodigo("84-92 01 7")).toBe("849201");
    expect(validarEntrega({ ...base, codigo: "84920" }).codigo).toBeDefined();
    expect(validarEntrega(base)).toEqual({});
  });

  it("exige el nombre de quien recibe", () => {
    expect(validarEntrega({ ...base, nombre: "  " }).nombre).toBeDefined();
  });

  it("exige un RUT chileno válido", () => {
    expect(validarEntrega({ ...base, rut: "" }).rut).toBeDefined();
    expect(validarEntrega({ ...base, rut: "11.111.111-2" }).rut).toBeDefined();
  });

  it("un código incorrecto muestra el mensaje pedido", () => {
    const r = interpretarResultado({ ok: false, error: "codigo_incorrecto", restantes: 3 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.mensaje.startsWith("Código incorrecto, verifícalo con el receptor")).toBe(true);
  });

  it("tras agotar los intentos pide un código nuevo", () => {
    const r = interpretarResultado({ ok: false, error: "bloqueado", restantes: 0 });
    expect(r.ok === false && r.error).toBe("bloqueado");
  });
});
