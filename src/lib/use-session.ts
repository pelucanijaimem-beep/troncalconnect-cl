import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { iniciarSesionConRut } from "@/lib/auth.functions";
import { normalizarRut, rutValido } from "@/lib/rut";
import { esEnlaceRecuperacion, validarNuevaPassword } from "@/lib/password-recovery";
import type { Rol } from "@/components/troncal/RoleSwitcher";

export type Sesion = {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  telefono?: string;
  planActivo: boolean;
  cargandoPerfil?: boolean;
};

let sesion: Sesion | null = null;
let iniciado = false;
let recuperandoPassword = false;
let versionSesion = 0;
let perfilProgramado: ReturnType<typeof setTimeout> | undefined;
const RECUPERACION_KEY = "troncal-recuperacion-password";
const oyentes = new Set<() => void>();

const emitir = () => oyentes.forEach((f) => f());

function sesionBase(userId: string, email: string): Sesion {
  return {
    id: userId,
    nombre: email.split("@")[0] || "Usuario",
    email,
    rol: "camionero",
    planActivo: false,
    cargandoPerfil: true,
  };
}

async function cargarPerfil(userId: string, email: string) {
  if (recuperandoPassword) return;
  const version = versionSesion;
  // La sesión se marca como iniciada de inmediato: si la consulta del perfil
  // falla (red, permisos o desfase de reloj), el usuario igual queda logueado.
  if (sesion?.id !== userId) {
    sesion = sesionBase(userId, email);
    emitir();
  }

  type Perfil = {
    nombre?: string | null;
    email?: string | null;
    telefono?: string | null;
    rol?: string | null;
    plan_activo?: boolean | null;
    bloqueado?: boolean | null;
  } | null;

  let data: Perfil = null;

  for (let intento = 0; intento < 2; intento += 1) {
    if (recuperandoPassword || version !== versionSesion) return;
    try {
      const res = await supabase.rpc("mi_perfil");
      if (!res.error) {
        data = (res.data ?? null) as Perfil;
        break;
      }
    } catch {
      /* reintentamos una vez */
    }
    await new Promise((r) => setTimeout(r, 600));
  }

  // Una consulta anterior no puede cerrar ni reemplazar una sesión de recuperación.
  if (recuperandoPassword || version !== versionSesion) return;

  if (!data) {
    // conservamos la sesión base, pero sin quedar en estado de carga
    if (sesion?.id === userId) {
      sesion = { ...sesion, cargandoPerfil: false };
      emitir();
    }
    return;
  }

  if (data.bloqueado) {
    sesion = null;
    emitir();
    await supabase.auth.signOut();
    if (typeof window !== "undefined") {
      window.alert(
        "Tu cuenta está suspendida por el equipo de TroncalTrack. Escríbenos a soporte para reactivarla.",
      );
    }
    return;
  }

  const { data: accesoMembresia } = await supabase.rpc("tiene_plan_activo", { _user_id: userId });
  if (recuperandoPassword || version !== versionSesion) return;
  sesion = {
    id: userId,
    nombre: data.nombre || email.split("@")[0] || "Usuario",
    email: data.email || email,
    rol: (data.rol as Rol) ?? "camionero",
    ...(data.telefono ? { telefono: data.telefono } : {}),
    planActivo: Boolean(data.plan_activo || accesoMembresia),
  };
  emitir();
}

function iniciar() {
  if (iniciado || typeof window === "undefined") return;
  iniciado = true;
  recuperandoPassword = esEnlaceRecuperacion(window.location.hash, window.location.search) ||
    window.sessionStorage.getItem(RECUPERACION_KEY) === "1";
  if (recuperandoPassword) window.sessionStorage.setItem(RECUPERACION_KEY, "1");

  supabase.auth.onAuthStateChange((evento, s) => {
    if (evento === "PASSWORD_RECOVERY") {
      versionSesion += 1;
      recuperandoPassword = true;
      sesion = null;
      window.sessionStorage.setItem(RECUPERACION_KEY, "1");
      emitir();
      return;
    }
    if (evento === "SIGNED_OUT") {
      versionSesion += 1;
      sesion = null;
      // Si el enlace vence, el formulario debe permanecer y mostrar el error
      // al guardar, no desaparecer. Esto no conserva una sesión autenticada.
      emitir();
      return;
    }
    if (recuperandoPassword) return;
    if (evento !== "SIGNED_IN" && evento !== "INITIAL_SESSION" && evento !== "USER_UPDATED") return;
    const u = s?.user;
    if (!u) return;
    const version = versionSesion;
    // El callback de auth corre bajo su bloqueo interno. Consultar aquí puede
    // provocar renovaciones recursivas; hacerlo en una tarea posterior.
    if (perfilProgramado !== undefined) clearTimeout(perfilProgramado);
    perfilProgramado = setTimeout(() => {
      perfilProgramado = undefined;
      if (recuperandoPassword || version !== versionSesion) return;
      void cargarPerfil(u.id, u.email ?? "").catch(() => {
        console.warn("[sesion] no se pudo actualizar el perfil");
      });
    }, 0);
  });
}

