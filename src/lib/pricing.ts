export const UF_RESPALDO = 41252.94;
export const DESCUENTO_FUNDADOR = 0.20;
export const MESES_LANZAMIENTO = 4;
export const WHATSAPP_PLANES = "56947926230";

export const PLANES_GENERADORES = [
  { id: "generador_starter", nombre: "Generador Starter", uf: 1.3, publicaciones: 15, adicionalUf: 0.03, desde: false,
    features: ["15 publicaciones incluidas al mes", "Publicación adicional: +0,03 UF", "Sin bloqueo por superar la cuota", "Primer mes gratis en la membresía base"] },
  { id: "generador_pro", nombre: "Generador Pro", uf: 3.2, publicaciones: 60, adicionalUf: 0.02, desde: false,
    features: ["60 publicaciones incluidas al mes", "Publicación adicional: +0,02 UF", "Sin bloqueo por superar la cuota", "Primer mes gratis en la membresía base"] },
  { id: "generador_enterprise", nombre: "Generador Enterprise", uf: 10, publicaciones: Infinity, adicionalUf: 0, desde: true,
    features: ["Publicaciones ilimitadas", "Sin cargos por publicaciones adicionales", "Cotización y activación manual"] },
] as const;

export const PLANES_TRANSPORTE = [
  { id: "camionero_solitario", nombre: "Camionero Solitario", uf: 0, min: 1, max: 1, desde: false,
    features: ["1 camión registrado", "Acceso completo al tablero de cargas", "Verificación de identidad con Didit", "Sello TroncalCheck tras aprobación documental"] },
  { id: "flota_mediana", nombre: "Flota Mediana", uf: 0.121, min: 2, max: 20, desde: false,
    features: ["De 2 a 20 camiones registrados", "Tarifa mensual por patente registrada", "4 meses gratis durante el lanzamiento"] },
  { id: "flota_enterprise", nombre: "Flota Enterprise", uf: 0.0848, min: 21, max: Infinity, desde: false,
    features: ["Más de 20 camiones registrados", "Tarifa corporativa para todos tus camiones", "4 meses gratis durante el lanzamiento"] },
] as const;

export function precioFundador(uf: number): number {
  return Math.round(uf * (1 - DESCUENTO_FUNDADOR) * 10000) / 10000;
}
export function calcularFlota(camiones: number) {
  if (!Number.isSafeInteger(camiones) || camiones < 0) return null;
  const plan = PLANES_TRANSPORTE.find(p => camiones >= p.min && camiones <= p.max);
  if (camiones === 0) return { plan: null, totalUf: 0, fundadorUf: 0 };
  if (!plan) return null;
  const totalUf = Math.round(camiones * plan.uf * 10000) / 10000;
  return { plan, totalUf, fundadorUf: precioFundador(totalUf) };
}
export function calcularDador(planId: string, publicaciones: number) {
  if (!Number.isSafeInteger(publicaciones) || publicaciones < 0) return null;
  const plan = PLANES_GENERADORES.find(p => p.id === planId);
  if (!plan) return null;
  const excedentes = Math.max(0, publicaciones - plan.publicaciones);
  const adicionalesUf = Math.round(excedentes * plan.adicionalUf * 10000) / 10000;
  const totalUf = Math.round((plan.uf + adicionalesUf) * 10000) / 10000;
  return { plan, excedentes, adicionalesUf, totalUf, fundadorUf: precioFundador(totalUf) };
}
export function normalizarPatente(value: string) { return value.toUpperCase().replace(/[\s-]/g, ""); }
export function patenteValida(value: string) { return /^(?:[A-Z]{2}\d{4}|[B-DF-HJ-LP-RT-VW-Z]{4}\d{2})$/.test(normalizarPatente(value)); }
export function convertirUF(uf: number, valorUF: number): number { return Math.round(uf * valorUF); }
export function formatoUF(valor: number): string { return valor.toLocaleString("es-CL", { maximumFractionDigits: 4 }); }
export function formatoCLP(valor: number): string { return "$" + valor.toLocaleString("es-CL", { maximumFractionDigits: 0 }); }
export function fechaChile(fecha: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit" }).format(fecha);
}
export function leerUFDelDia(payload: unknown, ahora = new Date()): { valor: number; fecha: string } | null {
  if (!payload || typeof payload !== "object" || !("serie" in payload) || !Array.isArray(payload.serie)) return null;
  for (const item of payload.serie) {
    if (!item || typeof item !== "object" || typeof item.fecha !== "string" || typeof item.valor !== "number") continue;
    const fecha = new Date(item.fecha);
    if (!Number.isFinite(fecha.getTime()) || !Number.isFinite(item.valor) || item.valor <= 0) continue;
    if (fechaChile(fecha) === fechaChile(ahora)) return { valor: item.valor, fecha: fechaChile(fecha) };
  }
  return null;
}
export function enlacePlan(nombre: string, precioUf: number, desde = false, porCamion = false): string {
  const mensaje = `Hola, quiero ${desde ? "cotizar" : "activar"} el plan ${nombre} de TroncalTrack (${desde ? "desde " : ""}${formatoUF(precioUf)} UF${porCamion ? " por camión registrado" : ""}/mes). Quisiera coordinar la activación manual por transferencia y consultar los cupos Empresa Fundadora.`;
  return `https://wa.me/${WHATSAPP_PLANES}?text=${encodeURIComponent(mensaje)}`;
}
