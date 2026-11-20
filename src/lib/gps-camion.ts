/** Rastreador GPS vehicular de cada camión (ID o IMEI). Módulo seguro para el navegador. */
export const AYUDA_GPS_CAMION =
  "Obligatorio para operar en TroncalTrack: es responsabilidad del transportista instalar un rastreador GPS independiente en cada uno de sus camiones, para no usar el GPS de su celular. Escribe aquí el ID o IMEI del rastreador de cada camión.";

export function normalizarGps(value: string) {
  return value.toUpperCase().replace(/[\s-]/g, "");
}

/** Mismo formato que exige la base de datos: letras y números, de 4 a 40 caracteres. */
export function gpsValido(value: string) {
  return /^[A-Z0-9]{4,40}$/.test(normalizarGps(value));
}

export function camionesSinGps<T extends { gps_dispositivo_id?: string | null }>(camiones: T[]) {
  return camiones.filter((c) => !c.gps_dispositivo_id);
}
