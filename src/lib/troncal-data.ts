export type Carroceria =
  | "Rampla Plana"
  | "Tolva"
  | "Furgón"
  | "Thermo / Frigo"
  | "Sider"
  | "Cama Baja";

export const CARROCERIAS: Carroceria[] = [
  "Rampla Plana",
  "Tolva",
  "Furgón",
  "Thermo / Frigo",
  "Sider",
  "Cama Baja",
];

export type PaisCodigo = "CL" | "AR" | "PE" | "BO" | "INT";

export type Pais = {
  codigo: PaisCodigo;
  nombre: string;
  bandera: string;
  moneda: string;
  simbolo: string;
  locale: string;
  ciudades: string[];
};

export const PAISES: Pais[] = [
  {
    codigo: "CL",
    nombre: "Chile",
    bandera: "🇨🇱",
    moneda: "CLP",
    simbolo: "$",
    locale: "es-CL",
    ciudades: [
      "Los Ángeles",
      "Angol",
      "Concepción",
      "Chillán",
      "Temuco",
      "Santiago",
      "Valparaíso",
      "Puerto Montt",
      "Antofagasta",
    ],
  },
  {
    codigo: "AR",
    nombre: "Argentina",
    bandera: "🇦🇷",
    moneda: "ARS",
    simbolo: "$",
    locale: "es-AR",
    ciudades: [
      "Buenos Aires",
      "Rosario",
      "Córdoba",
      "Mendoza",
      "Neuquén",
      "Bahía Blanca",
      "Tucumán",
      "Salta",
    ],
  },
  {
    codigo: "PE",
    nombre: "Perú",
    bandera: "🇵🇪",
    moneda: "PEN",
    simbolo: "S/",
    locale: "es-PE",
    ciudades: ["Lima", "Callao", "Arequipa", "Trujillo", "Chiclayo", "Cusco", "Piura", "Tacna"],
  },
  {
    codigo: "BO",
    nombre: "Bolivia",
    bandera: "🇧🇴",
    moneda: "BOB",
    simbolo: "Bs",
    locale: "es-BO",
    ciudades: ["La Paz", "Santa Cruz", "Cochabamba", "Oruro", "Sucre", "Potosí", "Tarija"],
  },
  {
    codigo: "INT",
    nombre: "Internacional / Transfronterizo",
    bandera: "🌎",
    moneda: "USD",
    simbolo: "US$",
    locale: "es-419",
    ciudades: [
      "Santiago",
      "Mendoza",
      "Buenos Aires",
      "Arica",
      "Tacna",
      "La Paz",
      "Iquique",
      "Santa Cruz",
    ],
  },
];

export const getPais = (codigo: PaisCodigo): Pais =>
  PAISES.find((p) => p.codigo === codigo) ?? PAISES[0]!;

/** Formatea un monto en la moneda del país seleccionado. */
export const money = (valor: number, codigo: PaisCodigo = "CL") => {
  const p = getPais(codigo);
  const decimales = p.moneda === "CLP" ? 0 : 2;
  return (
    p.simbolo +
    " " +
    Number(valor).toLocaleString(p.locale, {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
    })
  );
};

/** Compatibilidad: formato pesos chilenos. */
export const clp = (valor: number) => money(valor, "CL");

export type Carga = {
  id: string;
  pais: PaisCodigo;
  origen: string;
  destino: string;
  km: number;
  valorKm: number;
  carroceria: Carroceria;
  toneladas: number;
  empresa: string;
  verificada: boolean;
  fecha: string;
  detalle: string;
  telefono: string;
  /** Solo transportistas con sello TroncalCheck pueden tomar esta carga. */
  soloVerificados?: boolean;
  /** Condición de pago informada por el generador de carga. */
  diasPago?: string;
};

export type Camion = {
  id: string;
  pais: PaisCodigo;
  conductor: string;
  origen: string;
  destino: string;
  carroceria: Carroceria;
  toneladas: number;
  fecha: string;
  verificado: boolean;
  telefono: string;
  detalle: string;
  /** "buscando" (buscando carga) o "en_ruta". */
  estado?: "buscando" | "en_ruta";
};

