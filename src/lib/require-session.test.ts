import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createClient: vi.fn(), claims: vi.fn(), authorization: "Bearer a.b.c" }));
vi.mock("@tanstack/react-start", () => ({ createMiddleware: () => ({ server: (handler: unknown) => handler }) }));
vi.mock("@tanstack/react-start/server", () => ({ getRequest: () => new Request("https://example.test", { headers: mocks.authorization ? { authorization: mocks.authorization } : {} }) }));
vi.mock("@supabase/supabase-js", () => ({ createClient: mocks.createClient }));
import { requireSupabaseAuth } from "./require-session";

const run = requireSupabaseAuth as unknown as (input: { next: ReturnType<typeof vi.fn> }) => Promise<unknown>;
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("SUPABASE_URL", "https://server.example.test");
  vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "");
  vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_fallback");
  mocks.authorization = "Bearer a.b.c";
  mocks.claims.mockResolvedValue({ data: { claims: { sub: "test-user" } }, error: null });
  mocks.createClient.mockReturnValue({ auth: { getClaims: mocks.claims } });
});
describe("sesión autenticada con clave de respaldo", () => {
  it("valida el token y propaga el usuario usando la URL de servidor", async () => {
    const next = vi.fn().mockResolvedValue("ok");
    expect(await run({ next })).toBe("ok");
    expect(mocks.createClient).toHaveBeenCalledWith("https://server.example.test", "sb_publishable_fallback", expect.any(Object));
    expect(mocks.claims).toHaveBeenCalledWith("a.b.c");
    expect(next).toHaveBeenCalledWith({ context: expect.objectContaining({ userId: "test-user" }) });
  });
  it("prioriza la clave de servidor cuando existe", async () => {
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_server");
    await run({ next: vi.fn() });
    expect(mocks.createClient.mock.calls[0]?.[1]).toBe("sb_publishable_server");
  });
  it.each(["", "Bearer sb_publishable_fallback", "Basic a.b.c"])("rechaza cabeceras sin JWT válido: %s", async (authorization) => {
    mocks.authorization = authorization;
    const next = vi.fn();
    await expect(run({ next })).rejects.toMatchObject({ status: 401 });
    expect(next).not.toHaveBeenCalled();
    expect(mocks.createClient).not.toHaveBeenCalled();
  });
  it("rechaza un JWT que el servicio no valida", async () => {
    mocks.claims.mockResolvedValue({ data: null, error: { code: "invalid_token" } });
    const next = vi.fn();
    await expect(run({ next })).rejects.toMatchObject({ status: 401 });
    expect(next).not.toHaveBeenCalled();
  });
  it("conserva el bearer de usuario y envía la clave en apikey", async () => {
    await run({ next: vi.fn() });
    const fetcher = mocks.createClient.mock.calls[0]?.[2]?.global.fetch as typeof fetch;
    const spy = vi.fn().mockResolvedValue(new Response("{}"));
    vi.stubGlobal("fetch", spy);
    try {
      await fetcher("https://example.test", { headers: { Authorization: "Bearer a.b.c" } });
      const headers = new Headers(spy.mock.calls[0]?.[1]?.headers);
      expect(headers.get("Authorization")).toBe("Bearer a.b.c");
      expect(headers.get("apikey")).toBe("sb_publishable_fallback");
    } finally { vi.unstubAllGlobals(); }
  });
  it("no continúa cuando faltan ambas claves", async () => {
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "");
    const next = vi.fn();
    await expect(run({ next })).rejects.toThrow("temporalmente");
    expect(next).not.toHaveBeenCalled();
  });
});