/** Máximo de cargas guardadas que se comparan lado a lado. */
export const MAX_COMPARAR = 3;

/** Agrega o quita una carga de la comparación sin superar el máximo. */
export function alternarSeleccion(seleccion: readonly string[], id: string): string[] {
  if (seleccion.includes(id)) return seleccion.filter((s) => s !== id);
  if (seleccion.length >= MAX_COMPARAR) return [...seleccion];
  return [...seleccion, id];
}
