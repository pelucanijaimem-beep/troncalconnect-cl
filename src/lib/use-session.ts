import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Rol } from "@/components/troncal/RoleSwitcher";

export type Sesion = {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  telefono?: string;
  planActivo: boolean;
};

let sesion: Sesion | null = null;
let iniciado = false;
const oyentes = new Set<() => void>();

const emitir = () => oyentes.forEach((f) => f());

function sesionBase(userId: string, email: string): Sesion {
  return {
    id: userId,
    nombre: email.split("@")[0] || "Usuario",
    email,
    rol: "camionero",
    planActivo: false,
  };
}

async function cargarPerfil(userId: string, email: string) {
  // La sesión se marca como iniciada de inmediato: si la consulta del perfil
  // falla (red, permisos o desfase de reloj), el usuario igual queda logueado.
  if (sesion?.id !== userId) {
    sesion = sesionBase(userId, email);
    emitir();
  }

  let data: {
    nombre?: string | null;
    email?: string | null;
    telefono?: string | null;
    rol?: string | null;
    plan_activo?: boolean | null;
    bloqueado?: boolean | null;
  } | null = null;

  for (let intento = 0; intento < 2; intento += 1) {
    try {
      const res = await supabase
        .from("perfiles")
        .select("nombre, email, telefono, rol, plan_activo, bloqueado")
        .eq("id", userId)
        .maybeSingle();
      if (!res.error) {
        data = res.data;
        break;
      }
    } catch {
      /* reintentamos una vez */
    }
    await new Promise((r) => setTimeout(r, 600));
  }

  if (!data) return; // conservamos la sesión base

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

  sesion = {
    id: userId,
    nombre: data.nombre || email.split("@")[0] || "Usuario",
    email: data.email || email,
    rol: (data.rol as Rol) ?? "camionero",
    ...(data.telefono ? { telefono: data.telefono } : {}),
    planActivo: Boolean(data.plan_activo),
  };
  emitir();
}

function iniciar() {
  if (iniciado || typeof window === "undefined") return;
  iniciado = true;

  void supabase.auth.getSession().then(({ data }) => {
    const u = data.session?.user;
    if (u) void cargarPerfil(u.id, u.email ?? "");
  });

  supabase.auth.onAuthStateChange((evento, s) => {
    const u = s?.user;
    if (!u) {
      // Solo cerramos la sesión ante una salida real; un refresco de token
      // descartado no debe expulsar al usuario recién ingresado.
      if (evento === "SIGNED_OUT") {
        sesion = null;
        emitir();
      }
      return;
    }
    void cargarPerfil(u.id, u.email ?? "");
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
  rut?: string;
}) {
  const { error } = await supabase.auth.signUp({
    email: datos.email,
    password: datos.password,
    options: {
      emailRedirectTo: `${window.location.origin}/`,
      data: {
        nombre: datos.nombre,
        rol: datos.rol,
        telefono: datos.telefono ?? "",
        rut: datos.rut ?? "",
      },
    },
  });
  return error?.message ?? null;
}

export async function iniciarSesionEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error?.message ?? null;
}

export async function recuperarPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/`,
  });
  return error?.message ?? null;
}

export async function cerrarSesion() {
  await supabase.auth.signOut();
  sesion = null;
  emitir();
}

export function useSesion() {
  return useSyncExternalStore(subscribe, getSnapshot, () => null as Sesion | null);
}
