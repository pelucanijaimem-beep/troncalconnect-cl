import type { ConsumoPublicaciones } from "./membresia.functions";

export function avisoPublicaciones(consumo: ConsumoPublicaciones | null) {
  if (!consumo || consumo.plan === "generador_enterprise" || consumo.incluidas === null) return null;
  if (!["generador_starter", "generador_pro"].includes(consumo.plan)) return null;
  const restantes = Math.max(0, consumo.incluidas - consumo.publicadas);
  if (consumo.publicadas > consumo.incluidas) return { tipo: "excedida" as const, restantes, tarifaUf: consumo.adicional_uf };
  return restantes <= 3 ? { tipo: "advertencia" as const, restantes, tarifaUf: consumo.adicional_uf } : null;
}