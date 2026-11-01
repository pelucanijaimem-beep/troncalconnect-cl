import { describe, expect, it } from "vitest";
import { identityStatusLabel } from "./identity-status";

describe("Reglas de estado de identidad", () => {
  it("solo reconoce identidad verificada con aprobación y coincidencia", () => {
    expect(identityStatusLabel("approved", true)).toBe("Identidad verificada con Didit");
    expect(identityStatusLabel("in_review", true)).not.toBe("Identidad verificada con Didit");
    expect(identityStatusLabel("approved", null)).not.toBe("Identidad verificada con Didit");
    expect(identityStatusLabel("approved", false)).not.toBe("Identidad verificada con Didit");
  });
});