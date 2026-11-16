export type Corredor = {
  slug: string;
  origen: string;
  destino: string;
  titulo: string;
  descripcion: string;
  kmAprox: number;
  horasAprox: string;
  tramo: string;
  cargasTipicas: string[];
  retorno: string;
};

export const CORREDORES: Corredor[] = [
  {
    slug: "flete-chillan-santiago",
    origen: "Chillán",
    destino: "Santiago",
    titulo: "Flete Chillán – Santiago",
    descripcion:
      "Publica o encuentra fletes entre Chillán y Santiago por Ruta 5 Sur. Distancia, peajes referenciales y cargas de retorno, sin comisión por viaje.",
    kmAprox: 400,
    horasAprox: "5 a 6 horas",
    tramo: "Ruta 5 Sur, pasando por Talca, Curicó y Rancagua.",
    cargasTipicas: ["Fruta y hortalizas de temporada", "Productos agroindustriales", "Insumos y materiales de construcción"],
    retorno: "Santiago concentra carga de retail, abarrotes e insumos hacia el sur, ideal para no volver vacío a Ñuble.",
  },
  {
    slug: "flete-concepcion-santiago",
    origen: "Concepción",
    destino: "Santiago",
    titulo: "Flete Concepción – Santiago",
    descripcion:
      "Fletes entre Concepción y Santiago con transportistas verificados. Distancia, tiempo, peajes referenciales y cargas de retorno, con 0% comisión.",
    kmAprox: 500,
    horasAprox: "6 a 7 horas",
    tramo: "Ruta 152 / autopista del Itata hasta Chillán y luego Ruta 5 Sur.",
    cargasTipicas: ["Carga portuaria y contenedores", "Productos forestales y celulosa", "Carga industrial y general"],
    retorno: "Desde Santiago sale carga de distribución hacia el Biobío y sus puertos durante toda la semana.",
  },
  {
    slug: "flete-los-angeles-puerto-montt",
    origen: "Los Ángeles",
    destino: "Puerto Montt",
    titulo: "Flete Los Ángeles – Puerto Montt",
    descripcion:
      "Fletes entre Los Ángeles y Puerto Montt por Ruta 5 Sur. Distancia, peajes referenciales y cargas de retorno, sin comisión ni subastas.",
    kmAprox: 480,
    horasAprox: "6 a 7 horas",
    tramo: "Ruta 5 Sur, pasando por Temuco y Osorno.",
    cargasTipicas: ["Productos forestales y madera", "Alimento e insumos para la industria salmonera", "Productos agrícolas y lácteos"],
    retorno: "Desde Puerto Montt hay carga refrigerada y de la industria acuícola hacia el norte.",
  },
];

export function corredorPorSlug(slug: string) {
  return CORREDORES.find((c) => c.slug === slug) ?? null;
}
