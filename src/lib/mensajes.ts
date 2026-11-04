/** Reglas puras del chat por carga. */
export const MAX_MENSAJE = 1000;

export function validarMensaje(texto: string): string | null {
  const t = texto.trim();
  if (!t) return "Escribe un mensaje.";
  if (t.length > MAX_MENSAJE) return `El mensaje no puede superar ${MAX_MENSAJE} caracteres.`;
  return null;
}

export type Conversacion = {
  carga_id: string;
  transportista_id: string;
  ruta: string;
  soy_empresa: boolean;
  contraparte: string;
  ultimo_texto: string | null;
  ultimo_at: string | null;
  sin_leer: number;
};

export function totalSinLeer(lista: Conversacion[]): number {
  return lista.reduce((s, c) => s + (Number(c.sin_leer) || 0), 0);
}