export const CARGAS: Carga[] = [
  {
    id: "c1",
    pais: "CL",
    origen: "Los Ángeles",
    destino: "Santiago",
    km: 510,
    valorKm: 1200,
    carroceria: "Rampla Plana",
    toneladas: 28,
    empresa: "Forestal Biobío SpA",
    verificada: true,
    fecha: "2026-08-25",
    detalle: "Carga de madera aserrada, paletizada. Carga y descarga con grúa horquilla.",
    telefono: "+56 9 8123 4567",
  },
  {
    id: "c2",
    pais: "CL",
    origen: "Angol",
    destino: "Concepción",
    km: 152,
    valorKm: 1450,
    carroceria: "Tolva",
    toneladas: 30,
    empresa: "Áridos del Sur Ltda.",
    verificada: true,
    fecha: "2026-08-24",
    detalle: "Traslado de áridos a obra vial. Se requiere licencia de conducir A5 vigente.",
    telefono: "+56 9 7411 2298",
  },
  {
    id: "c3",
    pais: "CL",
    origen: "Temuco",
    destino: "Puerto Montt",
    km: 340,
    valorKm: 1350,
    carroceria: "Thermo / Frigo",
    toneladas: 12,
    empresa: "Lácteos Araucanía",
    verificada: true,
    fecha: "2026-08-26",
    detalle: "Producto refrigerado a 4°C. Registro de temperatura obligatorio.",
    telefono: "+56 9 6522 0091",
  },
  {
    id: "c4",
    pais: "CL",
    origen: "Santiago",
    destino: "Los Ángeles",
    km: 510,
    valorKm: 980,
    carroceria: "Furgón",
    toneladas: 15,
    empresa: "Distribuidora Central",
    verificada: false,
    fecha: "2026-08-25",
    detalle: "Retorno con mercadería general para supermercados de la zona.",
    telefono: "+56 9 3390 7745",
  },
  {
    id: "c5",
    pais: "CL",
    origen: "Chillán",
    destino: "Valparaíso",
    km: 520,
    valorKm: 1100,
    carroceria: "Sider",
    toneladas: 24,
    empresa: "Agroexport Ñuble",
    verificada: true,
    fecha: "2026-08-27",
    detalle: "Carga paletizada para puerto. Ventana de entrega 08:00 a 14:00 hrs.",
    telefono: "+56 9 5544 1120",
  },
  {
    id: "c6",
    pais: "CL",
    origen: "Los Ángeles",
    destino: "Angol",
    km: 62,
    valorKm: 1800,
    carroceria: "Cama Baja",
    toneladas: 35,
    empresa: "Maquinarias Malleco",
    verificada: true,
    fecha: "2026-08-24",
    detalle: "Traslado de retroexcavadora entre faenas. Escolta incluida por la empresa.",
    telefono: "+56 9 9087 3312",
  },
  {
    id: "a1",
    pais: "AR",
    origen: "Buenos Aires",
    destino: "Rosario",
    km: 300,
    valorKm: 950,
    carroceria: "Sider",
    toneladas: 26,
    empresa: "Logística Pampa SRL",
    verificada: true,
    fecha: "2026-08-25",
    detalle: "Mercadería paletizada para centro de distribución. Descarga con autoelevador.",
    telefono: "+54 9 11 5566 7788",
  },
  {
    id: "a2",
    pais: "AR",
    origen: "Mendoza",
    destino: "Córdoba",
    km: 620,
    valorKm: 870,
    carroceria: "Thermo / Frigo",
    toneladas: 18,
    empresa: "Frigorífico Cuyo SA",
    verificada: true,
    fecha: "2026-08-26",
    detalle: "Cadena de frío a 2°C. Precintos y registro de temperatura obligatorios.",
    telefono: "+54 9 261 445 3321",
  },
  {
    id: "p1",
    pais: "PE",
    origen: "Lima",
    destino: "Trujillo",
    km: 560,
    valorKm: 5.8,
    carroceria: "Furgón",
    toneladas: 16,
    empresa: "Andina Distribución EIRL",
    verificada: true,
    fecha: "2026-08-25",
    detalle: "Carga seca para tiendas. Descarga manual en almacén central.",
    telefono: "+51 987 654 321",
  },
  {
    id: "p2",
    pais: "PE",
    origen: "Arequipa",
    destino: "Tacna",
    km: 370,
    valorKm: 6.4,
    carroceria: "Tolva",
    toneladas: 30,
    empresa: "Minera del Sur SAC",
    verificada: true,
    fecha: "2026-08-27",
    detalle: "Traslado de mineral. Requiere licencia A-IIIB y equipo de protección.",
    telefono: "+51 954 220 118",
  },
  {
    id: "b1",
    pais: "BO",
    origen: "Santa Cruz",
    destino: "Cochabamba",
    km: 470,
    valorKm: 11.5,
    carroceria: "Rampla Plana",
    toneladas: 27,
    empresa: "Transportes Oriente Ltda.",
    verificada: false,
    fecha: "2026-08-26",
    detalle: "Carga de estructuras metálicas. Amarre y carpas por cuenta del transportista.",
    telefono: "+591 7 123 4567",
  },
  {
    id: "b2",
    pais: "BO",
    origen: "La Paz",
    destino: "Oruro",
    km: 230,
    valorKm: 13.2,
    carroceria: "Furgón",
    toneladas: 12,
    empresa: "Comercial Altiplano",
    verificada: true,
    fecha: "2026-08-24",
    detalle: "Mercadería general paletizada. Entrega en horario de mañana.",
    telefono: "+591 6 998 2231",
  },
  {
    id: "i1",
    pais: "INT",
    origen: "Santiago",
    destino: "Mendoza",
    km: 360,
    valorKm: 2.1,
    carroceria: "Sider",
    toneladas: 24,
    empresa: "Andes Cross Border Cargo",
    verificada: true,
    fecha: "2026-08-28",
    detalle:
      "Cruce Paso Los Libertadores. Documentación MIC/DTA y seguro internacional al día.",
    telefono: "+56 9 4455 1177",
  },
  {
    id: "i2",
    pais: "INT",
    origen: "Arica",
    destino: "La Paz",
    km: 505,
    valorKm: 2.4,
    carroceria: "Rampla Plana",
    toneladas: 28,
    empresa: "Pacífico Andino Freight",
    verificada: true,
    fecha: "2026-08-29",
    detalle: "Carga de proyecto vía Tambo Quemado. Aduana coordinada por el cargador.",
    telefono: "+591 7 445 9900",
  },
];

