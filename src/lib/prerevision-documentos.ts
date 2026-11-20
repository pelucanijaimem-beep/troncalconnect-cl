import { fechaValida, TIPOS_LECTURA, type TipoLectura } from "./lectura-vencimientos";

/** Documentos del camionero que reciben pre-revisión con IA antes de la revisión manual. */
export const DOCS_PRERREVISION = ["licencia", "soat", "revision_tecnica", "permiso_circulacion"] as const;
export type ClavePrerevision = (typeof DOCS_PRERREVISION)[number];

export const NOMBRE_DOCUMENTO: Record<ClavePrerevision, string> = {
  licencia: "licencia de conducir",
  soat: "Seguro Obligatorio de Accidentes Personales (SOAP)",
  revision_tecnica: "certificado de revisión técnica",
  permiso_circulacion: "permiso de circulación",
};

export type Veredicto = { veredicto: "correcto" | "revisar"; motivo: string };

export type LecturaPrerevision = {
  coincide_tipo: boolean;
  legible: boolean;
  fecha_vigencia: string | null;
  motivo: string | null;
};

export function esClavePrerevision(valor: unknown): valor is ClavePrerevision {
  return typeof valor === "string" && (DOCS_PRERREVISION as readonly string[]).includes(valor);
}

const EXTENSIONES: Record<string, TipoLectura> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
};

/** Tipo de archivo según la extensión guardada; null si la IA no puede leerlo. */
export function tipoDesdeRuta(ruta: string): TipoLectura | null {
  const ext = ruta.split(".").pop()?.toLowerCase() ?? "";
  const tipo = EXTENSIONES[ext];
  return tipo && (TIPOS_LECTURA as readonly string[]).includes(tipo) ? tipo : null;
}

/** Fecha de hoy en Chile (AAAA-MM-DD). */
export function hoyChile(ahora = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(ahora);
}

const formatoCL = (f: string) => f.split("-").reverse().join("-");

/**
 * Convierte la lectura de la IA en un veredicto orientativo. El vencimiento se compara
 * aquí contra la fecha de hoy (no lo decide el modelo). Nunca aprueba ni rechaza.
 */
export function veredictoDesde(lectura: LecturaPrerevision, clave: ClavePrerevision, hoy: string): Veredicto {
  const motivos: string[] = [];
  if (!lectura.coincide_tipo) motivos.push(`no parece ser ${NOMBRE_DOCUMENTO[clave]}`);
  if (!lectura.legible) motivos.push("no se ve legible");
  if (fechaValida(lectura.fecha_vigencia)) {
    if (lectura.fecha_vigencia < hoy) motivos.push(`vigencia vencida el ${formatoCL(lectura.fecha_vigencia)}`);
  } else {
    motivos.push("no se distingue la fecha de vigencia");
  }
  if (motivos.length === 0) return { veredicto: "correcto", motivo: "" };
  const extra = (lectura.motivo ?? "").replace(/\s+/g, " ").trim();
  const texto = extra ? `${motivos.join("; ")} — ${extra}` : motivos.join("; ");
  return { veredicto: "revisar", motivo: texto.slice(0, 300) };
}
