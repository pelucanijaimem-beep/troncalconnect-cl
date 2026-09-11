import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

export type EstadoVerificacion =
  | "sin_verificar"
  | "en_revision"
  | "verificado"
  | "rechazado";

export type Documentos = {
  identidad?: string;
  licencia?: string;
  padron?: string;
  soat?: string;
  revision_tecnica?: string;
  permiso_circulacion?: string;
  antecedentes?: string;
  poliza?: string;
};

/** Estado de revisión de cada documento exigido por TroncalCheck. */
export type EstadoDocumento = "pendiente" | "aprobado" | "rechazado";

export type ItemChecklist = { estado: EstadoDocumento; motivo: string };

export type ClaveDocumento =
  | "soat"
  | "revision_tecnica"
  | "permiso_circulacion"
  | "licencia"
  | "antecedentes";

export type Checklist = Record<ClaveDocumento, ItemChecklist>;

/** Documentos chilenos exigidos, en el orden en que se revisan. */
export const DOCUMENTOS_REQUERIDOS: {
  clave: ClaveDocumento;
  label: string;
  ayuda: string;
}[] = [
  {
    clave: "soat",
    label: "Seguro Obligatorio de Accidentes (SOAP) vigente",
    ayuda: "Póliza vigente del camión y de la rampla, si corresponde.",
  },
  {
    clave: "revision_tecnica",
    label: "Revisión Técnica al día",
    ayuda: "Certificado vigente emitido por una planta autorizada.",
  },
  {
    clave: "permiso_circulacion",
    label: "Permiso de Circulación",
    ayuda: "Comprobante del período en curso.",
  },
  {
    clave: "licencia",
    label: "Licencia de conducir clase A3 / A4 / A5",
    ayuda: "Ambos lados, vigente y legible.",
  },
  {
    clave: "antecedentes",
    label: "Certificado de Antecedentes",
    ayuda: "Emitido dentro de los últimos 90 días.",
  },
];

export const CHECKLIST_VACIO: Checklist = {
  soat: { estado: "pendiente", motivo: "" },
  revision_tecnica: { estado: "pendiente", motivo: "" },
  permiso_circulacion: { estado: "pendiente", motivo: "" },
  licencia: { estado: "pendiente", motivo: "" },
  antecedentes: { estado: "pendiente", motivo: "" },
};

export type Verificacion = {
  estado: EstadoVerificacion;
  asegurado: boolean;
  documentos: Documentos;
  checklist: Checklist;
  actualizado: string;
  nota: string;
};

export const VERIFICACION_VACIA: Verificacion = {
  estado: "sin_verificar",
  asegurado: false,
  documentos: {},
  checklist: CHECKLIST_VACIO,
  actualizado: "",
  nota: "",
};

type Mapa = Record<string, Verificacion>;

let mapa: Mapa = {};
let cargando = false;
const oyentes = new Set<() => void>();
const emitir = () => oyentes.forEach((f) => f());

export function estadoDesdeDB(estado: string): EstadoVerificacion {
  if (estado === "aprobado") return "verificado";
  if (estado === "rechazado") return "rechazado";
  return "en_revision";
}

/** Normaliza el checklist guardado en la base de datos. */
export function normalizarChecklist(valor: unknown): Checklist {
  const bruto = (valor ?? {}) as Record<string, Partial<ItemChecklist>>;
  const salida = {} as Checklist;
  for (const d of DOCUMENTOS_REQUERIDOS) {
    const item = bruto[d.clave];
    const estado = item?.estado;
    salida[d.clave] = {
      estado: estado === "aprobado" || estado === "rechazado" ? estado : "pendiente",
      motivo: item?.motivo ?? "",
    };
  }
  return salida;
}

/** Recarga todas las verificaciones desde la base de datos. */
export async function recargarVerificaciones() {
  const { data } = await supabase
    .from("verificaciones")
    .select("nombre, estado, asegurado, documentos, checklist, nota_admin, updated_at");
  if (!data) return;
  const nuevo: Mapa = {};
  for (const fila of data) {
    nuevo[claveUsuario(fila.nombre ?? "")] = {
      estado: estadoDesdeDB(fila.estado),
      asegurado: Boolean(fila.asegurado),
      documentos: (fila.documentos ?? {}) as Documentos,
      checklist: normalizarChecklist(fila.checklist),
      actualizado: fila.updated_at ?? "",
      nota: fila.nota_admin ?? "",
    };
  }
  mapa = nuevo;
  emitir();
}

function iniciar() {
  if (cargando || typeof window === "undefined") return;
  cargando = true;
  void recargarVerificaciones();
}

function subscribe(f: () => void) {
  iniciar();
  oyentes.add(f);
  return () => oyentes.delete(f);
}

const getSnapshot = () => mapa;

export function claveUsuario(nombreOEmail: string) {
  return nombreOEmail.trim().toLowerCase();
}

/**
 * Sube los documentos al almacenamiento privado y deja la solicitud
 * en estado "Pendiente de Revisión" para el equipo TroncalCheck.
 */
export async function enviarDocumentos(params: {
  userId: string;
  nombre: string;
  archivos: Partial<Record<keyof Documentos, File>>;
}): Promise<string | null> {
  const documentos: Documentos = {};
  for (const [campo, archivo] of Object.entries(params.archivos)) {
    if (!archivo) continue;
    const ext = archivo.name.split(".").pop() ?? "dat";
    const ruta = `${params.userId}/${campo}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("documentos")
      .upload(ruta, archivo, { upsert: true });
    if (error) return error.message;
    documentos[campo as keyof Documentos] = ruta;
  }

  const { error } = await supabase.from("verificaciones").upsert(
    {
      user_id: params.userId,
      nombre: params.nombre,
      estado: "pendiente",
      asegurado: Boolean(documentos.poliza),
      documentos,
      nota_admin: "",
    },
    { onConflict: "user_id" },
  );
  if (error) return error.message;
  await recargarVerificaciones();
  return null;
}

export function useVerificaciones() {
  const m = useSyncExternalStore(subscribe, getSnapshot, () => ({}) as Mapa);
  useEffect(() => {
    void recargarVerificaciones();
  }, []);
  return m;
}

export function useVerificacion(clave: string | undefined | null): Verificacion {
  const m = useVerificaciones();
  if (!clave) return VERIFICACION_VACIA;
  return m[claveUsuario(clave)] ?? VERIFICACION_VACIA;
}

/** Lee una verificación desde un mapa ya obtenido con useVerificaciones(). */
export function getVerificacionDe(
  mapa: Record<string, Verificacion>,
  clave: string | undefined | null,
): Verificacion {
  if (!clave) return VERIFICACION_VACIA;
  return mapa[claveUsuario(clave)] ?? VERIFICACION_VACIA;
}

/** Resumen de avance del checklist documental. */
export function avanceChecklist(checklist: Checklist) {
  const items = DOCUMENTOS_REQUERIDOS.map((d) => checklist[d.clave]);
  return {
    aprobados: items.filter((i) => i.estado === "aprobado").length,
    rechazados: items.filter((i) => i.estado === "rechazado").length,
    pendientes: items.filter((i) => i.estado === "pendiente").length,
    total: items.length,
  };
}
