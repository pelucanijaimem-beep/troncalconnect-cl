import { useEffect, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cargaBloqueada, type EmpresaBloqueada } from "./bloqueos";

type Datos = {
  /** IDs de cargas guardadas en favoritos. */
  favoritos: string[];
  /** Nombres de empresas bloqueadas en el dispositivo (bloqueos antiguos, en minúsculas). */
  bloqueadas: string[];
  /** Empresas bloqueadas guardadas en la cuenta (por dueño de la carga). */
  bloqueos: EmpresaBloqueada[];
};

const KEY = "troncaltrack.tablero";
const VACIO: Datos = { favoritos: [], bloqueadas: [], bloqueos: [] };

let datos: Datos = VACIO;
let cargado = false;
const oyentes = new Set<() => void>();

function cargar() {
  if (cargado || typeof window === "undefined") return;
  cargado = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Datos> & { pods?: unknown };
      datos = {
        favoritos: p.favoritos ?? [],
        bloqueadas: p.bloqueadas ?? [],
        bloqueos: [],
      };
      // Privacidad: se borran fotos de guías guardadas por versiones anteriores.
      if (p.pods !== undefined) window.localStorage.setItem(KEY, JSON.stringify(local(datos)));
    }
  } catch {
    datos = VACIO;
  }
}

/** Lo que se guarda en el dispositivo: los bloqueos de la cuenta viven solo en la cuenta. */
function local(d: Datos) {
  return { favoritos: d.favoritos, bloqueadas: d.bloqueadas };
}

function guardar(nuevo: Datos) {
  datos = nuevo;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(local(datos)));
  } catch {
    /* almacenamiento no disponible */
  }
  oyentes.forEach((f) => f());
}

function subscribe(f: () => void) {
  cargar();
  oyentes.add(f);
  return () => oyentes.delete(f);
}

function getSnapshot() {
  cargar();
  return datos;
}

const clave = (s: string) => s.trim().toLowerCase();

/** Usuario conectado: permite guardar los favoritos también en la cuenta. */
let usuarioFavoritos: string | null = null;

