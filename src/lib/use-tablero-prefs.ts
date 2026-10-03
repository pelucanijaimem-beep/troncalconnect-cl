import { useEffect, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type Pod = {
  /** Imagen de la guía de despacho firmada en base64. */
  imagen: string;
  nombreArchivo: string;
  fecha: string;
  observacion: string;
};

type Datos = {
  /** IDs de cargas guardadas en favoritos. */
  favoritos: string[];
  /** Nombres de empresas bloqueadas (en minúsculas). */
  bloqueadas: string[];
  /** Guías de despacho firmadas por carga. */
  pods: Record<string, Pod>;
};

const KEY = "troncaltrack.tablero";
const VACIO: Datos = { favoritos: [], bloqueadas: [], pods: {} };

let datos: Datos = VACIO;
let cargado = false;
const oyentes = new Set<() => void>();

function cargar() {
  if (cargado || typeof window === "undefined") return;
  cargado = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Datos>;
      datos = {
        favoritos: p.favoritos ?? [],
        bloqueadas: p.bloqueadas ?? [],
        pods: p.pods ?? {},
      };
    }
  } catch {
    datos = VACIO;
  }
}

function guardar(nuevo: Datos) {
  datos = nuevo;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(datos));
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

export function bloquearEmpresa(empresa: string) {
  cargar();
  const k = clave(empresa);
  if (datos.bloqueadas.includes(k)) return;
  guardar({ ...datos, bloqueadas: [k, ...datos.bloqueadas] });
}

export function desbloquearEmpresa(empresa: string) {
  cargar();
  const k = clave(empresa);
  guardar({ ...datos, bloqueadas: datos.bloqueadas.filter((b) => b !== k) });
}

export function estaBloqueada(bloqueadas: string[], empresa: string) {
  return bloqueadas.includes(clave(empresa));
}

export function guardarPod(cargaId: string, pod: Pod) {
  cargar();
  guardar({ ...datos, pods: { ...datos.pods, [cargaId]: pod } });
}

export function useTableroPrefs() {
  return useSyncExternalStore(subscribe, getSnapshot, () => VACIO);
}
