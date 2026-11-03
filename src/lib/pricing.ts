export const UF_RESPALDO = 41252.94;
export const DESCUENTO_FUNDADOR = 0.20;
export const MESES_LANZAMIENTO = 4;
export const WHATSAPP_PLANES = "56947926230";

export const PLANES_GENERADORES = [
  { id: "empresa_pyme", nombre: "Empresa Pyme", clp: 49990, publicaciones: 10, usuarios: 1,
    features: ["1 usuario administrador", "Hasta 10 publicaciones de carga al mes", "Primer mes gratis"] },
  { id: "corporativo_premium", nombre: "Corporativo Premium", clp: 149990, publicaciones: Infinity, usuarios: null,
    features: ["Tarifa por usuario / licencia activa", "Publicaciones de carga ilimitadas", "Transportistas con identidad verificada", "Primer mes gratis"] },
] as const;

export const PLANES_TRANSPORTE = [
  { id: "camionero_solitario", nombre: "Camionero Solitario", clp: 0, min: 1, max: 1,
    features: ["1 camión registrado", "Acceso completo al tablero de cargas", "Verificación de identidad con Didit", "Sello TroncalCheck tras aprobación documental"] },
  { id: "flota_mediana", nombre: "Flota Mediana", clp: 4990, min: 2, max: 20,
    features: ["De 2 a 20 camiones registrados", "Tarifa mensual por patente registrada", "4 meses gratis durante el lanzamiento"] },
  { id: "flota_enterprise", nombre: "Flota Enterprise", clp: 3500, min: 21, max: Infinity,
    features: ["Más de 20 camiones registrados", "Tarifa corporativa para todos tus camiones", "4 meses gratis durante el lanzamiento"] },
] as const;

export function precioFundador(uf: number): number {
  return Math.round(uf * (1 - DESCUENTO_FUNDADOR) * 10000) / 10000;
}

export function calcularFlota(camionesRegistrados: number) {
  if (!Number.isSafeInteger(camionesRegistrados) || camionesRegistrados < 0) return null;
  const plan = PLANES_TRANSPORTE.find(p => camionesRegistrados >= p.min && camionesRegistrados <= p.max);
  if (camionesRegistrados === 0) return { plan: null, totalClp: 0, fundadorClp: 0 };
  if (!plan) return null;
  const totalClp = camionesRegistrados * plan.clp;
  return { plan, totalClp, fundadorClp: Math.round(totalClp * (1 - DESCUENTO_FUNDADOR)) };
}

export function calcularDador(planId: string, licencias: number) {
  if (!Number.isSafeInteger(licencias) || licencias < 1) return null;
  const plan = PLANES_GENERADORES.find(p => p.id === planId);
  if (!plan || (plan.usuarios !== null && licencias > plan.usuarios)) return null;
  const totalClp = plan.clp * licencias;
  return { plan, totalClp, fundadorClp: Math.round(totalClp * (1 - DESCUENTO_FUNDADOR)) };
}

export function normalizarPatente(value: string) { return value.toUpperCase().replace(/[\s-]/g, ""); }
export function patenteValida(value: string) { return /^(?:[A-Z]{2}\d{4}|[B-DF-HJ-LP-RT-VW-Z]{4}\d{2})$/.test(normalizarPatente(value)); }

export function convertirUF(uf: number, valorUF: number): number {
  return Math.round(uf * valorUF);
}

export function formatoUF(valor: number): string {
  return valor.toLocaleString("es-CL", { maximumFractionDigits: 4 });
}

export function formatoCLP(valor: number): string {
  return "$" + valor.toLocaleString("es-CL", { maximumFractionDigits: 0 });
}

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
  const mensaje = `Hola, quiero ${desde ? "cotizar" : "activar"} el plan ${nombre} de TroncalTrack (${desde ? "desde " : ""}${formatoUF(precioUf)} UF${porCamion ? " por camión activo" : ""}/mes). Quisiera consultar la activación y los cupos Empresa Fundadora con 20% de descuento de por vida.`;
  return `https://wa.me/${WHATSAPP_PLANES}?text=${encodeURIComponent(mensaje)}`;
}