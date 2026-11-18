/**
 * Reglas compartidas (navegador y servidor) de los avisos al teléfono por
 * cargas nuevas que calzan con las alertas de coincidencia del transportista.
 */
export type FiltroAlerta = { origenes: string[]; destinos: string[]; carrocerias: string[] };
export type CargaAlerta = { origen: string; destino: string; carroceria: string };

const igual = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** Una lista vacía acepta cualquier valor, pero se exige al menos una preferencia. */
export function coincideAlerta(prefs: FiltroAlerta, carga: CargaAlerta): boolean {
  const total = prefs.origenes.length + prefs.destinos.length + prefs.carrocerias.length;
  if (total === 0) return false;
  return (
    (prefs.origenes.length === 0 || prefs.origenes.some((o) => igual(o, carga.origen))) &&
    (prefs.destinos.length === 0 || prefs.destinos.some((d) => igual(d, carga.destino))) &&
    (prefs.carrocerias.length === 0 || prefs.carrocerias.some((c) => igual(c, carga.carroceria)))
  );
}

/** Pesos chilenos sin decimales y con punto de miles: 637500 → "$637.500". */
export function formatoPesos(valor: number): string {
  const entero = Math.round(Number(valor) || 0);
  const signo = entero < 0 ? "-" : "";
  const digitos = String(Math.abs(entero)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${signo}$${digitos}`;
}

export const urlDetalleCarga = (cargaId: string) => `/carga/${encodeURIComponent(cargaId)}`;

/** Texto del aviso: título con la ruta y cuerpo con carrocería, tarifa y total. */
export function textoPushCarga(carga: {
  id: string;
  origen: string;
  destino: string;
  carroceria: string;
  valorKm: number;
  km: number;
}) {
  return {
    titulo: `Nueva carga disponible: ${carga.origen} → ${carga.destino}`,
    cuerpo: `${carga.carroceria} · ${formatoPesos(carga.valorKm)}/km · Total ${formatoPesos(carga.valorKm * carga.km)}`,
    url: urlDetalleCarga(carga.id),
    tag: `carga-${carga.id}`,
  };
}
