/** Reglas puras para ocultar del tablero las cargas de empresas bloqueadas. */
export type EmpresaBloqueada = { id: string; nombre: string };

const clave = (s: string) => s.trim().toLowerCase();

/**
 * true si la carga pertenece a una empresa bloqueada: por cuenta (dueño de la
 * carga) o, para bloqueos antiguos guardados en el dispositivo, por nombre.
 */
export function cargaBloqueada(
  bloqueos: { ids: readonly EmpresaBloqueada[]; nombres: readonly string[] },
  carga: { empresa: string; userId?: string | undefined },
): boolean {
  if (carga.userId && bloqueos.ids.some((b) => b.id === carga.userId)) return true;
  return bloqueos.nombres.includes(clave(carga.empresa));
}
