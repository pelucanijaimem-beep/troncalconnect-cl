import { useEffect, useState } from "react";
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
});

/** Cargas guardadas en la base de datos, con actualización en tiempo real. */
export function useCargas(activo: boolean) {
  const [cargas, setCargas] = useState<CargaDB[]>([]);
  const [cargando, setCargando] = useState(false);

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

    const canal = supabase
      .channel("cargas-tablero")
      .on("postgres_changes", { event: "*", schema: "public", table: "cargas" }, () => {
        void traer();
      })
      .subscribe();

    return () => {
      vivo = false;
      void supabase.removeChannel(canal);
    };
  }, [activo]);

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
