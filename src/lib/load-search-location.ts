export type Coordenadas = { latitud: number; longitud: number };
// City centres are used only for approximate proximity, not truck tracking.
const CIUDADES: Record<string, [number, number]> = {
  "Santiago": [-33.4489, -70.6693], "Concepción": [-36.827, -73.05], "Los Ángeles": [-37.4697, -72.3537],
  "Chillán": [-36.6066, -72.1034], "Temuco": [-38.7359, -72.5904], "Angol": [-37.7952, -72.7164],
  "Valparaíso": [-33.0472, -71.6127], "Puerto Montt": [-41.4693, -72.9424], "Antofagasta": [-23.65, -70.4],
  "Arica": [-18.4783, -70.3126], "Iquique": [-20.2307, -70.1357], "Talca": [-35.4264, -71.6554],
  "Rancagua": [-34.1708, -70.7444], "La Serena": [-29.9027, -71.2519], "Coquimbo": [-29.9533, -71.3395],
  "Copiapó": [-27.3668, -70.3323], "Valdivia": [-39.8142, -73.2459], "Osorno": [-40.574, -73.133],
  "San Antonio": [-33.5933, -71.6217], "Talcahuano": [-36.7249, -73.1168], "Coronel": [-37.0333, -73.15],
};
const normalizar = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
export function coordenadasCiudad(ciudad: string): Coordenadas | null {
  const valor = Object.entries(CIUDADES).find(([nombre]) => normalizar(nombre) === normalizar(ciudad))?.[1];
  return valor ? { latitud: valor[0], longitud: valor[1] } : null;
}
export function distanciaKm(a: Coordenadas, b: Coordenadas): number {
  const rad = (n: number) => n * Math.PI / 180;
  const lat = rad(b.latitud - a.latitud), lon = rad(b.longitud - a.longitud);
  const h = Math.sin(lat / 2) ** 2 + Math.cos(rad(a.latitud)) * Math.cos(rad(b.latitud)) * Math.sin(lon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
}
export function usaMiUbicacion(pregunta: string) { return /cerca de mi\b|cerca mio\b|mi ubicacion\b|donde estoy\b|por aqui\b/.test(normalizar(pregunta)); }
export function referenciaUbicacion(gps: Coordenadas | null, ciudadBase: string) {
  if (gps) return { punto: gps, fuente: "gps" as const, ciudad: "" };
  return ciudadBase.trim() ? { punto: coordenadasCiudad(ciudadBase), fuente: "base" as const, ciudad: ciudadBase.trim() } : null;
}
export function origenCercano(origen: string, referencia: ReturnType<typeof referenciaUbicacion>): boolean {
  if (!referencia) return false;
  const ciudad = coordenadasCiudad(origen);
  if (ciudad && referencia.punto) return distanciaKm(referencia.punto, ciudad) <= 100;
  return referencia.fuente === "base" && normalizar(origen) === normalizar(referencia.ciudad);
}