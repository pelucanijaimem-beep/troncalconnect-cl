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

export type Carga = {
  id: string;
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
};

export type Camion = {
  id: string;
  conductor: string;
  origen: string;
  destino: string;
  carroceria: Carroceria;
  toneladas: number;
  fecha: string;
  verificado: boolean;
  telefono: string;
  detalle: string;
};

export const clp = (valor: number) =>
  "$" + Math.round(valor).toLocaleString("es-CL", { maximumFractionDigits: 0 });

export const CARGAS: Carga[] = [
  {
    id: "c1",
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
    origen: "Angol",
    destino: "Concepción",
    km: 152,
    valorKm: 1450,
    carroceria: "Tolva",
    toneladas: 30,
    empresa: "Áridos del Sur Ltda.",
    verificada: true,
    fecha: "2026-08-24",
    detalle: "Traslado de áridos a obra vial. Se requiere carnet de conducir A5 vigente.",
    telefono: "+56 9 7411 2298",
  },
  {
    id: "c3",
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
];

export const CAMIONES: Camion[] = [
  {
    id: "t1",
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
];
