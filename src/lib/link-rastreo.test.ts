import { describe, expect, it } from "vitest";
import { linkRastreoValido } from "@/components/troncal/PostularDialog";

describe("linkRastreoValido", () => {
  it("acepta el campo vacío (opcional)", () => {
    expect(linkRastreoValido("")).toBe(true);
    expect(linkRastreoValido("   ")).toBe(true);
  });

  it("acepta URLs http y https", () => {
    expect(linkRastreoValido("https://rastreo.ejemplo.cl/abc123")).toBe(true);
    expect(linkRastreoValido("http://gps.ejemplo.cl/unidad/42")).toBe(true);
  });

  it("rechaza texto que no es URL y otros esquemas", () => {
    expect(linkRastreoValido("mi camion")).toBe(false);
    expect(linkRastreoValido("ftp://archivo.cl/x")).toBe(false);
    expect(linkRastreoValido("javascript:alert(1)")).toBe(false);
  });
});
