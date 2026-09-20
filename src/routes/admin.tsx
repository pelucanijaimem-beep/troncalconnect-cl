import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Ban,
  Check,
  FileText,
  Loader2,
  PackageX,
  ShieldCheck,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { cerrarSesion, useSesion } from "@/lib/use-session";
import { useEsAdmin } from "@/lib/use-admin";
import { Header } from "@/components/troncal/Header";
import {
  TODOS_DOCUMENTOS,
  normalizarChecklist,
  type ClaveDocumento,
} from "@/lib/use-verificacion";


export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Panel de Administración — TroncalTrack" },
      {
        name: "description",
        content:
          "Panel privado de TroncalTrack para revisar solicitudes de verificación, administrar usuarios y moderar las cargas publicadas.",
      },
      { property: "og:title", content: "Panel de Administración — TroncalTrack" },
      {
        property: "og:description",
        content:
          "Gestión interna de verificaciones TroncalCheck, usuarios y cargas de la plataforma.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Solicitud = {
  id: string;
  user_id: string;
  nombre: string;
  estado: string;
  asegurado: boolean;
  documentos: Record<string, string>;
  checklist: unknown;
  nota_admin: string;
  updated_at: string;
};


type Perfil = {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  rol: string;
  plan_activo: boolean;
  bloqueado: boolean;
  verificado: boolean;
};

type CargaFila = {
  id: string;
  titulo: string;
  origen: string;
  destino: string;
  empresa: string;
  precio: number;
  created_at: string;
};

type Reporte = {
  id: string;
  tipo: string;
  carga_id: string | null;
  reportado_id: string | null;
  reportado_nombre: string;
  motivo: string;
  detalle: string;
  estado: string;
  created_at: string;
};

type SolicitudEliminacion = {
  id: string;
  email: string;
  motivo: string;
  origen: string;
  estado: string;
  created_at: string;
};

type Metricas = {
  cargas_publicadas: number;
  cargas_activas: number;
  cargas_cerradas: number;
  cargas_ultimos_30: number;
  postulaciones: number;
  postulaciones_ultimos_30: number;
  usuarios: number;
  usuarios_bloqueados: number;
  reportes_pendientes: number;
  solicitudes_eliminacion: number;
};

const ETIQUETA_ESTADO: Record<string, string> = {
  pendiente: "Pendiente de Revisión",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
};

function Seccion({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-extrabold tracking-tight text-foreground">{titulo}</h2>
      <p className="mb-4 text-sm text-muted-foreground">{descripcion}</p>
      {children}
    </section>
  );
}

