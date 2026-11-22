/** Funciones puras para preparar el resumen con IA de reportes de ruta. */
export type ReporteParaResumen = {
  tipo: string;
  origen: string;
  destino: string;
  detalle: string;
  created_at: string;
};

export const DIAS_VIGENCIA_REPORTE = 45;
export const MAX_REPORTES_RESUMEN = 10;

/** Quita caracteres que alteran el filtro de búsqueda por ciudad. */
export function limpiarCiudad(ciudad: string): string {
  return ciudad.replace(/[,()%*\\]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

/** Filtro de coincidencia por nombre de ciudad (origen o destino). */
export function filtroCiudades(origen: string, destino: string): string | null {
  const ciudades = [limpiarCiudad(origen), limpiarCiudad(destino)].filter(Boolean);
  if (!ciudades.length) return null;
  return ciudades.flatMap((c) => [`origen.ilike.%${c}%`, `destino.ilike.%${c}%`]).join(",");
}

/** Ciudades limpias (origen y destino) para la consulta segura de reportes. */
export function ciudadesConsulta(origen: string, destino: string): string[] {
  return [limpiarCiudad(origen), limpiarCiudad(destino)].filter(Boolean);
}

/** Datos mínimos y verificables que recibe el modelo; nunca incluye usuarios. */
export function datosParaResumen(reportes: ReporteParaResumen[], ahora: Date) {
  return reportes.slice(0, MAX_REPORTES_RESUMEN).map((r) => ({
    tipo: r.tipo,
    ruta: `${r.origen} → ${r.destino}`,
    hace_dias: Math.max(0, Math.floor((ahora.getTime() - new Date(r.created_at).getTime()) / 86_400_000)),
    detalle: r.detalle.slice(0, 300),
  }));
}
