import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ rpc: vi.fn(), adminRpc: vi.fn(), fetch: vi.fn() }));
vi.mock("@tanstack/react-start", () => ({ createServerFn: () => ({ middleware: () => ({ handler: (handler: unknown) => handler }) }) }));
vi.mock("@/lib/require-session", () => ({ requireSupabaseAuth: {} }));
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: { rpc: mocks.adminRpc } }));
import { iniciarVerificacionIdentidad } from "./identity.functions";
const run = iniciarVerificacionIdentidad as unknown as (input: { context: { userId: string; supabase: { rpc: typeof mocks.rpc } } }) => Promise<{ error?: string; url?: string }>;
const invoke = () => run({ context: { userId: "test-user", supabase: { rpc: mocks.rpc } } });
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("DIDIT_API_KEY", "test-only-key");
  vi.stubEnv("DIDIT_WORKFLOW_ID", "test-only-workflow");
  vi.stubEnv("DIDIT_WEBHOOK_SECRET", "test-only-signature");
  vi.stubGlobal("fetch", mocks.fetch);
  mocks.rpc.mockResolvedValue({ data: { rut: "12.457.880-9", bloqueado: false }, error: null });
  mocks.adminRpc.mockResolvedValue({ error: null });
});
describe("inicio de identidad", () => {
  it.each([400, 401, 403, 404, 422, 429, 500])("registra HTTP %s sin exponer el cuerpo ni vincular una sesión", async (status) => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.fetch.mockResolvedValue(new Response(JSON.stringify({ detail: "dato-privado-no-registrar", api_key: "test-only-key" }), { status }));
    const result = await invoke();
    expect(result.error).toBeTruthy();
    expect(log).toHaveBeenCalledWith("[identidad] solicitud rechazada", { etapa: "crear_sesion", status, categoria: expect.any(String) });
    expect(JSON.stringify(log.mock.calls)).not.toContain("dato-privado-no-registrar");
    expect(JSON.stringify(log.mock.calls)).not.toContain("test-only-key");
    expect(mocks.adminRpc).not.toHaveBeenCalled();
  });
  it("no envía perfiles bloqueados a Didit", async () => {
    mocks.rpc.mockResolvedValue({ data: { rut: "12.457.880-9", bloqueado: true } });
    expect(await invoke()).toMatchObject({ status: 403 });
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("vincula una respuesta válida solo con el usuario autenticado", async () => {
    mocks.fetch.mockResolvedValue(new Response(JSON.stringify({ session_id: "00000000-0000-4000-8000-000000000001", url: "https://verify.didit.me/session-test" }), { status: 201 }));
    expect(await invoke()).toMatchObject({ url: "https://verify.didit.me/session-test" });
    expect(mocks.adminRpc).toHaveBeenCalledWith("registrar_sesion_identidad_v2", { p_session: "00000000-0000-4000-8000-000000000001", p_user: "test-user" });
  });
});