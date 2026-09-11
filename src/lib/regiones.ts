/**
 * Mapa de ciudades a su región administrativa, usado por los filtros
 * avanzados del tablero de cargas.
 */
export const REGION_POR_CIUDAD: Record<string, string> = {
  // Chile
  "Los Ángeles": "Región del Biobío",
  Angol: "Región de La Araucanía",
  Concepción: "Región del Biobío",
  Chillán: "Región de Ñuble",
  Temuco: "Región de La Araucanía",
  Santiago: "Región Metropolitana",
  Valparaíso: "Región de Valparaíso",
  "Puerto Montt": "Región de Los Lagos",
  Antofagasta: "Región de Antofagasta",
  Arica: "Región de Arica y Parinacota",
  Iquique: "Región de Tarapacá",
  // Argentina
  "Buenos Aires": "Provincia de Buenos Aires",
  Rosario: "Provincia de Santa Fe",
  Córdoba: "Provincia de Córdoba",
  Mendoza: "Provincia de Mendoza",
  Neuquén: "Provincia de Neuquén",
  "Bahía Blanca": "Provincia de Buenos Aires",
  Tucumán: "Provincia de Tucumán",
  Salta: "Provincia de Salta",
  // Perú
  Lima: "Departamento de Lima",
  Callao: "Provincia Constitucional del Callao",
  Arequipa: "Departamento de Arequipa",
  Trujillo: "Departamento de La Libertad",
  Chiclayo: "Departamento de Lambayeque",
  Cusco: "Departamento de Cusco",
  Piura: "Departamento de Piura",
  Tacna: "Departamento de Tacna",
  // Bolivia
  "La Paz": "Departamento de La Paz",
  "Santa Cruz": "Departamento de Santa Cruz",
  Cochabamba: "Departamento de Cochabamba",
  Oruro: "Departamento de Oruro",
  Sucre: "Departamento de Chuquisaca",
  Potosí: "Departamento de Potosí",
  Tarija: "Departamento de Tarija",
};

/** Devuelve la región de una ciudad (o cadena vacía si no está mapeada). */
export function regionDe(ciudad: string): string {
  return REGION_POR_CIUDAD[ciudad.trim()] ?? "";
}

/** Regiones disponibles para una lista de ciudades, sin repetir y ordenadas. */
export function regionesDe(ciudades: string[]): string[] {
  const set = new Set<string>();
  for (const c of ciudades) {
    const r = regionDe(c);
    if (r) set.add(r);
  }
  return [...set].sort((a, b) => a.localeCompare(b, "es"));
}

/** true si la ciudad pertenece a la región indicada ("todas" acepta cualquiera). */
export function enRegion(ciudad: string, region: string): boolean {
  if (!region || region === "todas") return true;
  return regionDe(ciudad) === region;
}

/** Compara dos ciudades ignorando mayúsculas y espacios. */
export function mismaCiudad(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