function AdminPage() {
  const sesion = useSesion();
  const { esAdmin, cargando } = useEsAdmin(sesion?.id);

  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [cargas, setCargas] = useState<CargaFila[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [notas, setNotas] = useState<Record<string, string>>({});
  const [trabajando, setTrabajando] = useState(false);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [eliminaciones, setEliminaciones] = useState<SolicitudEliminacion[]>([]);
  const [metricas, setMetricas] = useState<Metricas | null>(null);

  const recargar = useCallback(async () => {
    const [s, p, c, r, e, m] = await Promise.all([
      supabase
        .from("verificaciones")
        .select(
          "id, user_id, nombre, estado, asegurado, documentos, checklist, nota_admin, updated_at",
        )

        .order("updated_at", { ascending: false }),
      supabase.rpc("perfiles_admin"),
      supabase
        .from("cargas")
        .select("id, titulo, origen, destino, empresa, precio, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("reportes")
        .select(
          "id, tipo, carga_id, reportado_id, reportado_nombre, motivo, detalle, estado, created_at",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("solicitudes_eliminacion")
        .select("id, email, motivo, origen, estado, created_at")
        .order("created_at", { ascending: false }),
      supabase.rpc("metricas_marketplace"),
    ]);
    setSolicitudes((s.data ?? []) as Solicitud[]);
    setPerfiles((p.data ?? []) as Perfil[]);
    setCargas((c.data ?? []) as CargaFila[]);
    setReportes((r.data ?? []) as Reporte[]);
    setEliminaciones((e.data ?? []) as SolicitudEliminacion[]);
    setMetricas((m.data ?? null) as Metricas | null);
  }, []);

  const resolverReporte = async (r: Reporte, estado: "revisado" | "descartado") => {
    const { error } = await supabase.from("reportes").update({ estado }).eq("id", r.id);
    if (error) {
      toast.error("No se pudo actualizar el reporte", { description: error.message });
      return;
    }
    toast.success(estado === "revisado" ? "Reporte marcado como revisado" : "Reporte descartado");
    await recargar();
  };

  const bloquearReportado = async (r: Reporte) => {
    if (!r.reportado_id) {
      toast.error("Este reporte no identifica a un usuario registrado.");
      return;
    }
    const { error } = await supabase
      .from("perfiles")
      .update({ bloqueado: true })
      .eq("id", r.reportado_id);
    if (error) {
      toast.error("No se pudo suspender al usuario", { description: error.message });
      return;
    }
    await supabase.from("reportes").update({ estado: "revisado" }).eq("id", r.id);
    toast.success("Usuario suspendido");
    await recargar();
  };

  const marcarEliminacion = async (s: SolicitudEliminacion, estado: string) => {
    const { error } = await supabase
      .from("solicitudes_eliminacion")
      .update({ estado })
      .eq("id", s.id);
    if (error) {
      toast.error("No se pudo actualizar la solicitud", { description: error.message });
      return;
    }
    toast.success("Solicitud actualizada");
    await recargar();
  };

  useEffect(() => {
    if (esAdmin) void recargar();
  }, [esAdmin, recargar]);

  const marcarDocumento = async (
    s: Solicitud,
    clave: ClaveDocumento,
    estado: "aprobado" | "rechazado" | "pendiente",
  ) => {
    const actual = normalizarChecklist(s.checklist);
    const motivo = estado === "rechazado" ? (notas[s.id] ?? "") : "";
    const nuevo = { ...actual, [clave]: { estado, motivo } };
    const { error } = await supabase
      .from("verificaciones")
      .update({ checklist: nuevo })
      .eq("id", s.id);
    if (error) {
      toast.error("No se pudo actualizar el documento", { description: error.message });
      return;
    }
    await recargar();
  };

  const resolver = async (s: Solicitud, aprobar: boolean) => {
    setTrabajando(true);

    const nota = notas[s.id] ?? "";
    const { error } = await supabase
      .from("verificaciones")
      .update({
        estado: aprobar ? "aprobado" : "rechazado",
        nota_admin: aprobar ? "" : nota,
      })
      .eq("id", s.id);
    if (!error) {
      await supabase
        .from("perfiles")
        .update({ verificado: aprobar })
        .eq("id", s.user_id);
    }
    setTrabajando(false);
    if (error) {
      toast.error("No se pudo actualizar la solicitud", { description: error.message });
      return;
    }
    toast.success(
      aprobar ? `${s.nombre} fue verificado` : `Solicitud de ${s.nombre} rechazada`,
      {
        description: aprobar
          ? "El sello TroncalCheck ya aparece en su perfil."
          : "El usuario verá el motivo del rechazo en su panel.",
      },
    );
    await recargar();
  };

  const cambiarBloqueo = async (p: Perfil) => {
    const { error } = await supabase
      .from("perfiles")
      .update({ bloqueado: !p.bloqueado })
      .eq("id", p.id);
    if (error) {
      toast.error("No se pudo actualizar el usuario", { description: error.message });
      return;
    }
    toast.success(p.bloqueado ? "Usuario reactivado" : "Usuario suspendido");
    await recargar();
  };

  const eliminarCarga = async (c: CargaFila) => {
    const { error } = await supabase.from("cargas").delete().eq("id", c.id);
    if (error) {
      toast.error("No se pudo eliminar la carga", { description: error.message });
      return;
    }
    toast.success("Carga eliminada del tablero");
    await recargar();
  };

  const verDocumento = async (ruta: string) => {
    const { data, error } = await supabase.storage
      .from("documentos")
      .createSignedUrl(ruta, 300);
    if (error || !data) {
      toast.error("No se pudo abrir el documento");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Verificando permisos…
      </div>
    );
  }

  if (!sesion || !esAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <ShieldCheck className="h-10 w-10 text-primary" />
        <h1 className="text-2xl font-extrabold tracking-tight">Acceso restringido</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Esta sección es exclusiva del equipo administrador de TroncalTrack. Inicia sesión con una
          cuenta autorizada para continuar.
        </p>
        <Button asChild>
          <Link to="/">Volver al inicio</Link>
        </Button>
        <Toaster />
      </div>
    );
  }

  const pendientes = solicitudes.filter((s) => s.estado === "pendiente");
  const resueltas = solicitudes.filter((s) => s.estado !== "pendiente");
  const perfilesFiltrados = perfiles.filter((p) =>
    `${p.nombre} ${p.email}`.toLowerCase().includes(busqueda.trim().toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background">
      <Header
        sesion={sesion}
        onSalir={() => void cerrarSesion()}
        rol="empresa"
        onRolChange={() => undefined}
        onAuth={() => undefined}
        onPublicarCamion={() => undefined}
        onPublicarCarga={() => undefined}
      />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Panel de Administración
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Revisión documental TroncalCheck, gestión de usuarios y moderación de cargas.
          </p>
        </header>

        <Seccion
          titulo={`Solicitudes de Verificación (${pendientes.length} pendientes)`}
          descripcion="Revisa los documentos adjuntos y aprueba o rechaza la solicitud."
        >
          {pendientes.length === 0 && (
            <p className="text-sm text-muted-foreground">No hay solicitudes pendientes.</p>
          )}
          <div className="space-y-4">
            {pendientes.map((s) => (
              <div key={s.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-foreground">{s.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      Enviado el {new Date(s.updated_at).toLocaleString("es-CL")}
                      {s.asegurado && " · Adjuntó póliza de seguro"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" disabled={trabajando} onClick={() => void resolver(s, true)}>
                      <Check className="h-4 w-4" /> Aprobar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={trabajando}
                      onClick={() => void resolver(s, false)}
                    >
                      <X className="h-4 w-4" /> Rechazar
                    </Button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(s.documentos ?? {}).map(([campo, ruta]) => (
                    <Button
                      key={campo}
                      size="sm"
                      variant="secondary"
                      onClick={() => void verDocumento(ruta)}
                    >
                      <FileText className="h-4 w-4" /> {campo}
                    </Button>
                  ))}
                </div>

                <Input
                  className="mt-3"
                  placeholder="Motivo del rechazo (se aplica al documento o a la solicitud)"
                  value={notas[s.id] ?? ""}
                  onChange={(e) => setNotas((n) => ({ ...n, [s.id]: e.target.value }))}
                />

                <div className="mt-3 space-y-2 rounded-lg border border-border bg-surface p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Checklist documento por documento
                  </p>
                  {TODOS_DOCUMENTOS.map((d) => {
                    const item = normalizarChecklist(s.checklist)[d.clave];
                    return (
                      <div
                        key={d.clave}
                        className="flex flex-wrap items-center justify-between gap-2"
                      >
                        <span className="text-sm text-foreground">
                          {d.label}{" "}
                          <span className="text-xs font-semibold text-muted-foreground">
                            · {ETIQUETA_ESTADO[item.estado] ?? item.estado}
                          </span>
                          {item.estado === "rechazado" && item.motivo && (
                            <span className="text-xs text-destructive"> · {item.motivo}</span>
                          )}
                        </span>
                        <span className="flex gap-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => void marcarDocumento(s, d.clave, "aprobado")}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void marcarDocumento(s, d.clave, "rechazado")}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </span>
                      </div>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>

          {resueltas.length > 0 && (
            <div className="mt-5 space-y-1 border-t border-border pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Historial
              </p>
              {resueltas.map((s) => (
                <p key={s.id} className="text-sm text-muted-foreground">
                  {s.nombre} — {ETIQUETA_ESTADO[s.estado] ?? s.estado}
                  {s.nota_admin && ` · ${s.nota_admin}`}
                </p>
              ))}
            </div>
          )}
        </Seccion>

        <Seccion
          titulo={`Gestión de Usuarios (${perfiles.length})`}
          descripcion="Suspende cuentas sospechosas o reactívalas cuando corresponda."
        >
          <Input
            className="mb-3 max-w-sm"
            placeholder="Buscar por nombre o correo"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <div className="divide-y divide-border">
            {perfilesFiltrados.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-semibold text-foreground">
                    {p.nombre}{" "}
                    {p.verificado && <span className="text-xs text-trust">· Verificado</span>}
                    {p.bloqueado && (
                      <span className="text-xs text-destructive"> · Suspendido</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.email} · {p.rol} · {p.plan_activo ? "Plan activo" : "Sin plan"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={p.bloqueado ? "secondary" : "outline"}
                  onClick={() => void cambiarBloqueo(p)}
                >
                  {p.bloqueado ? (
                    <>
                      <Undo2 className="h-4 w-4" /> Reactivar
                    </>
                  ) : (
                    <>
                      <Ban className="h-4 w-4" /> Suspender
                    </>
                  )}
                </Button>
              </div>
            ))}
            {perfilesFiltrados.length === 0 && (
              <p className="py-3 text-sm text-muted-foreground">Sin resultados.</p>
            )}
          </div>
        </Seccion>

        <Seccion
          titulo={`Gestión de Cargas (${cargas.length})`}
          descripcion="Elimina publicaciones falsas, duplicadas o vencidas."
        >
          {cargas.length === 0 && (
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <PackageX className="h-4 w-4" /> No hay cargas publicadas.
            </p>
          )}
          <div className="divide-y divide-border">
            {cargas.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-semibold text-foreground">{c.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.origen} → {c.destino} · {c.empresa}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => void eliminarCarga(c)}>
                  <Trash2 className="h-4 w-4" /> Eliminar
                </Button>
              </div>
            ))}
          </div>
        </Seccion>

        <Seccion
          titulo={`Reportes (${reportes.filter((r) => r.estado === "pendiente").length} pendientes)`}
          descripcion="Denuncias de publicaciones o usuarios enviadas desde el tablero."
        >
          {reportes.length === 0 && (
            <p className="text-sm text-muted-foreground">No hay reportes por ahora.</p>
          )}
          <div className="divide-y divide-border">
            {reportes.map((r) => (
              <div key={r.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                <div className="min-w-56 flex-1">
                  <p className="font-semibold text-foreground">
                    {r.reportado_nombre} · {r.motivo}
                  </p>
                  <p className="text-xs text-muted-foreground">{r.detalle}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {r.tipo === "usuario" ? "Usuario" : "Publicación"} ·{" "}
                    {new Date(r.created_at).toLocaleString("es-CL")} · Estado: {r.estado}
                  </p>
                </div>
                {r.estado === "pendiente" && (
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => void bloquearReportado(r)}>
                      <Ban className="h-4 w-4" /> Suspender usuario
                    </Button>
                    <Button size="sm" onClick={() => void resolverReporte(r, "revisado")}>
                      <Check className="h-4 w-4" /> Revisado
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void resolverReporte(r, "descartado")}
                    >
                      <X className="h-4 w-4" /> Descartar
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Seccion>

        <Seccion
          titulo={`Solicitudes de eliminación de cuenta (${eliminaciones.filter((e) => e.estado === "pendiente").length} pendientes)`}
          descripcion="Peticiones recibidas desde la página pública o desde la aplicación."
        >
          {eliminaciones.length === 0 && (
            <p className="text-sm text-muted-foreground">No hay solicitudes registradas.</p>
          )}
          <div className="divide-y divide-border">
            {eliminaciones.map((e) => (
              <div key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-semibold text-foreground">{e.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.motivo || "Sin motivo indicado"} · Origen: {e.origen} · Estado: {e.estado} ·{" "}
                    {new Date(e.created_at).toLocaleDateString("es-CL")}
                  </p>
                </div>
                {e.estado === "pendiente" && (
                  <Button size="sm" onClick={() => void marcarEliminacion(e, "procesada")}>
                    <Check className="h-4 w-4" /> Marcar procesada
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Seccion>

        <Seccion
          titulo="Métricas del marketplace"
          descripcion="Resumen interno del uso de la plataforma."
        >
          {!metricas ? (
            <p className="text-sm text-muted-foreground">Cargando métricas…</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Cargas publicadas", metricas.cargas_publicadas],
                ["Cargas activas", metricas.cargas_activas],
                ["Cargas cerradas", metricas.cargas_cerradas],
                ["Cargas últimos 30 días", metricas.cargas_ultimos_30],
                ["Postulaciones", metricas.postulaciones],
                ["Postulaciones últimos 30 días", metricas.postulaciones_ultimos_30],
                ["Usuarios registrados", metricas.usuarios],
                ["Usuarios suspendidos", metricas.usuarios_bloqueados],
                ["Reportes pendientes", metricas.reportes_pendientes],
              ].map(([etiqueta, valor]) => (
                <div key={String(etiqueta)} className="rounded-lg border border-border bg-surface p-3">
                  <p className="text-xs text-muted-foreground">{etiqueta}</p>
                  <p className="text-2xl font-extrabold text-foreground">{valor}</p>
                </div>
              ))}
            </div>
          )}
        </Seccion>
      </main>
      <Toaster />
    </div>
  );
}
