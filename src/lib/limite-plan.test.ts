import { describe, expect, it } from "vitest";
import { parseLimitePlan } from "./limite-plan";

describe("parseLimitePlan", () => {
  it("interpreta el límite de Empresa Pyme (15 al mes)", () => {
    expect(parseLimitePlan("LIMITE_PLAN:15:empresa_pyme")).toEqual({
      limite: 15,
      plan: "Empresa Pyme",
    });
  });

  it("interpreta el límite del plan Inicial (2 al mes)", () => {
    expect(parseLimitePlan("LIMITE_PLAN:2:inicial")).toEqual({
      limite: 2,
      plan: "Inicial",
    });
  });

  it("devuelve null ante un error cualquiera", () => {
    expect(parseLimitePlan("new row violates row-level security policy")).toBeNull();
    expect(parseLimitePlan("")).toBeNull();
  });

  it("conserva el identificador si el nivel es desconocido", () => {
    expect(parseLimitePlan("LIMITE_PLAN:7:otro")).toEqual({ limite: 7, plan: "otro" });
  });
});