export const CAMIONES: Camion[] = [
  {
    id: "t1",
    pais: "CL",
    conductor: "Juan Pérez",
    origen: "Los Ángeles",
    destino: "Santiago",
    carroceria: "Thermo / Frigo",
    toneladas: 10,
    fecha: "2026-08-25",
    verificado: true,
    telefono: "+56 9 8811 2233",
    detalle: "Camión 3/4 thermo, disponible con retorno flexible.",
  },
  {
    id: "t2",
    pais: "CL",
    conductor: "Transportes Cordillera",
    origen: "Concepción",
    destino: "Temuco",
    carroceria: "Rampla Plana",
    toneladas: 28,
    fecha: "2026-08-26",
    verificado: true,
    telefono: "+56 9 7722 4410",
    detalle: "Tracto con rampla plana, disponible todo el mes.",
  },
  {
    id: "t3",
    pais: "CL",
    conductor: "Marcela Soto",
    origen: "Angol",
    destino: "Valparaíso",
    carroceria: "Furgón",
    toneladas: 14,
    fecha: "2026-08-27",
    verificado: false,
    telefono: "+56 9 6633 8890",
    detalle: "Furgón cerrado, ideal para carga seca y paletizada.",
  },
  {
    id: "t4",
    pais: "AR",
    conductor: "Transportes del Litoral",
    origen: "Rosario",
    destino: "Buenos Aires",
    carroceria: "Sider",
    toneladas: 26,
    fecha: "2026-08-25",
    verificado: true,
    telefono: "+54 9 341 220 7788",
    detalle: "Semirremolque sider con lonas nuevas y seguimiento satelital.",
  },
  {
    id: "t5",
    pais: "PE",
    conductor: "Carlos Quispe",
    origen: "Lima",
    destino: "Arequipa",
    carroceria: "Furgón",
    toneladas: 15,
    fecha: "2026-08-26",
    verificado: true,
    telefono: "+51 921 334 556",
    detalle: "Furgón cerrado con GPS, disponible para carga seca.",
  },
  {
    id: "t6",
    pais: "BO",
    conductor: "Transportes Illimani",
    origen: "La Paz",
    destino: "Santa Cruz",
    carroceria: "Tolva",
    toneladas: 30,
    fecha: "2026-08-27",
    verificado: false,
    telefono: "+591 7 660 1122",
    detalle: "Tolva de 30 toneladas disponible para rutas nacionales.",
  },
  {
    id: "t7",
    pais: "INT",
    conductor: "Andes Cross Transport",
    origen: "Mendoza",
    destino: "Santiago",
    carroceria: "Cama Baja",
    toneladas: 35,
    fecha: "2026-08-28",
    verificado: true,
    telefono: "+54 9 261 778 9900",
    detalle: "Cama baja habilitada para cruce internacional, documentación vigente.",
  },
];

