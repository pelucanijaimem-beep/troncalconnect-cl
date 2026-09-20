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

function icono() {
  return L.divIcon({
    className: "tt-pulso-verde",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:9999px;background:#16A34A;border:3px solid #0f172a;color:#fff">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
  </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

/** Mapa simple con la ubicación aproximada que el transportista está compartiendo. */
export default function SharedLocationMap({ lat, lng }: { lat: number; lng: number }) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<L.Map | null>(null);
  const marcador = useRef<L.Marker | null>(null);

  useEffect(() => {
    inyectarEstilosPulso();
    if (!contenedor.current || mapa.current) return;
    const m = L.map(contenedor.current, { zoomControl: true, attributionControl: true }).setView(
      [lat, lng],
      12,
    );
    L.tileLayer(DARK_TILE_URL, {
      attribution: DARK_TILE_ATTRIBUTION,
      maxZoom: DARK_TILE_MAX_ZOOM,
    }).addTo(m);
    L.tileLayer(DARK_LABELS_URL, { maxZoom: DARK_TILE_MAX_ZOOM }).addTo(m);
    marcador.current = L.marker([lat, lng], { icon: icono() }).addTo(m);
    mapa.current = m;
    return () => {
      m.remove();
      mapa.current = null;
      marcador.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapa.current || !marcador.current) return;
    marcador.current.setLatLng([lat, lng]);
    mapa.current.panTo([lat, lng]);
  }, [lat, lng]);

  return (
    <div
      ref={contenedor}
      className="h-56 w-full overflow-hidden rounded-xl"
      aria-label="Ubicación compartida por el transportista"
    />
  );
}
