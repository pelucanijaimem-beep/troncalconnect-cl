import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { avisarDocumentosSubidos } from "@/lib/notificaciones.functions";

export type EstadoVerificacion =
  | "sin_verificar"
  | "en_revision"
  | "verificado"
  | "vencido"
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
  rut_empresa?: string;
  representante_legal?: string;
  carpeta_tributaria?: string;
  vigencia_sociedad?: string;
  chilevalora_peligrosas?: string;
};

/** Tipo de cuenta que determina qué documentos se exigen. */
export type RolVerificacion = "camionero" | "empresa";

/** Estado de revisión de cada documento exigido por TroncalCheck. */
export type EstadoDocumento = "pendiente" | "aprobado" | "rechazado";

export type ItemChecklist = { estado: EstadoDocumento; motivo: string };

export type ClaveDocumento =
  | "soat"
  | "revision_tecnica"
  | "permiso_circulacion"
  | "licencia"
  | "antecedentes"
  | "rut_empresa"
  | "representante_legal"
  | "carpeta_tributaria"
  | "vigencia_sociedad"
  | "chilevalora_peligrosas";

export type Checklist = Record<ClaveDocumento, ItemChecklist>;

export type DefinicionDocumento = {
  clave: ClaveDocumento;
  label: string;
  ayuda: string;
};