/** Coordenadas aproximadas de las ciudades soportadas (lat, lng). */
export const COORDENADAS: Record<string, [number, number]> = {
  "Los Ángeles": [-37.4697, -72.3536],
  Angol: [-37.7959, -72.7169],
  Concepción: [-36.8201, -73.0444],
  Chillán: [-36.6066, -72.1034],
  Temuco: [-38.7359, -72.5904],
  Santiago: [-33.4489, -70.6693],
  Valparaíso: [-33.0472, -71.6127],
  "Puerto Montt": [-41.4693, -72.9424],
  Antofagasta: [-23.6509, -70.3975],
  "Buenos Aires": [-34.6037, -58.3816],
  Rosario: [-32.9442, -60.6505],
  Córdoba: [-31.4201, -64.1888],
  Mendoza: [-32.8895, -68.8458],
  Neuquén: [-38.9516, -68.0591],
  "Bahía Blanca": [-38.7183, -62.2661],
  Tucumán: [-26.8083, -65.2176],
  Salta: [-24.7821, -65.4232],
  Lima: [-12.0464, -77.0428],
  Callao: [-12.0508, -77.1256],
  Arequipa: [-16.409, -71.5375],
  Trujillo: [-8.109, -79.0215],
  Chiclayo: [-6.7714, -79.8409],
  Cusco: [-13.5319, -71.9675],
  Piura: [-5.1945, -80.6328],
  Tacna: [-18.0146, -70.2536],
  "La Paz": [-16.4897, -68.1193],
  "Santa Cruz": [-17.7833, -63.1821],
  Cochabamba: [-17.3895, -66.1568],
  Oruro: [-17.9833, -67.15],
  Sucre: [-19.0333, -65.2627],
  Potosí: [-19.5836, -65.7531],
  Tarija: [-21.5355, -64.7296],
};

export function coordDe(ciudad: string, fallback: [number, number] = [-33.4489, -70.6693]) {
  return COORDENADAS[ciudad] ?? fallback;
}

/* ─── Transparencia financiera ─────────────────────────────────────────── */

export const DIAS_PAGO = [
  "Pago inmediato",
  "Contra entrega",
  "Pago a 15 días",
  "Pago a 30 días",
  "Pago a 60 días",
] as const;

export type DiasPago = (typeof DIAS_PAGO)[number];

/** Precio referencial del litro de diésel en la moneda local de cada país. */
export const PRECIO_DIESEL: Record<PaisCodigo, number> = {
  CL: 1050,
  AR: 1250,
  PE: 16.5,
  BO: 3.72,
  INT: 1.2,
};

/** Rendimiento promedio de un camión cargado (km por litro). */
export const RENDIMIENTO_KM_L = 2.5;

export function costoCombustible(km: number, pais: PaisCodigo, rendimiento = RENDIMIENTO_KM_L) {
  const precioLitro = PRECIO_DIESEL[pais] ?? PRECIO_DIESEL.CL;
  const litros = rendimiento > 0 ? km / rendimiento : 0;
  return { litros, precioLitro, costo: litros * precioLitro };
}

/** Estado de disponibilidad publicado por el transportista. */
export type EstadoCamion = "buscando" | "en_ruta";

export const ESTADOS_CAMION: { valor: EstadoCamion; etiqueta: string }[] = [
  { valor: "buscando", etiqueta: "Buscando carga" },
  { valor: "en_ruta", etiqueta: "En ruta" },
];
