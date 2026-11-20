/** Rastreador GPS vehicular de cada camión (ID o IMEI). Módulo seguro para el navegador. */
export const AYUDA_GPS_CAMION =
  "Obligatorio para operar en TroncalTrack. Instala un rastreador GPS vehicular compatible con protocolo GT06 (se consiguen desde $65.000 CLP en tiendas de electrónica y en línea) y escribe aquí su ID. El GPS debe transmitir solo mientras el viaje está activo, nunca usamos el GPS de tu teléfono para esto.";

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