function subscribe(f: () => void) {
  iniciar();
  oyentes.add(f);
  return () => oyentes.delete(f);
}

const getSnapshot = () => sesion;

/** Refresca el perfil del usuario actual desde la base de datos. */
export async function refrescarSesion() {
  const { data } = await supabase.auth.getUser();
  if (data.user) await cargarPerfil(data.user.id, data.user.email ?? "");
}

export async function registrarUsuario(datos: {
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
  telefono?: string;
  rut: string;
}) {
  if (!rutValido(datos.rut)) {
    return "El RUT ingresado no es válido. Revísalo e inténtalo de nuevo.";
  }

  const { data: existe } = await supabase.rpc("rut_registrado", { p_rut: datos.rut ?? "" });
  if (existe) {
    return "Este RUT ya tiene una cuenta creada en TroncalTrack. Inicia sesión o usa \u00bfOlvidaste tu contraseña? para recuperarla.";
  }

  const { error } = await supabase.auth.signUp({
    email: datos.email,
    password: datos.password,
    options: {
      emailRedirectTo: `${window.location.origin}/`,
      data: {
        nombre: datos.nombre,
        rol: datos.rol,
        telefono: datos.telefono ?? "",
        rut: normalizarRut(datos.rut),
      },
    },
  });
  return error?.message ?? null;
}

export async function iniciarSesionEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error?.message?.includes("RUT_DUPLICADO")) {
    return "Este RUT ya tiene una cuenta creada en TroncalTrack. Inicia sesión o usa \u00bfOlvidaste tu contraseña? para recuperarla.";
  }
  return error?.message ?? null;
}

/** Inicia sesión con RUT y contraseña (el correo queda solo para recuperación). */
export async function iniciarSesionRut(rut: string, password: string) {
  if (!normalizarRut(rut)) return "RUT o contraseña incorrectos.";
  let etapa = "solicitud";
  try {
    const res = await iniciarSesionConRut({ data: { rut, password } });
    if ("error" in res) return res.error;
    etapa = "establecer_sesion";
    const { error } = await supabase.auth.setSession({
      access_token: res.access_token,
      refresh_token: res.refresh_token,
    });
    if (error) return error.message;
    // La autenticación ya terminó: una lectura de perfil fallida no la invalida.
    try {
      await refrescarSesion();
    } catch {
      console.warn("[acceso-rut] no se pudo actualizar el perfil tras iniciar sesión");
    }
    return null;
  } catch (error) {
    console.error("[acceso-rut] fallo de cliente", {
      etapa,
      tipo: error instanceof Error ? error.name : "Error desconocido",
    });
    return "No pudimos conectar con el servidor. Inténtalo nuevamente.";
  }
}

export async function recuperarPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return error?.message ?? null;
  } catch {
    return "No pudimos enviar el correo. Inténtalo nuevamente.";
  }
}

export function finalizarRecuperacionPassword() {
  recuperandoPassword = false;
  if (typeof window !== "undefined") window.sessionStorage.removeItem(RECUPERACION_KEY);
  emitir();
}

export function useRecuperacionPassword() {
  return useSyncExternalStore(subscribe, () => recuperandoPassword, () => false);
}

export async function actualizarPasswordRecuperada(password: string, confirmacion: string) {
  const errorValidacion = validarNuevaPassword(password, confirmacion);
  if (errorValidacion) return errorValidacion;
  if (!recuperandoPassword) return "Abre el enlace de recuperación enviado a tu correo.";
  try {
    const { error: errorUsuario, data } = await supabase.auth.getUser();
    if (errorUsuario || !data.user) return "El enlace venció o no es válido. Solicita uno nuevo.";
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return error.message;
    finalizarRecuperacionPassword();
    window.history.replaceState(null, "", window.location.pathname);
    // Después de guardar se retoman las reglas habituales del perfil,
    // incluido el bloqueo de cuentas, sin ejecutarlas durante la recuperación.
    setTimeout(() => { void refrescarSesion().catch(() => {
      console.warn("[sesion] no se pudo actualizar el perfil");
    }); }, 0);
    return null;
  } catch {
    return "No pudimos guardar la contraseña. Inténtalo nuevamente.";
  }
}

export async function cerrarSesion() {
  await supabase.auth.signOut();
  sesion = null;
  emitir();
}

export function useSesion() {
  return useSyncExternalStore(subscribe, getSnapshot, () => null as Sesion | null);
}
