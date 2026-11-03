import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/require-session";

export type Membresia = {
  id: string; nombre: string; segmento: "transportista" | "dador"; plan: string;
  propietario: boolean; camiones: number; licencias: number; total_clp: number;
  fundador: boolean; total_fundador_clp: number; prueba_hasta: string; pago_hasta: string | null;
  suscripcion_id: string | null;
  camiones_detalle: { id: string; patente: string }[];
  miembros_detalle: { id: string; user_id: string; activo: boolean }[];
};
export const consultarMembresia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("mi_membresia");
    if (error) return { membresia: null, error: "No pudimos consultar tu membresía." };
    return { membresia: data as Membresia | null, error: null };
  });
export const gestionarMembresia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((value) => z.object({ accion: z.enum(["crear", "camion", "quitar_camion", "plan", "usuario", "quitar_usuario"]), valor: z.string().max(254).default("") }).parse(value))
  .handler(async ({ context, data }) => {
    const result = await context.supabase.rpc("gestionar_membresia", { p_accion: data.accion, p_valor: data.valor });
    if (result.error) return { membresia: null, error: result.error.code === "23505" ? "Esta patente o cuenta ya está registrada." : result.error.code === "P0001" ? result.error.message : "No pudimos guardar el cambio." };
    return { membresia: result.data as Membresia | null, error: null };
  });
