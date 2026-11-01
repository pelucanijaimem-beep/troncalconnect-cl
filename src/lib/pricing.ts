export const UF_RESPALDO = 41252.94;
export const DESCUENTO_FUNDADOR = 0.20;
export const MESES_LANZAMIENTO = 4;
export const WHATSAPP_PLANES = "56947926230";

export const PLANES_GENERADORES = [
  { id: "generador-starter", nombre: "Generador Starter", uf: 1.3, publicaciones: 15, usuarios: 1, desde: false,
    features: ["Hasta 15 publicaciones de carga al mes", "1 usuario administrador"] },
  { id: "generador-pro", nombre: "Generador Pro", uf: 3.2, publicaciones: 60, usuarios: 3, desde: false,
    features: ["Hasta 60 publicaciones de carga al mes", "3 usuarios", "Filtro exclusivo de transportistas verificados", "Soporte prioritario"] },
  { id: "generador-enterprise", nombre: "Generador Enterprise", uf: 10, publicaciones: Infinity, usuarios: null, desde: true,
    features: ["Publicaciones ilimitadas", "Integración API (SAP / Oracle)", "Panel multi-sucursal", "Analítica de tarifa por km", "Cotización personalizada"] },
] as const;

export const PLANES_TRANSPORTE = [
  { id: "independiente", nombre: "Camión Independiente", uf: 0, min: 1, max: 1,
    features: ["1 camión", "Acceso a búsqueda de cargas", "Perfil verificado TroncalCheck, tras aprobación documental", "Gratis de forma permanente"] },
  { id: "flota-pyme", nombre: "Flota Pyme", uf: 0.25, min: 2, max: 9,
    features: ["De 2 a 9 camiones activos", "1 chofer con cuenta registrada por camión", "Solo pagas por camiones activos ese mes", "Activación y gestión por WhatsApp"] },
  { id: "flota-mediana", nombre: "Flota Mediana", uf: 0.17, min: 10, max: 49,
    features: ["De 10 a 49 camiones activos", "1 chofer con cuenta registrada por camión", "Solo pagas por camiones activos ese mes", "Activación y gestión por WhatsApp"] },
  { id: "flota-enterprise", nombre: "Flota Enterprise", uf: 0.08, min: 50, max: Infinity,
    features: ["50 o más camiones activos", "1 chofer con cuenta registrada por camión", "Solo pagas por camiones activos ese mes", "Cotización y contrato anual"] },
] as const;

export function precioFundador(uf: number): number {
  return Math.round(uf * (1 - DESCUENTO_FUNDADOR) * 10000) / 10000;
}

export function calcularFlota(camionesActivos: number) {
  if (!Number.isSafeInteger(camionesActivos) || camionesActivos < 0) return null;
  const plan = PLANES_TRANSPORTE.find(p => camionesActivos >= p.min && camionesActivos <= p.max);
  if (camionesActivos === 0) return { plan: null, totalUf: 0, fundadorUf: 0 };
  if (!plan) return null;
  const totalUf = Math.round(camionesActivos * plan.uf * 10000) / 10000;
  return { plan, totalUf, fundadorUf: precioFundador(totalUf) };
}

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