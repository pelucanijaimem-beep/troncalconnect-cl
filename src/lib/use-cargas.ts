import { useEffect, useId, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Carga, Carroceria, PaisCodigo } from "@/lib/troncal-data";

export type CargaDB = Carga & {
  titulo: string;
  estado: "activa" | "completada";
  userId: string;
};

type Fila = {
  id: string;
  user_id: string;
  titulo: string;
  origen: string;
  destino: string;
  tipo_camion: string;
  precio: number;
  estado: string;
  empresa: string;
  empresa_telefono: string;
  empresa_verificada: boolean;
  pais: string;
  km: number;
  valor_km: number;
  toneladas: number;
  fecha: string | null;
  detalle: string;
  solo_verificados: boolean;
  dias_pago: string | null;
  tipo_publicador: string | null;
  visibilidad: string | null;
};

const aCarga = (f: Fila): CargaDB => ({
  id: f.id,
  userId: f.user_id,
  titulo: f.titulo,
  estado: f.estado === "completada" ? "completada" : "activa",
  pais: (f.pais as PaisCodigo) ?? "CL",
  origen: f.origen,
  destino: f.destino,
  km: Number(f.km),
  valorKm: Number(f.valor_km),
  carroceria: f.tipo_camion as Carroceria,
  toneladas: Number(f.toneladas),
  empresa: f.empresa,
  verificada: f.empresa_verificada,
  fecha: f.fecha ?? "",
  detalle: f.detalle,
  telefono: f.empresa_telefono,
  soloVerificados: f.solo_verificados,
  diasPago: f.dias_pago ?? "Pago a 30 días",
  tipoPublicador: f.tipo_publicador === "intermediario" ? "intermediario" : "generador",
  visibilidad: f.visibilidad === "privada" ? "privada" : "publica",
});

/** Una carga suelta por su identificador (la base de datos bloquea las privadas ajenas). */
export async function cargaPorId(id: string): Promise<CargaDB | null> {
  const { data } = await supabase.from("cargas").select("*").eq("id", id).maybeSingle();
  return data ? aCarga(data as Fila) : null;
}

/** Invita por correo a un usuario registrado a ver una carga privada. */
export async function invitarACarga(cargaId: string, email: string) {
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  if (!perfil) return "No encontramos una cuenta registrada con ese correo.";
  const { error } = await supabase
    .from("invitaciones_carga")
    .insert({ carga_id: cargaId, invitado_id: perfil.id as string });
  if (error && !error.message.includes("duplicate")) return error.message;
  return null;
}

/** Cargas guardadas en la base de datos, con actualización en tiempo real. */
export function useCargas(activo: boolean) {
  const [cargas, setCargas] = useState<CargaDB[]>([]);
  const [cargando, setCargando] = useState(false);
  const canalId = useId();

  useEffect(() => {
    if (!activo) {
      setCargas([]);
      return;
    }
    let vivo = true;
    setCargando(true);

    const traer = async () => {
      const { data } = await supabase
        .from("cargas")
        .select("*")
        .order("created_at", { ascending: false });
      if (!vivo) return;
      setCargas(((data ?? []) as Fila[]).map(aCarga));
      setCargando(false);
    };

    void traer();

    let canal: ReturnType<typeof supabase.channel> | null = null;
    try {
      canal = supabase
        .channel(`cargas-tablero-${canalId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "cargas" }, () => {
          void traer();
        })
        .subscribe();
    } catch {
      canal = null;
    }

    return () => {
      vivo = false;
      if (canal) {
        try {
          void supabase.removeChannel(canal);
        } catch {
          /* no bloquea la app */
        }
      }
    };
  }, [activo, canalId]);

  return { cargas, cargando };
}

export async function publicarCargaDB(entrada: {
  userId: string;
  titulo: string;
  origen: string;
  destino: string;
  tipoCamion: string;
  precio: number;
  empresa: string;
  telefono: string;
  verificada: boolean;
  pais: string;
  km: number;
  valorKm: number;
  toneladas: number;
  fecha: string;
  detalle: string;
  soloVerificados: boolean;
  diasPago?: string;
  tipoPublicador?: "generador" | "intermediario";
}) {
  const { data, error } = await supabase
    .from("cargas")
    .insert({
      user_id: entrada.userId,
      titulo: entrada.titulo,
      origen: entrada.origen,
      destino: entrada.destino,
      tipo_camion: entrada.tipoCamion,
      precio: entrada.precio,
      empresa: entrada.empresa,
      empresa_telefono: entrada.telefono,
      empresa_verificada: entrada.verificada,
      pais: entrada.pais,
      km: entrada.km,
      valor_km: entrada.valorKm,
      toneladas: entrada.toneladas,
      fecha: entrada.fecha || null,
      detalle: entrada.detalle,
      solo_verificados: entrada.soloVerificados,
      dias_pago: entrada.diasPago ?? "Pago a 30 días",
      tipo_publicador: entrada.tipoPublicador ?? "generador",
    })
    .select("id")
    .single();
  return { id: (data?.id as string | undefined) ?? null, error: error?.message ?? null };
}


export async function completarCarga(id: string) {
  const { error } = await supabase
    .from("cargas")
    .update({ estado: "completada", completada_at: new Date().toISOString() })
    .eq("id", id);
  return error?.message ?? null;
}


/** Postular a una carga. Requiere plan mensual activo (validado también por la base de datos). */
export async function postularACarga(cargaId: string, userId: string, mensaje: string) {
  const { error } = await supabase
    .from("postulaciones")
    .insert({ carga_id: cargaId, user_id: userId, mensaje });
  return error?.message ?? null;
}

export function useMisPostulaciones(userId?: string) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) {
      setIds([]);
      return;
    }
    let vivo = true;
    void supabase
      .from("postulaciones")
      .select("carga_id")
      .eq("user_id", userId)
      .then(({ data }) => {
        if (vivo) setIds((data ?? []).map((p) => p.carga_id as string));
      });
    return () => {
      vivo = false;
    };
  }, [userId]);

  return { ids, agregar: (id: string) => setIds((p) => [...p, id]) };
}

/** Primer camionero que postuló a la carga, para la calificación cruzada. */
export async function primerPostulante(
  cargaId: string,
): Promise<{ id: string; nombre: string } | null> {
  const { data } = await supabase
    .from("postulaciones")
    .select("user_id")
    .eq("carga_id", cargaId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("id, nombre")
    .eq("id", data.user_id as string)
    .maybeSingle();
  return perfil ? { id: perfil.id as string, nombre: perfil.nombre as string } : null;
}
