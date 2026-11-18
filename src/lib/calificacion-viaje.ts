/**
 * Reglas de la calificación bidireccional post-viaje. Deben coincidir con la
 * función de base de datos etiquetas_calificacion_validas, que es la que manda.
 */
export type TipoCalificacion = "a_empresa" | "a_camionero";

export const ETIQUETAS: Record<TipoCalificacion, { positivas: string[]; negativas: string[] }> = {
  /** El transportista califica a la empresa generadora. */
  a_empresa: {
    positivas: ["Carga rápida en planta", "Trato respetuoso", "Datos exactos", "Pago puntual"],
    negativas: ["Demora excesiva en carga/descarga", "Cambio de condiciones", "Atraso en pago"],
  },
  /** La empresa generadora califica al transportista. */
  a_camionero: {
    positivas: [
      "Puntual en carga y descarga",
      "Carga impecable",
      "GPS activo todo el viaje",
      "Excelente comunicación",
    ],
    negativas: ["Atraso en presentación", "Falta de EPP/documentos", "Poca comunicación"],
  },
};

export const MAX_COMENTARIO_CALIFICACION = 280;

export const esEtiquetaNegativa = (tipo: TipoCalificacion, etiqueta: string) =>
  ETIQUETAS[tipo].negativas.includes(etiqueta);

/** Devuelve un mensaje de error o null si la calificación es válida. */
export function validarCalificacion(entrada: {
  tipo: TipoCalificacion;
  estrellas: number;
  etiquetas: string[];
  comentario: string;
}): string | null {
  if (!Number.isInteger(entrada.estrellas) || entrada.estrellas < 1 || entrada.estrellas > 5) {
    return "Elige de 1 a 5 estrellas.";
  }
  if (entrada.comentario.trim().length > MAX_COMENTARIO_CALIFICACION) {
    return `El comentario admite hasta ${MAX_COMENTARIO_CALIFICACION} caracteres.`;
  }
  const permitidas = [...ETIQUETAS[entrada.tipo].positivas, ...ETIQUETAS[entrada.tipo].negativas];
  if (new Set(entrada.etiquetas).size !== entrada.etiquetas.length) return "Etiquetas repetidas.";
  if (entrada.etiquetas.some((e) => !permitidas.includes(e))) {
    return "Etiquetas no válidas para esta calificación.";
  }
  return null;
}

/** Texto de reputación para tarjetas y perfiles. */
export function textoReputacion(promedio: number, total: number): string {
  if (!total) return "Nuevo en TroncalTrack";
  return `★ ${promedio.toFixed(1)} (${total} ${total === 1 ? "viaje" : "viajes"})`;
}
