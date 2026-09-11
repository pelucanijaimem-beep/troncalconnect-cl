import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Notificacion = {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  datos: Record<string, unknown>;
  leida: boolean;
  fecha: string;
};

type Fila = {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  datos: unknown;
  leida: boolean;
  created_at: string;
};

/** Crea un aviso dentro de la aplicación para el usuario destinatario. */
export async function crearNotificacion(entrada: {
  userId: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  datos?: Record<string, unknown>;
}): Promise<string | null> {
  const { error } = await supabase.from("notificaciones").insert({
    user_id: entrada.userId,
    tipo: entrada.tipo,
    titulo: entrada.titulo,
    mensaje: entrada.mensaje,
    datos: (entrada.datos ?? {}) as never,
  });
  return error?.message ?? null;
}

export async function marcarLeida(id: string) {
  await supabase.from("notificaciones").update({ leida: true }).eq("id", id);
}

export async function marcarTodasLeidas(userId: string) {
  await supabase
    .from("notificaciones")
    .update({ leida: true })
    .eq("user_id", userId)
    .eq("leida", false);
}

/** Notificaciones del usuario conectado, con actualización en vivo. */
export function useNotificaciones(userId: string | undefined | null) {
  const [lista, setLista] = useState<Notificacion[]>([]);

  useEffect(() => {
    if (!userId) {
      setLista([]);
      return;
    }
    let vivo = true;
    const traer = async () => {
      const { data } = await supabase
        .from("notificaciones")
        .select("id, tipo, titulo, mensaje, datos, leida, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (!vivo) return;
      setLista(
        ((data ?? []) as Fila[]).map((f) => ({
          id: f.id,
          tipo: f.tipo,
          titulo: f.titulo,
          mensaje: f.mensaje,
          datos: (f.datos ?? {}) as Record<string, unknown>,
          leida: f.leida,
          fecha: f.created_at,
        })),
      );
    };
    void traer();

    const canal = supabase
      .channel(`notificaciones-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notificaciones", filter: `user_id=eq.${userId}` },
        () => void traer(),
      )
      .subscribe();

    return () => {
      vivo = false;
      void supabase.removeChannel(canal);
    };
  }, [userId]);

  return { notificaciones: lista, sinLeer: lista.filter((n) => !n.leida).length };
}
