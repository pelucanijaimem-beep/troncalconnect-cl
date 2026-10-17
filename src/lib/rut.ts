/** Utilidades de RUT chileno: normalización, formato y validación. */

/** Deja el RUT sin puntos ni guión y con la "k" en minúscula. */
export function normalizarRut(valor: string): string {
  return valor.replace(/[^0-9kK]/g, "").toLowerCase();
}

/** Formatea como 12.345.678-9 para mostrarlo en pantalla. */
export function formatearRut(valor: string): string {
  const limpio = normalizarRut(valor);
  if (limpio.length < 2) return limpio.toUpperCase();
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1).toUpperCase();
  return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${dv}`;
}

/** Valida el dígito verificador con módulo 11. */
export function rutValido(valor: string): boolean {
  // Acepta separadores habituales, pero no descarta letras ni otros caracteres.
  if (!/^[0-9.kK\s-]+$/.test(valor)) return false;
  const limpio = normalizarRut(valor);
  if (!/^\d{7,8}[0-9k]$/.test(limpio)) return false;
  const cuerpo = limpio.slice(0, -1);
  if (Number(cuerpo) === 0) return false;
  const dv = limpio.slice(-1);
  if (!/^\d+$/.test(cuerpo)) return false;
  let suma = 0;
  let factor = 2;
  for (let i = cuerpo.length - 1; i >= 0; i -= 1) {
    suma += Number(cuerpo[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const resto = 11 - (suma % 11);
  const esperado = resto === 11 ? "0" : resto === 10 ? "k" : String(resto);
  return esperado === dv;
}
