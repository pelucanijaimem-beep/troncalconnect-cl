import { describe, expect, it, vi, beforeEach } from "vitest";
import { esEnlaceRecuperacion, validarNuevaPassword } from "./password-recovery";

const mocks = vi.hoisted(() => ({ reset: vi.fn(), update: vi.fn(), getUser: vi.fn(), listener: undefined as undefined | ((event: string, session: unknown) => void) }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: {
  getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
  onAuthStateChange: vi.fn((listener) => { mocks.listener = listener; }),
  resetPasswordForEmail: mocks.reset, updateUser: mocks.update, getUser: mocks.getUser,
} } }));
vi.mock("@/lib/auth.functions", () => ({ iniciarSesionConRut: vi.fn() }));
vi.mock("react", () => ({ useSyncExternalStore: (subscribe: (f: () => void) => void, get: () => unknown) => { subscribe(() => {}); return get(); } }));

beforeEach(() => {
  vi.resetModules();
  const storage = new Map<string, string>();
  vi.stubGlobal("window", { location: { origin: "https://troncaltrack.com", hash: "", search: "", pathname: "/" }, sessionStorage: { getItem: (k: string) => storage.get(k), setItem: (k: string, v: string) => storage.set(k, v), removeItem: (k: string) => storage.delete(k) }, history: { replaceState: vi.fn() } });
  mocks.reset.mockResolvedValue({ error: null });
  mocks.update.mockResolvedValue({ error: null });
  mocks.getUser.mockResolvedValue({ data: { user: { id: "test" } }, error: null });
  mocks.listener = undefined;
});

describe("recuperación de contraseña", () => {
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