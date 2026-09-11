import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { CamionDisponible } from "@/lib/use-disponibilidad";
import { getVerificacionDe, useVerificaciones } from "@/lib/use-verificacion";
import {
  DARK_LABELS_URL,
  DARK_TILE_ATTRIBUTION,
  DARK_TILE_MAX_ZOOM,
  DARK_TILE_URL,
  inyectarEstilosPulso,
} from "./mapTheme";

const CENTRO_POR_DEFECTO: [number, number] = [-36.826, -73.05];

function iconoCamion(propio: boolean) {
  const borde = propio ? "#FFFFFF" : "#0f172a";
  return L.divIcon({
    className: "tt-pulso-verde",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:9999px;background:#16A34A;border:3px solid ${borde};color:#fff">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

export default function AvailabilityMap({
  camiones,
  miId,
  mostrarDetalle = true,
}: {
  camiones: CamionDisponible[];
  miId?: string;
  /** false para visitantes sin sesión: el tooltip no revela el nombre del conductor ni el sello TroncalCheck. */
  mostrarDetalle?: boolean;
}) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<L.Map | null>(null);
  const marcadores = useRef<Record<string, L.Marker>>({});
  const encuadrado = useRef(false);
  const verificaciones = useVerificaciones();

  useEffect(() => {
    inyectarEstilosPulso();
    if (!contenedor.current || mapa.current) return;
    const m = L.map(contenedor.current, { zoomControl: true }).setView(CENTRO_POR_DEFECTO, 6);
    L.tileLayer(DARK_TILE_URL, {
      attribution: DARK_TILE_ATTRIBUTION,
      maxZoom: DARK_TILE_MAX_ZOOM,
    }).addTo(m);
    L.tileLayer(DARK_LABELS_URL, {
      maxZoom: DARK_TILE_MAX_ZOOM,
    }).addTo(m);
    mapa.current = m;
    return () => {
      m.remove();
      mapa.current = null;
      marcadores.current = {};
      encuadrado.current = false;
    };
  }, []);

  useEffect(() => {
    const m = mapa.current;
    if (!m) return;

    const vivos = new Set(camiones.map((c) => c.id));
    Object.entries(marcadores.current).forEach(([id, marcador]) => {
      if (!vivos.has(id)) {
        marcador.remove();
        delete marcadores.current[id];
      }
    });

    camiones.forEach((c) => {
      const verificado = getVerificacionDe(verificaciones, c.nombre).estado === "verificado";
      let etiqueta: string;
      if (c.id === miId) {
        const insignia = verificado ? " · ✅ TroncalCheck" : "";
        etiqueta = `Tu camión${insignia} · ${c.velocidad} km/h`;
      } else if (mostrarDetalle) {
        const insignia = verificado ? " · ✅ TroncalCheck" : "";
        etiqueta = `${c.nombre}${insignia} · ${c.velocidad} km/h`;
      } else {
        const insignia = verificado ? "Camión verificado ✅" : "Camión disponible";
        etiqueta = `${insignia} · ${c.velocidad} km/h`;
      }
      const existente = marcadores.current[c.id];
      if (existente) {
        existente.setLatLng([c.lat, c.lng]);
        existente.setTooltipContent(etiqueta);
        existente.setIcon(iconoCamion(c.id === miId));
      } else {
        marcadores.current[c.id] = L.marker([c.lat, c.lng], { icon: iconoCamion(c.id === miId) })
          .addTo(m)
          .bindTooltip(etiqueta);
      }
    });

    if (!encuadrado.current && camiones.length > 0) {
      encuadrado.current = true;
      const limites = L.latLngBounds(camiones.map((c) => [c.lat, c.lng] as [number, number]));
      m.fitBounds(limites.pad(0.4), { maxZoom: 13 });
    }
  }, [camiones, miId, verificaciones, mostrarDetalle]);

  return (
    <div ref={contenedor} className="h-full w-full" aria-label="Mapa de camiones disponibles en ruta" />
  );
}
