import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ createClient: vi.fn(), insert: vi.fn(), user: vi.fn(), authorization: undefined as string | undefined }));
vi.mock("@tanstack/react-start", () => ({ createServerFn: () => ({ inputValidator: () => ({ handler: (handler: unknown) => handler }) }) }));
vi.mock("@tanstack/react-start/server", () => ({ getRequestHeader: () => mocks.authorization }));
vi.mock("@supabase/supabase-js", () => ({ createClient: mocks.createClient }));
vi.mock("./contacto-email.server", () => ({ avisarMensajeContacto: vi.fn() }));
import { enviarMensajeContacto } from "./contacto.functions";

const run = enviarMensajeContacto as unknown as (input: { data: { tipo: "soporte"; nombre: string; correo: string; mensaje: string } }) => Promise<unknown>;
const data = { tipo: "soporte" as const, nombre: "Prueba", correo: "test@example.test", mensaje: "Mensaje de prueba de configuración" };
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("SUPABASE_URL", "https://server.example.test");
  vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "");
  vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_fallback");
  mocks.authorization = undefined;
  mocks.insert.mockResolvedValue({ error: null });
  mocks.createClient.mockReturnValue({ from: () => ({ insert: mocks.insert }), auth: { getUser: mocks.user } });
});
describe("contacto con clave de respaldo", () => {
  it("guarda un mensaje público sin sesión", async () => {
    expect(await run({ data })).toEqual({ ok: true });
    expect(mocks.createClient).toHaveBeenCalledWith("https://server.example.test", "sb_publishable_fallback", expect.any(Object));
    expect(mocks.insert).toHaveBeenCalledWith({ ...data, user_id: null });
  });
  it("asocia un mensaje únicamente al usuario validado", async () => {
    mocks.authorization = "Bearer a.b.c";
    mocks.user.mockResolvedValue({ data: { user: { id: "test-user" } }, error: null });
    expect(await run({ data })).toEqual({ ok: true });
    expect(mocks.user).toHaveBeenCalledWith("a.b.c");
    expect(mocks.insert).toHaveBeenCalledWith({ ...data, user_id: "test-user" });
  });
  it("no guarda un mensaje con sesión inválida", async () => {
    mocks.authorization = "Bearer a.b.c";
    mocks.user.mockResolvedValue({ data: { user: null }, error: { code: "invalid_token" } });
    await expect(run({ data })).rejects.toThrow("Tu sesión expiró");
    expect(mocks.insert).not.toHaveBeenCalled();
  });
  it("falla controladamente cuando faltan ambas claves", async () => {
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "");
    await expect(run({ data })).rejects.toThrow("No pudimos enviar tu mensaje");
    expect(mocks.insert).not.toHaveBeenCalled();
  });
});