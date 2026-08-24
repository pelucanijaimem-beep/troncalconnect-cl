import { coordDe, type Carga } from "@/lib/troncal-data";
import type { Viaje } from "@/lib/use-trip-tracking";

export type MetricasViaje = {
  origen: [number, number];
  destino: [number, number];
  actual: [number, number];
  avance: number;
  kmRecorridos: number;
  kmRestantes: number;
  velocidad: number;
  gpsReal: boolean;
  eta: Date | null;
  etaTexto: string;
  tiempoEnRuta: string;
};

function tiempo(ms: number) {
  const min = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(min / 60);
  return h > 0 ? `${h} h ${min % 60} min` : `${min} min`;
}

export function metricasViaje(carga: Carga, viaje: Viaje | null): MetricasViaje {
  const origen = coordDe(carga.origen);
  const destino = coordDe(carga.destino, coordDe(carga.origen));
  const avance = viaje?.avance ?? 0;
  const enRuta = viaje?.estado === "en_ruta";

  const interpolada: [number, number] = [
    origen[0] + (destino[0] - origen[0]) * avance,
    origen[1] + (destino[1] - origen[1]) * avance,
  ];

  const gpsReal = !!viaje?.posicion && !viaje.posicion.simulada && enRuta;
  const actual: [number, number] = gpsReal
    ? [viaje!.posicion!.lat, viaje!.posicion!.lng]
    : interpolada;

  const kmRecorridos = Math.round(carga.km * avance);
  const kmRestantes = Math.max(0, carga.km - kmRecorridos);
  const velocidad = viaje?.velocidad ?? 0;

  let eta: Date | null = null;
  if (enRuta && kmRestantes > 0) {
    const vel = velocidad > 5 ? velocidad : 75;
    eta = new Date(Date.now() + (kmRestantes / vel) * 3600 * 1000);
  }

  return {
    origen,
    destino,
    actual,
    avance,
    kmRecorridos,
    kmRestantes,
    velocidad,
    gpsReal,
    eta,
    etaTexto: eta
      ? eta.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })
      : "—",
    tiempoEnRuta: viaje?.inicio ? tiempo((viaje.fin ?? Date.now()) - viaje.inicio) : "—",
  };
}
