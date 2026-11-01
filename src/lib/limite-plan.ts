/** Nombres visibles de cada nivel de plan. */
export const NOMBRES_PLAN: Record<string, string> = {
  inicial: "Inicial",
  transportista_pro: "Transportista Pro",
  empresa_pyme: "Empresa Pyme",
  empresa_pro: "Empresa Pro",
};

/**
 * Interpreta el error LIMITE_PLAN:<limite>:<tier> que devuelve la base de datos
 * cuando el usuario alcanzó su tope mensual de publicaciones.
 */
export function parseLimitePlan(
  mensaje: string,
): { limite: number; plan: string } | null {
  const m = mensaje.match(/LIMITE_PLAN:(\d+):(\w+)/);
  if (!m) return null;
  return { limite: Number(m[1]), plan: NOMBRES_PLAN[m[2]] ?? m[2] };
}
