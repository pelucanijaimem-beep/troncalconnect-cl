import { describe, expect, it, vi } from "vitest";
import { comprobarTokenHumano } from "./humano";

const respuesta = (body: unknown) =>
  vi.fn(async () => new Response(JSON.stringify(body))) as unknown as typeof fetch;

describe("comprobarTokenHumano", () => {
  it("no bloquea mientras no hay llave secreta", async () => {
    const f = respuesta({ success: false });
    expect(await comprobarTokenHumano(undefined, "", f)).toEqual({ ok: true });
    expect(f).not.toHaveBeenCalled();
  });

  it("con llave configurada exige token", async () => {
    expect((await comprobarTokenHumano("s", "", respuesta({ success: true }))).ok).toBe(false);
  });

  it("acepta solo cuando el verificador confirma", async () => {
    expect((await comprobarTokenHumano("s", "t", respuesta({ success: true }))).ok).toBe(true);
    expect((await comprobarTokenHumano("s", "t", respuesta({ success: false }))).ok).toBe(false);
  });

  it("rechaza si el verificador no responde", async () => {
    const falla = vi.fn(async () => {
      throw new Error("red");
    }) as unknown as typeof fetch;
    expect((await comprobarTokenHumano("s", "t", falla)).ok).toBe(false);
  });
});