const esUuid = (v: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

export async function alternarFavorito(id: string): Promise<boolean> {
  cargar();
  const antes = datos;
  const existe = datos.favoritos.includes(id);
  guardar({
    ...datos,
    favoritos: existe ? datos.favoritos.filter((f) => f !== id) : [id, ...datos.favoritos],
  });

  if (usuarioFavoritos && esUuid(id)) {
    const uid = usuarioFavoritos;
    const { error } = existe
      ? await supabase.from("favoritos").delete().eq("user_id", uid).eq("carga_id", id)
      : await supabase.from("favoritos").insert({ user_id: uid, carga_id: id });
    if (error && !error.message.includes("duplicate")) {
      guardar(antes);
      toast.error("No pudimos actualizar tus favoritos", {
        description: "Revisa tu conexión e inténtalo nuevamente.",
      });
      return existe;
    }
  }
  toast.success(existe ? "Carga quitada de favoritos" : "Carga guardada en favoritos");
  return !existe;
}

/**
 * Carga los favoritos guardados en la cuenta (fuente oficial) y sube los que
 * estuvieran solo en el dispositivo.
 */
export function useSincronizarFavoritos(userId: string | undefined | null) {
  useEffect(() => {
    usuarioFavoritos = userId ?? null;
    if (!userId) return;
    let vivo = true;
    void (async () => {
      const { data, error } = await supabase
        .from("favoritos")
        .select("carga_id")
        .eq("user_id", userId);
      if (!vivo) return;
      if (error || !data) {
        toast.error("No pudimos cargar tus cargas guardadas");
        return;
      }
      cargar();
      const remotos = data.map((f) => f.carga_id as string);
      const locales = datos.favoritos.filter((f) => esUuid(f) && !remotos.includes(f));
      let subidos: string[] = [];
      if (locales.length) {
        const { error: e2 } = await supabase
          .from("favoritos")
          .insert(locales.map((carga_id) => ({ user_id: userId, carga_id })));
        if (!e2) subidos = locales;
      }
      if (vivo) guardar({ ...datos, favoritos: [...new Set([...remotos, ...subidos])] });
    })();
    return () => {
      vivo = false;
    };
  }, [userId]);
}

/**
 * Bloquea a la empresa dueña de la carga. Con sesión se guarda en la cuenta;
 * sin sesión (o sin dueño conocido) queda en el dispositivo por nombre.
 */
export async function bloquearEmpresa(carga: { empresa: string; userId?: string | undefined }) {
  cargar();
  const uid = usuarioFavoritos;
  if (uid && carga.userId && esUuid(carga.userId)) {
    if (carga.userId === uid) return;
    if (datos.bloqueos.some((b) => b.id === carga.userId)) return;
    const antes = datos;
    const nombre = carga.empresa.trim().slice(0, 120);
    guardar({ ...datos, bloqueos: [{ id: carga.userId, nombre }, ...datos.bloqueos] });
    const { error } = await supabase
      .from("empresas_bloqueadas")
      .insert({ transportista_id: uid, empresa_id: carga.userId, empresa_nombre: nombre });
    if (error && error.code !== "23505") {
      guardar(antes);
      toast.error("No pudimos bloquear esta empresa", {
        description: "Revisa tu conexión e inténtalo nuevamente.",
      });
      return;
    }
    toast.success("Empresa bloqueada", {
      description: "Ya no verás sus cargas. Puedes desbloquearla desde tu panel.",
    });
    return;
  }
  const k = clave(carga.empresa);
  if (datos.bloqueadas.includes(k)) return;
  guardar({ ...datos, bloqueadas: [k, ...datos.bloqueadas] });
  toast.success("Empresa bloqueada", { description: "Ya no verás sus cargas en este dispositivo." });
}

/** Quita un bloqueo antiguo guardado por nombre en el dispositivo. */
export function desbloquearEmpresa(empresa: string) {
  cargar();
  const k = clave(empresa);
  guardar({ ...datos, bloqueadas: datos.bloqueadas.filter((b) => b !== k) });
}

/** Quita un bloqueo guardado en la cuenta. */
export async function desbloquearEmpresaCuenta(empresaId: string) {
  cargar();
  const uid = usuarioFavoritos;
  if (!uid) return;
  const antes = datos;
  guardar({ ...datos, bloqueos: datos.bloqueos.filter((b) => b.id !== empresaId) });
  const { error } = await supabase
    .from("empresas_bloqueadas")
    .delete()
    .eq("transportista_id", uid)
    .eq("empresa_id", empresaId);
  if (error) {
    guardar(antes);
    toast.error("No pudimos desbloquear esta empresa", {
      description: "Revisa tu conexión e inténtalo nuevamente.",
    });
    return;
  }
  toast.success("Empresa desbloqueada");
}

/** Carga las empresas bloqueadas de la cuenta; al cerrar sesión se vacían. */
export function useSincronizarBloqueos(userId: string | undefined | null) {
  useEffect(() => {
    cargar();
    if (!userId) {
      if (datos.bloqueos.length) guardar({ ...datos, bloqueos: [] });
      return;
    }
    let vivo = true;
    void (async () => {
      const { data, error } = await supabase
        .from("empresas_bloqueadas")
        .select("empresa_id, empresa_nombre")
        .eq("transportista_id", userId)
        .order("created_at", { ascending: false });
      if (!vivo || error || !data) return;
      guardar({
        ...datos,
        bloqueos: data.map((b) => ({ id: b.empresa_id, nombre: b.empresa_nombre })),
      });
    })();
    return () => {
      vivo = false;
    };
  }, [userId]);
}

export function estaBloqueada(bloqueadas: string[], empresa: string) {
  return bloqueadas.includes(clave(empresa));
}

/** true si la carga es de una empresa bloqueada (por cuenta o por nombre). */
export function esCargaBloqueada(
  prefs: Pick<Datos, "bloqueadas" | "bloqueos">,
  carga: { empresa: string; userId?: string | undefined },
) {
  return cargaBloqueada({ ids: prefs.bloqueos, nombres: prefs.bloqueadas }, carga);
}

export function useTableroPrefs() {
  return useSyncExternalStore(subscribe, getSnapshot, () => VACIO);
}
