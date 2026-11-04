import { useCallback, useEffect, useId, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { validarMensaje, type Conversacion } from "./mensajes";

export type Mensaje = {
  id: string;
  autor_id: string;
  texto: string;
  created_at: string;
};

/** Conversaciones del usuario (solo las suyas, filtradas por el servidor) con aviso en vivo. */
export function useConversaciones(userId: string | undefined | null) {
  const [lista, setLista] = useState<Conversacion[]>([]);
  const canalId = useId();

  const traer = useCallback(async () => {
    if (!userId) return setLista([]);
    const { data } = await supabase.rpc("mis_conversaciones");
    setLista(((data ?? []) as unknown as Conversacion[]));
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setLista([]);
      return;
    }
    void traer();
    const canal = supabase
      .channel(`mensajes-inbox-${userId}-${canalId}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "mensajes_carga" }, () => void traer())
      .subscribe();
    return () => {
      void supabase.removeChannel(canal);
    };
  }, [userId, canalId, traer]);

  return { conversaciones: lista, recargar: traer };
}

/** Mensajes de una conversación (carga + transportista). */
export function useChat(cargaId: string | null, transportistaId: string | null) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);

  useEffect(() => {
    if (!cargaId || !transportistaId) {
      setMensajes([]);
      return;
    }
    let vivo = true;
    const traer = async () => {
      const { data } = await supabase
        .from("mensajes_carga")
        .select("id, autor_id, texto, created_at")
        .eq("carga_id", cargaId)
        .eq("transportista_id", transportistaId)
        .order("created_at", { ascending: true })
        .limit(300);
      if (!vivo) return;
      setMensajes((data ?? []) as Mensaje[]);
      void supabase.rpc("marcar_mensajes_leidos", { p_carga: cargaId, p_transportista: transportistaId });
    };
    void traer();
    const canal = supabase
      .channel(`chat-${cargaId}-${transportistaId}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "mensajes_carga", filter: `carga_id=eq.${cargaId}` },
        () => void traer(),
      )
      .subscribe();
    return () => {
      vivo = false;
      void supabase.removeChannel(canal);
    };
  }, [cargaId, transportistaId]);

  return mensajes;
}

export async function enviarMensaje(
  cargaId: string,
  transportistaId: string,
  autorId: string,
  texto: string,
): Promise<string | null> {
  const err = validarMensaje(texto);
  if (err) return err;
  const { error } = await supabase.from("mensajes_carga").insert({
    carga_id: cargaId,
    transportista_id: transportistaId,
    autor_id: autorId,
    texto: texto.trim(),
  });
  return error ? "No pudimos enviar el mensaje. Inténtalo nuevamente." : null;
}
