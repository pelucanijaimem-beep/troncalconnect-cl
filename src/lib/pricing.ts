export const UF_RESPALDO = 41252.94;
export const MESES_LANZAMIENTO = 1;
export const WHATSAPP_PLANES = "56947926230";

export const PLANES_GENERADORES = [
  { id: "generador_starter", nombre: "Generador Starter", uf: 1.3, clp: 53990, adicionalClp: 0, publicaciones: Infinity, adicionalUf: 0, desde: false,
    features: ["Publicaciones ilimitadas", "1 usuario coordinador (1 planta o bodega)", "Acceso a transportistas con sello TroncalCheck y GPS en vivo", "Primer mes gratis"] },
  { id: "generador_pro", nombre: "Generador Pro", uf: 3.2, clp: 131990, adicionalClp: 0, publicaciones: Infinity, adicionalUf: 0, desde: false,
    features: ["Publicaciones ilimitadas", "Hasta 5 usuarios coordinadores (múltiples sucursales)", "Seguimiento simultáneo y historial de entregas con PIN", "Primer mes gratis"] },
  { id: "generador_enterprise", nombre: "Generador Enterprise", uf: 10, clp: 412990, adicionalClp: 0, publicaciones: Infinity, adicionalUf: 0, desde: true,
    features: ["Publicaciones y usuarios ilimitados", "Operación multi-planta de alto volumen", "Activación personalizada y soporte prioritario"] },
] as const;

export const PLANES_TRANSPORTE = [
  { id: "camionero_solitario", nombre: "Transportista con un camión", uf: 0, clp: 0, min: 1, max: 1, desde: false,
    features: ["1 camión registrado", "Acceso completo al tablero de cargas", "Verificación de identidad con Didit", "Sello TroncalCheck tras aprobación documental"] },
  { id: "flota_mediana", nombre: "Flota Mediana", uf: 0.1937, clp: 7990, min: 2, max: 20, desde: false,
    features: ["De 2 a 20 camiones registrados", "Tarifa mensual por patente registrada", "Primer mes gratis desde tu registro", "Rastreo GPS obligatorio durante el viaje activo"] },
  { id: "flota_corporativa", nombre: "Flota Corporativa", uf: 0.1188, clp: 4900, min: 21, max: Infinity, desde: false,
    features: ["Más de 20 camiones registrados", "Tarifa corporativa para todos tus camiones", "Primer mes gratis desde tu registro", "Rastreo GPS obligatorio durante el viaje activo"] },
] as const;

export function calcularFlota(camiones: number) {
  if (!Number.isSafeInteger(camiones) || camiones < 0) return null;
  const plan = PLANES_TRANSPORTE.find(p => camiones >= p.min && camiones <= p.max);
  if (camiones === 0) return { plan: null, totalClp: 0, totalUf: 0 };
  if (!plan) return null;
  const totalUf = Math.round(camiones * plan.uf * 10000) / 10000;
  const totalClp = camiones * plan.clp;
  return { plan, totalClp, totalUf };
}
export function calcularDador(planId: string, publicaciones: number) {
  if (!Number.isSafeInteger(publicaciones) || publicaciones < 0) return null;
  const plan = PLANES_GENERADORES.find(p => p.id === planId);
  if (!plan) return null;
  const excedentes = Math.max(0, publicaciones - plan.publicaciones);
  const adicionalesUf = Math.round(excedentes * plan.adicionalUf * 10000) / 10000;
  const totalUf = Math.round((plan.uf + adicionalesUf) * 10000) / 10000;
  const adicionalesClp = excedentes * plan.adicionalClp;
  const totalClp = plan.clp + adicionalesClp;
  return { plan, excedentes, adicionalesClp, totalClp, adicionalesUf, totalUf };
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
export function enlacePlan(nombre: string, precioClp: number, desde = false, porCamion = false): string {
  const mensaje = `Hola, quiero ${desde ? "cotizar" : "activar"} el plan ${nombre} de TroncalTrack (${desde ? "desde " : ""}${formatoCLP(precioClp)} CLP${porCamion ? " por camión registrado" : ""}/mes). Quisiera coordinar la activación manual por transferencia.`;
  return `https://wa.me/${WHATSAPP_PLANES}?text=${encodeURIComponent(mensaje)}`;
}

// Preserve stored publication snapshots; project their existing discounts onto fixed peso rates.
export function importePublicacionesCLP(planId: string, importeRegistrado: number): number {
  const plan = PLANES_GENERADORES.find(p => p.id === planId);
  const tarifaUf: number = plan?.adicionalUf ?? 0;
  const tarifaClp: number = plan?.adicionalClp ?? 0;
  if (tarifaUf === 0) return 0;
  return Math.round(importeRegistrado / tarifaUf * tarifaClp);
}
