import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  from: vi.fn(), signIn: vi.fn(), createClient: vi.fn(),
}));
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({ inputValidator: () => ({ handler: (handler: unknown) => handler }) }),
}));
vi.mock("@tanstack/react-start/server", () => ({
  getRequest: () => new Request("https://example.test", { headers: { "cf-connecting-ip": "192.0.2.1" } }),
}));
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: { from: mocks.from } }));
vi.mock("@supabase/supabase-js", () => ({ createClient: mocks.createClient }));
import { iniciarSesionConRut } from "./auth.functions";

const call = iniciarSesionConRut as unknown as (input: { data: { rut: string; password: string } }) => Promise<{ error?: string; access_token?: string; refresh_token?: string }>;
const run = (rut = "12.345.678-5") => call({ data: { rut, password: "test-password" } });

function query(result: unknown) {
  const builder = { select: vi.fn(), in: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn(), upsert: vi.fn() };
  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.in.mockResolvedValue(result);
  builder.maybeSingle.mockResolvedValue(result);
  builder.upsert.mockResolvedValue(result);
  return builder;
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("SUPABASE_URL", "https://example.test");
  vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
  vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.createClient.mockReturnValue({ auth: { signInWithPassword: mocks.signIn } });
});

describe("acceso con RUT", () => {
  it.each(["12.345.678-5", "123456785"])("normaliza %s y devuelve tokens serializables", async (rut) => {
    const profile = query({ data: { email: "test@example.test" }, error: null });
    mocks.from.mockReturnValueOnce(query({ data: [], error: null })).mockReturnValueOnce(profile).mockReturnValue(query({ error: null }));
    mocks.signIn.mockResolvedValue({ data: { session: { access_token: "test-access", refresh_token: "test-refresh" } }, error: null });
    expect(await run(rut)).toEqual({ access_token: "test-access", refresh_token: "test-refresh" });
    expect(profile.eq).toHaveBeenCalledWith("rut_normalizado", "123456785");
  });
  it("bloquea durante 15 minutos antes de validar contraseña", async () => {
    mocks.from.mockReturnValue(query({ data: [{ bloqueado_hasta: new Date(Date.now() + 15 * 60_000).toISOString() }], error: null }));
    expect((await run()).error).toContain("15 minutos");
    expect(mocks.signIn).not.toHaveBeenCalled();
  });
  it("falla cerrado si no puede leer los intentos", async () => {
    mocks.from.mockReturnValue(query({ data: null, error: { code: "42501" } }));
    expect((await run()).error).toContain("temporalmente");
    expect(mocks.signIn).not.toHaveBeenCalled();
  });
  it("devuelve error controlado cuando falta configuración", async () => {
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "");
    mocks.from.mockReturnValueOnce(query({ data: [], error: null })).mockReturnValueOnce(query({ data: { email: "test@example.test" }, error: null }));
    expect((await run()).error).toContain("temporalmente");
    expect(mocks.createClient).not.toHaveBeenCalled();
  });
  it("controla una excepción al construir el cliente", async () => {
    mocks.from.mockReturnValueOnce(query({ data: [], error: null })).mockReturnValueOnce(query({ data: { email: "test@example.test" }, error: null }));
    mocks.createClient.mockImplementation(() => { throw new Error("invalid configuration"); });
    expect((await run()).error).toContain("temporalmente");
  });
  it("no usa una clave opaca como bearer y conserva tokens reales", async () => {
    mocks.from.mockReturnValueOnce(query({ data: [], error: null })).mockReturnValueOnce(query({ data: { email: "test@example.test" }, error: null })).mockReturnValue(query({ error: null }));
    mocks.signIn.mockResolvedValue({ data: { session: { access_token: "a", refresh_token: "r" } }, error: null });
    await run();
    const fetcher = mocks.createClient.mock.calls[0]?.[2]?.global.fetch as typeof fetch;
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}"));
    vi.stubGlobal("fetch", fetchMock);
    await fetcher("https://example.test", { headers: { Authorization: "Bearer sb_publishable_test" } });
    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).has("Authorization")).toBe(false);
    await fetcher("https://example.test", { headers: { Authorization: "Bearer user-jwt" } });
    expect(new Headers(fetchMock.mock.calls[1]?.[1]?.headers).get("Authorization")).toBe("Bearer user-jwt");
    vi.unstubAllGlobals();
  });
});