/** Documentos exigidos a camioneros y empresas de transporte con flota. */
export const DOCUMENTOS_CAMIONERO: DefinicionDocumento[] = [
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

/** Documentos exigidos a empresas y generadores de carga. */
export const DOCUMENTOS_EMPRESA: DefinicionDocumento[] = [
  {
    clave: "rut_empresa",
    label: "RUT de la empresa (e-RUT)",
    ayuda: "Cédula tributaria electrónica emitida por el Servicio de Impuestos Internos.",
  },
  {
    clave: "representante_legal",
    label: "Cédula de identidad del representante legal",
    ayuda: "Ambos lados, vigente y legible.",
  },
  {
    clave: "carpeta_tributaria",
    label: "Carpeta Tributaria Electrónica",
    ayuda: "Descargada desde el Servicio de Impuestos Internos, con antigüedad máxima de 90 días.",
  },
  {
    clave: "vigencia_sociedad",
    label: "Certificado de vigencia de la sociedad",
    ayuda: "Acredita la existencia de la empresa y la personería del representante legal.",
  },
];

/**
 * Certificado ChileValora de sustancias peligrosas (perfil P-4923-8332-002-V02).
 * Es OPCIONAL: no se exige para el sello de identidad, pero habilita postular
 * a cargas de combustibles / sustancias peligrosas cuando está aprobado y vigente.
 */
export const DOC_CHILEVALORA: DefinicionDocumento = {
  clave: "chilevalora_peligrosas",
  label: "Certificado ChileValora — Conductor(a) de sustancias peligrosas",
  ayuda:
    "Perfil P-4923-8332-002-V02. Indica el número de certificado y su fecha de vigencia, y adjunta la foto o PDF.",
};

/** Unión de ambos listados, usada por el panel de revisión interno. */
export const TODOS_DOCUMENTOS: DefinicionDocumento[] = [
  ...DOCUMENTOS_CAMIONERO,
  ...DOCUMENTOS_EMPRESA,
  DOC_CHILEVALORA,
];

/** Documentos exigidos según el tipo de cuenta. */
export function documentosRequeridos(rol: RolVerificacion): DefinicionDocumento[] {
  return rol === "empresa" ? DOCUMENTOS_EMPRESA : DOCUMENTOS_CAMIONERO;
}

export const CHECKLIST_VACIO: Checklist = TODOS_DOCUMENTOS.reduce((acc, d) => {
  acc[d.clave] = { estado: "pendiente", motivo: "" };
  return acc;
}, {} as Checklist);

export type Verificacion = {
  estado: EstadoVerificacion;
  asegurado: boolean;
  documentos: Documentos;
  checklist: Checklist;
  actualizado: string;
  nota: string;
  revisionEnCurso?: boolean;
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
  if (estado === "vencido") return "vencido";
  if (estado === "rechazado") return "rechazado";
  return "en_revision";
}

/** Normaliza el checklist guardado en la base de datos. */
export function normalizarChecklist(valor: unknown): Checklist {
  const bruto = (valor ?? {}) as Record<string, Partial<ItemChecklist>>;
  const salida = {} as Checklist;
  for (const d of TODOS_DOCUMENTOS) {
    const item = bruto[d.clave];
    const estado = item?.estado;
    salida[d.clave] = {
      estado: estado === "aprobado" || estado === "rechazado" ? estado : "pendiente",
      motivo: item?.motivo ?? "",
    };
  }
  return salida;
}

/**
 * Recarga el estado público del sello de confianza (sin documentos ni notas)
 * y agrega el resumen propio sin rutas de archivo ni enlaces de descarga.
 */
export async function recargarVerificaciones() {
  const { data } = await supabase.rpc("verificaciones_publicas");
  const nuevo: Mapa = {};
  for (const fila of data ?? []) {
    nuevo[claveUsuario(fila.nombre ?? "")] = {
      estado: estadoDesdeDB(fila.estado),
      asegurado: Boolean(fila.asegurado),
      documentos: {},
      checklist: CHECKLIST_VACIO,
      actualizado: fila.updated_at ?? "",
      nota: "",
    };
  }

  const { data: sesion } = await supabase.auth.getUser();
  const userId = sesion.user?.id;
  if (userId) {
    const { data: resumen } = await supabase.rpc("mi_verificacion_resumen");
    const propia = resumen as {
      nombre: string;
      estado: string;
      asegurado: boolean;
      documentos: Partial<Record<keyof Documentos, boolean>>;
      checklist: unknown;
      nota_admin: string;
      updated_at: string;
      revision_en_curso?: boolean;
    } | null;
    if (propia) {
      nuevo[claveUsuario(propia.nombre ?? "")] = {
        estado: estadoDesdeDB(propia.estado),
        asegurado: Boolean(propia.asegurado),
        documentos: Object.fromEntries(
          Object.entries(propia.documentos ?? {}).filter(([, adjunto]) => adjunto).map(([clave]) => [clave, "adjuntado"]),
        ) as Documentos,
        checklist: normalizarChecklist(propia.checklist),
        actualizado: propia.updated_at ?? "",
        nota: propia.nota_admin ?? "",
        revisionEnCurso: Boolean(propia.revision_en_curso),
      };
    }
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
const MAPA_VACIO: Mapa = {};
const getSnapshotServidor = () => MAPA_VACIO;

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
  // Aviso interno al equipo: un solo correo con todos los documentos subidos.
  void avisarDocumentosSubidos({ data: { documentos: Object.keys(documentos) } }).catch(() => {
    /* el aviso no bloquea el envío */
  });
  await recargarVerificaciones();
  return null;
}

export function useVerificaciones() {
  const m = useSyncExternalStore(subscribe, getSnapshot, getSnapshotServidor);
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

/** Resumen de avance del checklist documental según el tipo de cuenta. */
export function avanceChecklist(checklist: Checklist, rol: RolVerificacion = "camionero") {
  const items = documentosRequeridos(rol).map((d) => checklist[d.clave]);
  return {
    aprobados: items.filter((i) => i.estado === "aprobado").length,
    rechazados: items.filter((i) => i.estado === "rechazado").length,
    pendientes: items.filter((i) => i.estado === "pendiente").length,
    total: items.length,
  };
}

// ---------------------------------------------------------------------------
// Certificado ChileValora de sustancias peligrosas e inducción forestal
// ---------------------------------------------------------------------------

export type ChilevaloraResumen = {
  numero: string | null;
  vigencia: string | null;
  estado: EstadoDocumento;
  adjuntado: boolean;
};

export type Insignias = { peligrosas: boolean; forestal: boolean };

/** Sube el certificado ChileValora y deja su revisión en pendiente para el equipo. */
export async function guardarChilevalora(params: {
  userId: string;
  numero: string;
  vigencia: string;
  archivo: File;
}): Promise<string | null> {
  const ext = params.archivo.name.split(".").pop() ?? "dat";
  const ruta = `${params.userId}/chilevalora_peligrosas-${Date.now()}.${ext}`;
  const { error: errorSubida } = await supabase.storage
    .from("documentos")
    .upload(ruta, params.archivo, { upsert: true });
  if (errorSubida) return errorSubida.message;
  const { error } = await supabase.rpc("guardar_chilevalora", {
    p_numero: params.numero.trim(),
    p_vigencia: params.vigencia,
    p_ruta: ruta,
  });
  if (error) return error.message;
  void avisarDocumentosSubidos({ data: { documentos: ["chilevalora_peligrosas"] } }).catch(() => {
    /* el aviso no bloquea el envío */
  });
  await recargarVerificaciones();
  return null;
}

/** Resumen del propio certificado ChileValora (sin rutas de archivo). */
export function useMiChilevalora(activo: boolean): ChilevaloraResumen | null {
  const [resumen, setResumen] = useState<ChilevaloraResumen | null>(null);
  useEffect(() => {
    if (!activo) return;
    let vivo = true;
    void supabase.rpc("mi_chilevalora").then(({ data }) => {
      if (!vivo || !data) return;
      const d = data as ChilevaloraResumen;
      setResumen({
        numero: d.numero ?? null,
        vigencia: d.vigencia ?? null,
        estado:
          d.estado === "aprobado" || d.estado === "rechazado" ? d.estado : "pendiente",
        adjuntado: Boolean(d.adjuntado),
      });
    });
    return () => {
      vivo = false;
    };
  }, [activo]);
  return resumen;
}

/** Insignias públicas de un transportista (solo estados, nunca documentos). */
export function useInsignias(userId: string | undefined | null): Insignias {
  const [insignias, setInsignias] = useState<Insignias>({ peligrosas: false, forestal: false });
  useEffect(() => {
    if (!userId) return;
    let vivo = true;
    void supabase.rpc("insignias_transportista", { p_id: userId }).then(({ data }) => {
      if (!vivo || !data) return;
      const d = data as Insignias;
      setInsignias({ peligrosas: Boolean(d.peligrosas), forestal: Boolean(d.forestal) });
    });
    return () => {
      vivo = false;
    };
  }, [userId]);
  return insignias;
}

/** Declaración simple de inducción forestal (no requiere aprobación). */
export async function guardarInduccionForestal(params: {
  userId: string;
  empresa: string;
  fecha: string;
}): Promise<string | null> {
  const { error } = await supabase
    .from("perfiles")
    .update({
      induccion_forestal: true,
      induccion_forestal_empresa: params.empresa.trim() || null,
      induccion_forestal_fecha: params.fecha || null,
    })
    .eq("id", params.userId);
  return error?.message ?? null;
}
