/** Counteroffers travel inside the application's message so the load owner reads them as-is. */
export const PREFIJO_CONTRAOFERTA = "Contraoferta:";
export const MAX_MENSAJE_CONTRAOFERTA = 140;

export type ModoContraoferta = "km" | "total";

const clp = (n: number) => "$ " + Math.round(n).toLocaleString("es-CL");

/** Compares the carrier's proposal with the published rate; null when the input is not a positive amount. */
export function calcularContraoferta(km: number, valorKmPublicado: number, modo: ModoContraoferta, valor: number) {
  if (!Number.isFinite(valor) || valor <= 0 || km <= 0) return null;
  const totalPublicado = Math.round(km * valorKmPublicado);
  const totalPropuesto = Math.round(modo === "km" ? valor * km : valor);
  const valorKmPropuesto = Math.round(totalPropuesto / km);
  const diferencia = totalPropuesto - totalPublicado;
  const porcentaje = totalPublicado > 0 ? Math.round((diferencia / totalPublicado) * 1000) / 10 : 0;
  return { totalPublicado, totalPropuesto, valorKmPropuesto, diferencia, porcentaje };
}

export function textoDiferencia(diferencia: number, porcentaje: number) {
  if (diferencia === 0) return "Igual a la tarifa publicada";
  const signo = diferencia > 0 ? "+" : "−";
  const pct = Math.abs(porcentaje).toLocaleString("es-CL", { maximumFractionDigits: 1 });
  return `${signo}${clp(Math.abs(diferencia))} (${signo}${pct} %) ${diferencia > 0 ? "sobre" : "bajo"} la tarifa publicada`;
}

/** Message stored with the application and shown to the load owner. */
export function mensajeContraoferta(
  c: NonNullable<ReturnType<typeof calcularContraoferta>>,
  nota: string,
) {
  const extra = nota.trim().slice(0, MAX_MENSAJE_CONTRAOFERTA);
  return (
    `${PREFIJO_CONTRAOFERTA} ${clp(c.totalPropuesto)} total (${clp(c.valorKmPropuesto)}/km) · ` +
    textoDiferencia(c.diferencia, c.porcentaje) +
    (extra ? `. Mensaje: ${extra}` : "")
  );
}

export function esContraoferta(mensaje: string) {
  return mensaje.startsWith(PREFIJO_CONTRAOFERTA);
}
