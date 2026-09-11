// Tema visual compartido por los mapas de rastreo en vivo (LiveMap y
// AvailabilityMap): mapa oscuro + pulso verde para señalar una posición GPS
// que se está transmitiendo en este momento.

// Esri "Dark Gray Canvas" — gratuito, sin API key, apto para producción.
// (El basemap oscuro gratuito de CARTO ahora exige una API key y muestra un
// watermark "API KEY REQUIRED" sin ella, por eso se reemplazó.)
export const DARK_TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}";
export const DARK_LABELS_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}";
export const DARK_TILE_MAX_ZOOM = 16;
export const DARK_TILE_ATTRIBUTION = "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ";

let estilosInyectados = false;

/** Inyecta una sola vez el CSS del pulso verde usado por los marcadores en vivo. */
export function inyectarEstilosPulso() {
  if (estilosInyectados || typeof document === "undefined") return;
  estilosInyectados = true;
  const hoja = document.createElement("style");
  hoja.setAttribute("data-troncaltrack-map-theme", "true");
  hoja.textContent = `
@keyframes ttPulsoVerde {
  0% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.65); }
  70% { box-shadow: 0 0 0 14px rgba(22, 163, 74, 0); }
  100% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); }
}
.tt-pulso-verde { animation: ttPulsoVerde 2s infinite; }
`;
  document.head.appendChild(hoja);
}
