import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { esEnlaceRecuperacion, validarNuevaPassword } from "./password-recovery";

const mocks = vi.hoisted(() => ({ reset: vi.fn(), update: vi.fn(), getUser: vi.fn(), getSession: vi.fn(), rpc: vi.fn(), signOut: vi.fn(), listener: undefined as undefined | ((event: string, session: unknown) => void) }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: mocks.rpc, auth: {
  getSession: mocks.getSession,
  onAuthStateChange: vi.fn((listener) => { mocks.listener = listener; }),
  resetPasswordForEmail: mocks.reset, updateUser: mocks.update, getUser: mocks.getUser, signOut: mocks.signOut,
} } }));
vi.mock("@/lib/auth.functions", () => ({ iniciarSesionConRut: vi.fn() }));
vi.mock("react", () => ({ useSyncExternalStore: (subscribe: (f: () => void) => void, get: () => unknown) => { subscribe(() => {}); return get(); } }));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  mocks.getSession.mockResolvedValue({ data: { session: null } });
  mocks.rpc.mockResolvedValue({ data: { nombre: "Prueba", bloqueado: false }, error: null });
  mocks.signOut.mockResolvedValue({ error: null });
  const storage = new Map<string, string>();
  vi.stubGlobal("window", { alert: vi.fn(), location: { origin: "https://troncaltrack.com", hash: "", search: "", pathname: "/" }, sessionStorage: { getItem: (k: string) => storage.get(k), setItem: (k: string, v: string) => storage.set(k, v), removeItem: (k: string) => storage.delete(k) }, history: { replaceState: vi.fn() } });
  mocks.reset.mockResolvedValue({ error: null });
  mocks.update.mockResolvedValue({ error: null });
  mocks.getUser.mockResolvedValue({ data: { user: { id: "test" } }, error: null });
  mocks.listener = undefined;
});

afterEach(async () => { await new Promise((resolve) => setTimeout(resolve, 20)); });

describe("recuperación de contraseña", () => {
  it("mantiene el cierre de sesión para cuentas bloqueadas fuera de recuperación", async () => {
    mocks.rpc.mockResolvedValue({ data: { bloqueado: true }, error: null });
    const session = await import("./use-session");
    session.useSesion();
    mocks.listener?.("SIGNED_IN", { user: { id: "test" } });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(mocks.signOut).toHaveBeenCalledTimes(1);
  });
  it("no carga ni expulsa un perfil bloqueado durante PASSWORD_RECOVERY", async () => {
    mocks.rpc.mockResolvedValue({ data: { bloqueado: true }, error: null });
    const session = await import("./use-session");
    session.useRecuperacionPassword();
    mocks.listener?.("PASSWORD_RECOVERY", { user: { id: "test", email: "test@example.test" } });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.signOut).not.toHaveBeenCalled();
    expect(session.useRecuperacionPassword()).toBe(true);
  });
  it("un refresco o salida no oculta el formulario de recuperación", async () => {
    const session = await import("./use-session");
    session.useRecuperacionPassword();
    mocks.listener?.("PASSWORD_RECOVERY", { user: { id: "test" } });
    mocks.listener?.("TOKEN_REFRESHED", { user: { id: "test" } });
    mocks.listener?.("SIGNED_OUT", null);
    expect(session.useRecuperacionPassword()).toBe(true);
    expect(await session.actualizarPasswordRecuperada("nueva-segura", "nueva-segura")).toBeNull();
  });
  it("una sesión inicial de un enlace antiguo no consulta el perfil", async () => {
    window.location.hash = "#type=recovery";
    mocks.getSession.mockResolvedValue({ data: { session: { user: { id: "test" } } } });
    const session = await import("./use-session");
    expect(session.useRecuperacionPassword()).toBe(true);
    mocks.listener?.("INITIAL_SESSION", { user: { id: "test" } });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("TOKEN_REFRESHED no vuelve a consultar el perfil fuera de recuperación", async () => {
    const session = await import("./use-session");
    session.useSesion();
    mocks.listener?.("TOKEN_REFRESHED", { user: { id: "test" } });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("descarta un perfil bloqueado pendiente si comienza la recuperación", async () => {
    let resolver: ((value: unknown) => void) | undefined;
    mocks.rpc.mockImplementation(() => new Promise((resolve) => { resolver = resolve; }));
    const session = await import("./use-session");
    session.useSesion();
    mocks.listener?.("SIGNED_IN", { user: { id: "test", email: "test@example.test" } });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
    mocks.listener?.("PASSWORD_RECOVERY", { user: { id: "test" } });
    resolver?.({ data: { bloqueado: true }, error: null });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(mocks.signOut).not.toHaveBeenCalled();
    expect(session.useRecuperacionPassword()).toBe(true);
  });
  it("reconoce enlaces de recuperación con hash", () => expect(esEnlaceRecuperacion("#type=recovery&access_token=test", "")).toBe(true));
  it("no confunde confirmación de registro con recuperación", () => expect(esEnlaceRecuperacion("#type=signup", "")).toBe(false));
  it("exige confirmación coincidente", () => expect(validarNuevaPassword("nueva-segura", "otra-segura")).not.toBeNull());
  it("permite contraseña y confirmación iguales", () => expect(validarNuevaPassword("nueva-segura", "nueva-segura")).toBeNull());
  it("envía el correo hacia el formulario público", async () => {
    const { recuperarPassword } = await import("./use-session");
    await recuperarPassword("test@example.test");
    expect(mocks.reset).toHaveBeenCalledWith("test@example.test", { redirectTo: "https://troncaltrack.com/reset-password" });
  });
  it("PASSWORD_RECOVERY activa el formulario y guarda sin contraseña actual", async () => {
    const session = await import("./use-session");
    session.useRecuperacionPassword();
    mocks.listener?.("PASSWORD_RECOVERY", null);
    expect(session.useRecuperacionPassword()).toBe(true);
    expect(await session.actualizarPasswordRecuperada("nueva-segura", "nueva-segura")).toBeNull();
    expect(mocks.update).toHaveBeenCalledWith({ password: "nueva-segura" });
    expect(session.useRecuperacionPassword()).toBe(false);
  });
  it("no cambia una contraseña con un enlace inválido", async () => {
    mocks.update.mockClear();
    const session = await import("./use-session");
    session.useRecuperacionPassword();
    expect(await session.actualizarPasswordRecuperada("nueva-segura", "nueva-segura")).not.toBeNull();
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it("no cambia una contraseña cuando venció la sesión", async () => {
    mocks.update.mockClear();
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: { message: "expired" } });
    const session = await import("./use-session");
    session.useRecuperacionPassword(); mocks.listener?.("PASSWORD_RECOVERY", null);
    expect(await session.actualizarPasswordRecuperada("nueva-segura", "nueva-segura")).not.toBeNull();
    expect(mocks.update).not.toHaveBeenCalled();
  });
});