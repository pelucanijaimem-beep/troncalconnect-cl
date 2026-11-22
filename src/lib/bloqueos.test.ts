import { describe, expect, it } from "vitest";
import { cargaBloqueada } from "./bloqueos";
import { alternarSeleccion } from "./comparar-cargas";

const empresa = "11111111-1111-4111-8111-111111111111";

describe("empresas bloqueadas", () => {
  it("oculta las cargas cuyo dueño está bloqueado, aunque cambie el nombre publicado", () => {
    const bloqueos = { ids: [{ id: empresa, nombre: "Forestal Sur" }], nombres: [] };
    expect(cargaBloqueada(bloqueos, { empresa: "Otro nombre", userId: empresa })).toBe(true);
  });

  it("no oculta cargas de otras empresas", () => {
    const bloqueos = { ids: [{ id: empresa, nombre: "Forestal Sur" }], nombres: [] };
    expect(
      cargaBloqueada(bloqueos, {
        empresa: "Forestal Sur",
        userId: "22222222-2222-4222-8222-222222222222",
      }),
    ).toBe(false);
  });

  it("mantiene los bloqueos antiguos guardados por nombre", () => {
    expect(
      cargaBloqueada({ ids: [], nombres: ["forestal sur"] }, { empresa: " Forestal Sur " }),
    ).toBe(true);
  });
});

describe("comparar cargas guardadas", () => {
  it("permite comparar hasta 3 cargas a la vez", () => {
    expect(alternarSeleccion(["a", "b", "c"], "d")).toEqual(["a", "b", "c"]);
    expect(alternarSeleccion(["a", "b"], "c")).toEqual(["a", "b", "c"]);
  });

  it("quita una carga ya seleccionada", () => {
    expect(alternarSeleccion(["a", "b"], "a")).toEqual(["b"]);
  });
});
