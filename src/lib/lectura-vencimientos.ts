import type { ClaveVencimiento } from "./use-vencimientos";

export const TIPOS_LECTURA = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;
export type TipoLectura = (typeof TIPOS_LECTURA)[number];
/** Upload ceiling for the read (base64 grows ~33%, so this keeps requests under ~6 MB). */
export const MAX_BYTES_LECTURA = 4 * 1024 * 1024;

export type LecturaDocumento = Partial<Record<ClaveVencimiento, string>> & { patente?: string };

/** Accepts only real calendar dates (YYYY-MM-DD) between 2000 and 2100. */
export function fechaValida(valor: unknown): valor is string {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const [a = 0, m = 0, d = 0] = valor.split("-").map(Number);
  if (a < 2000 || a > 2100) return false;
  const f = new Date(Date.UTC(a, m - 1, d));
  return f.getUTCFullYear() === a && f.getUTCMonth() === m - 1 && f.getUTCDate() === d;
}

/** Chilean plates: 4 letters + 2 digits, or 2 letters + 4 digits (older format). */
export function patenteValida(valor: unknown): valor is string {
  return typeof valor === "string" && /^([A-Z]{4}\d{2}|[A-Z]{2}\d{4})$/.test(valor);
}

const CLAVES: ClaveVencimiento[] = ["revision_tecnica", "permiso_circulacion", "soap", "carga_peligrosa"];

/** Keeps only valid values from the model output; anything doubtful is dropped for manual entry. */
export function normalizarLectura(raw: Record<string, unknown>): LecturaDocumento {
  const salida: LecturaDocumento = {};
  for (const clave of CLAVES) {
    if (fechaValida(raw[clave])) salida[clave] = raw[clave] as string;
  }
  const bruto = raw["patente"];
  const patente = typeof bruto === "string" ? bruto.replace(/[\s.·-]/g, "").toUpperCase() : null;
  if (patenteValida(patente)) salida.patente = patente;
  return salida;
}
