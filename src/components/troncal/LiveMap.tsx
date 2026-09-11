import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  DARK_LABELS_URL,
  DARK_TILE_ATTRIBUTION,
  DARK_TILE_MAX_ZOOM,
  DARK_TILE_URL,
  inyectarEstilosPulso,
} from "./mapTheme";

function iconoCamion(enVivo: boolean) {
  const fondo = enVivo ? "#16A34A" : "#6B7280";
  return L.divIcon({
    className: enVivo ? "tt-pulso-verde" : "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:9999px;background:${fondo};border:3px solid #0f172a;color:#fff">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
  </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

function punto(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:14px;height:14px;border-radius:9999px;background:${color};border:3px solid #0f172a;box-shadow:0 1px 4px rgba(0,0,0,.5)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export default function LiveMap({
  origen,
  destino,
  actual,
  etiquetaOrigen,
  etiquetaDestino,
  activo,
}: {
  origen: [number, number];
  destino: [number, number];
  actual: [number, number];
  etiquetaOrigen: string;
  etiquetaDestino: string;
  activo: boolean;
}) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<L.Map | null>(null);
  const camion = useRef<L.Marker | null>(null);
  const recorrido = useRef<L.Polyline | null>(null);

  useEffect(() => {
    inyectarEstilosPulso();
    if (!contenedor.current || mapa.current) return;
    const m = L.map(contenedor.current, { zoomControl: true, attributionControl: true });
    L.tileLayer(DARK_TILE_URL, {
      attribution: DARK_TILE_ATTRIBUTION,
      maxZoom: DARK_TILE_MAX_ZOOM,
    }).addTo(m);
    L.tileLayer(DARK_LABELS_URL, {
      maxZoom: DARK_TILE_MAX_ZOOM,
    }).addTo(m);

    L.polyline([origen, destino], {
      color: "#64748B",
      weight: 4,
      dashArray: "8 10",
    }).addTo(m);
    recorrido.current = L.polyline([origen, actual], { color: "#16A34A", weight: 5 }).addTo(m);

    L.marker(origen, { icon: punto("#E2E8F0") }).addTo(m).bindTooltip(etiquetaOrigen);
    L.marker(destino, { icon: punto("#DC2626") }).addTo(m).bindTooltip(etiquetaDestino);
    camion.current = L.marker(actual, { icon: iconoCamion(activo) }).addTo(m);

    m.fitBounds(L.latLngBounds([origen, destino]).pad(0.25));
    mapa.current = m;

    return () => {
      m.remove();
      mapa.current = null;
      camion.current = null;
      recorrido.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!camion.current || !mapa.current) return;
    camion.current.setIcon(iconoCamion(activo));
    if (!activo) {
      camion.current.setOpacity(0.6);
      return;
    }
    camion.current.setOpacity(1);
    camion.current.setLatLng(actual);
    recorrido.current?.setLatLngs([origen, actual]);
  }, [actual, activo, origen]);

  return <div ref={contenedor} className="h-full w-full" aria-label="Mapa de seguimiento en vivo" />;
}
