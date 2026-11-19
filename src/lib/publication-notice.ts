import type { ConsumoPublicaciones } from "./membresia.functions";
import { PLANES_GENERADORES } from "./pricing";

// Generator plans are unlimited: only a plan with a finite included cap may ever show a quota notice.
export function avisoPublicaciones(consumo: ConsumoPublicaciones | null) {
  if (!consumo || consumo.incluidas === null) return null;
  const plan = PLANES_GENERADORES.find(p => p.id === consumo.plan);
  const tarifa: number = plan?.adicionalUf ?? 0;
  if (!plan || !Number.isFinite(plan.publicaciones) || tarifa === 0) return null;
  const restantes = Math.max(0, consumo.incluidas - consumo.publicadas);
  if (consumo.publicadas > consumo.incluidas) return { tipo: "excedida" as const, restantes, tarifaUf: consumo.adicional_uf };
  return restantes <= 3 ? { tipo: "advertencia" as const, restantes, tarifaUf: consumo.adicional_uf } : null;
}
