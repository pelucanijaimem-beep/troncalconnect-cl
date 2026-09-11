// Tema visual compartido por los mapas de rastreo en vivo (LiveMap y
// AvailabilityMap): mapa oscuro + pulso verde para señalar una posición GPS
// que se está transmitiendo en este momento.

export const DARK_TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
export const DARK_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

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
