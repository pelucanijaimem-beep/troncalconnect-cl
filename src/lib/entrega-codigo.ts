/** Reglas del cierre de entrega con código de 6 dígitos + nombre y RUT del receptor. */
import { rutValido } from "./rut";

export const MAX_INTENTOS_ENTREGA = 5;
export const MENSAJE_CODIGO_INCORRECTO = "Código incorrecto, verifícalo con el receptor";

/** Deja solo dígitos y como máximo 6. */
export function limpiarCodigo(valor: string): string {
  return valor.replace(/\D/g, "").slice(0, 6);
}

export type DatosEntrega = { codigo: string; nombre: string; rut: string };
export type ErroresEntrega = Partial<Record<keyof DatosEntrega, string>>;

/** Valida el formulario antes de enviarlo (el servidor vuelve a validar todo). */
export function validarEntrega(d: DatosEntrega): ErroresEntrega {
  const errores: ErroresEntrega = {};
  if (!/^\d{6}$/.test(d.codigo.trim())) errores.codigo = "Ingresa el código de 6 dígitos.";
  const nombre = d.nombre.trim().replace(/\s+/g, " ");
  if (nombre.length < 3) errores.nombre = "Ingresa el nombre de quien recibe.";
  else if (nombre.length > 120) errores.nombre = "El nombre admite hasta 120 caracteres.";
  if (!d.rut.trim()) errores.rut = "Ingresa el RUT de quien recibe.";
  else if (!rutValido(d.rut)) errores.rut = "RUT no válido. Revisa el número y el dígito verificador.";
  return errores;
}

export type ResultadoEntrega =
  | { ok: true; entregadoAt: string }
  | { ok: false; error: "codigo_incorrecto" | "bloqueado" | "otro"; restantes: number; mensaje: string };

/** Traduce la respuesta del servidor a un mensaje para el transportista. */
export function interpretarResultado(r: unknown): ResultadoEntrega {
  const o = (r ?? {}) as { ok?: unknown; error?: unknown; restantes?: unknown; entregado_at?: unknown };
  if (o.ok === true) return { ok: true, entregadoAt: String(o.entregado_at ?? "") };
  const restantes = typeof o.restantes === "number" ? o.restantes : 0;
  if (o.error === "codigo_incorrecto") {
    return {
      ok: false,
      error: "codigo_incorrecto",
      restantes,
      mensaje:
        restantes > 0
          ? `${MENSAJE_CODIGO_INCORRECTO}. Te quedan ${restantes} ${restantes === 1 ? "intento" : "intentos"}.`
          : `${MENSAJE_CODIGO_INCORRECTO}. Agotaste los intentos: pide a la empresa un código nuevo.`,
    };
  }
  if (o.error === "bloqueado") {
    return {
      ok: false,
      error: "bloqueado",
      restantes: 0,
      mensaje: "Agotaste los intentos. Pide a la empresa de carga que genere un código nuevo.",
    };
  }
  return { ok: false, error: "otro", restantes, mensaje: "No pudimos confirmar la entrega. Inténtalo nuevamente." };
}

export type CodigoEntrega = {
  estado: "en_ruta" | "entregado";
  codigo: string | null;
  bloqueado: boolean;
  transportista: string;
  iniciadoAt: string;
  entregadoAt: string | null;
  receptorNombre: string | null;
  receptorRut: string | null;
};

const texto = (v: unknown) => (typeof v === "string" ? v : null);

/** Lee la respuesta del código de entrega (null si no eres la empresa dueña o no hay viaje). */
export function leerCodigoEntrega(data: unknown): CodigoEntrega | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  return {
    estado: o["estado"] === "entregado" ? "entregado" : "en_ruta",
    codigo: texto(o["codigo"]),
    bloqueado: o["bloqueado"] === true,
    transportista: texto(o["transportista"]) ?? "el transportista",
    iniciadoAt: texto(o["iniciado_at"]) ?? "",
    entregadoAt: texto(o["entregado_at"]),
    receptorNombre: texto(o["receptor_nombre"]),
    receptorRut: texto(o["receptor_rut"]),
  };
}
