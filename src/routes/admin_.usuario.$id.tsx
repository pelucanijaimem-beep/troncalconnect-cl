import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArrowLeft,
  Ban,
  Check,
  FileText,
  Loader2,
  ShieldCheck,
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
import { PrerevisionIA, type FilaPrerevision } from "@/components/troncal/PrerevisionIA";
import {
  DOC_CHILEVALORA,
  documentosRequeridos,
  normalizarChecklist,
  type ClaveDocumento,
} from "@/lib/use-verificacion";

export const Route = createFileRoute("/admin_/usuario/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Hoja de vida del usuario — TroncalTrack" },
      { name: "description", content: "Ficha administrativa privada para revisar antecedentes, documentos TroncalCheck y reportes de un usuario." },
      { property: "og:title", content: "Hoja de vida del usuario — TroncalTrack" },
      { property: "og:description", content: "Revisión administrativa privada de antecedentes y documentos TroncalCheck." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HojaDeVidaUsuario,
});

type PerfilCompleto = {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  rut: string | null;
  rol: string;
  plan_activo: boolean;
  bloqueado: boolean;
  verificado: boolean;
  created_at: string;
};

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
  requiere_revision_manual: boolean;
};

type AlertaInterna = {
  id: string;
  tipo: string;
  detalle: string;
  estado: string;
  created_at: string;
};

type Reporte = {
  id: string;
  tipo: string;
  motivo: string;
  detalle: string;
  estado: string;
  created_at: string;
};

const ETIQUETA_ESTADO: Record<string, string> = {
  pendiente: "Pendiente de Revisión",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
};

function HojaDeVidaUsuario() {
  const { id } = Route.useParams();
  const sesion = useSesion();
  const { esAdmin, cargando: cargandoPermiso } = useEsAdmin(sesion?.id);

  const [perfil, setPerfil] = useState<PerfilCompleto | null>(null);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [alertas, setAlertas] = useState<AlertaInterna[]>([]);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [prerevisiones, setPrerevisiones] = useState<FilaPrerevision[]>([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [notas, setNotas] = useState<Record<string, string>>({});
  const [trabajando, setTrabajando] = useState(false);

  const recargar = useCallback(async () => {
    if (!esAdmin || !sesion) return;
    setCargandoDatos(true);
    const [p, s, a, r, pr] = await Promise.all([
      supabase.rpc("perfiles_admin"),
      supabase
        .from("verificaciones")
        .select(
          "id, user_id, nombre, estado, asegurado, documentos, checklist, nota_admin, updated_at, requiere_revision_manual",
        )
        .eq("user_id", id)
        .order("updated_at", { ascending: false }),
      supabase
        .from("alertas_internas")
        .select("id, tipo, detalle, estado, created_at")
        .eq("user_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("reportes")
        .select("id, tipo, motivo, detalle, estado, created_at")
        .eq("reportado_id", id)
        .order("created_at", { ascending: false }),
      supabase.from("prerevision_documentos").select("user_id, clave, ruta, veredicto, motivo").eq("user_id", id),
    ]);
    if (p.error || s.error || a.error || r.error) {
      toast.error("No se pudo cargar la hoja de vida. Inténtalo nuevamente.");
      setCargandoDatos(false);
      return;
    }
    const perfiles = (p.data ?? []) as PerfilCompleto[];
    setPerfil(perfiles.find((perfil) => perfil.id === id) ?? null);
    setSolicitudes((s.data ?? []) as Solicitud[]);
    setAlertas((a.data ?? []) as AlertaInterna[]);
    setReportes((r.data ?? []) as Reporte[]);
    setPrerevisiones(pr.data ?? []);
    setCargandoDatos(false);
  }, [id, esAdmin, sesion]);

  useEffect(() => {
    if (esAdmin) void recargar();
  }, [esAdmin, recargar]);

  const rol = perfil?.rol === "empresa" ? "empresa" : "camionero";

  const verDocumento = async (ruta: string) => {
    const { data, error } = await supabase.storage.from("documentos").createSignedUrl(ruta, 300);
    if (error || !data) {
      toast.error("No se pudo abrir el documento");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const marcarDocumento = async (
    s: Solicitud,
    clave: ClaveDocumento,
    estado: "aprobado" | "rechazado" | "pendiente",
  ) => {
    const actual = normalizarChecklist(s.checklist);
    const motivo = estado === "rechazado" ? (notas[s.id] ?? "").trim() : "";
    if (estado === "rechazado" && !motivo) {
      toast.error("Escribe el motivo del rechazo antes de rechazar el documento.");
      return;
    }
    const nuevo = { ...actual, [clave]: { estado, motivo } };
    const todosAprobados = !s.requiere_revision_manual && documentosRequeridos(rol).every(
      (d) => nuevo[d.clave].estado === "aprobado",
    );
    const { error } = await supabase
      .from("verificaciones")
      .update(
        todosAprobados
          ? { checklist: nuevo, estado: "aprobado", nota_admin: "", requiere_revision_manual: false }
          : { checklist: nuevo, ...(s.estado === "aprobado" ? { estado: "pendiente" } : {}) },
      )
      .eq("id", s.id);
    if (error) {
      toast.error("No se pudo actualizar el documento", { description: error.message });
      return;
    }
    if (todosAprobados) {
      await supabase.from("perfiles").update({ verificado: true }).eq("id", s.user_id);
      toast.success(`${s.nombre} obtuvo el sello TroncalCheck`, {
        description: "Todos sus documentos requeridos quedaron aprobados.",
      });
    } else {
      toast.success(estado === "rechazado" ? "Documento rechazado" : "Documento aprobado");
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
        requiere_revision_manual: false,
      })
      .eq("id", s.id);
    if (!error) {
      await supabase.from("perfiles").update({ verificado: aprobar }).eq("id", s.user_id);
    }
    setTrabajando(false);
    if (error) {
      toast.error("No se pudo actualizar la solicitud", { description: error.message });
      return;
    }
    toast.success(aprobar ? `${s.nombre} fue verificado` : `Solicitud de ${s.nombre} rechazada`);
    await recargar();
  };

  const cambiarBloqueo = async () => {
    if (!perfil) return;
    const { error } = await supabase
      .from("perfiles")
      .update({ bloqueado: !perfil.bloqueado })
      .eq("id", perfil.id);
    if (error) {
      toast.error("No se pudo actualizar el usuario", { description: error.message });
      return;
    }
    toast.success(perfil.bloqueado ? "Usuario reactivado" : "Usuario suspendido");
    await recargar();
  };

  const resolverReporte = async (r: Reporte, estado: "revisado" | "descartado") => {
    const { error } = await supabase.from("reportes").update({ estado }).eq("id", r.id);
    if (error) {
      toast.error("No se pudo actualizar el reporte", { description: error.message });
      return;
    }
    toast.success(estado === "revisado" ? "Reporte marcado como revisado" : "Reporte descartado");
    await recargar();
  };

  if (cargandoPermiso) {
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
          Esta sección es exclusiva del equipo administrador de TroncalTrack.
        </p>
        <Button asChild>
          <Link to="/">Volver al inicio</Link>
        </Button>
        <Toaster />
      </div>
    );
  }

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

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al panel de administración
        </Link>

        {cargandoDatos && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Cargando hoja de vida…
          </div>
        )}

        {!cargandoDatos && !perfil && (
          <p className="text-sm text-muted-foreground">
            No encontramos ese usuario. Puede que la cuenta haya sido eliminada.
          </p>
        )}

        {perfil && (
          <>
            <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                    {perfil.nombre}
                  </h1>
                  <p className="mt-1 flex flex-wrap gap-2 text-sm">
                    {perfil.verificado && (
                      <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-bold text-success">
                        Verificado · TroncalCheck
                      </span>
                    )}
                    {perfil.bloqueado && (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive">
                        Suspendido
                      </span>
                    )}
                    {perfil.plan_activo && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                        Plan activo
                      </span>
                    )}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={perfil.bloqueado ? "secondary" : "outline"}
                  onClick={() => void cambiarBloqueo()}
                >
                  {perfil.bloqueado ? (
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

              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Correo
                  </dt>
                  <dd className="text-foreground">{perfil.email}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Teléfono
                  </dt>
                  <dd className="text-foreground">{perfil.telefono || "Sin registrar"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    RUT
                  </dt>
                  <dd className="text-foreground">{perfil.rut || "Sin RUT (registro pendiente)"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Tipo de cuenta
                  </dt>
                  <dd className="text-foreground">
                    {perfil.rol === "empresa" ? "Dador de Carga / Empresa" : "Transportista"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Registrado el
                  </dt>
                  <dd className="text-foreground">
                    {new Date(perfil.created_at).toLocaleString("es-CL")}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
              <h2 className="text-lg font-extrabold tracking-tight text-foreground">
                Verificación TroncalCheck y documentos
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Revisa cada documento adjunto y compáralo contra el RUT y los datos de arriba para
                detectar documentos falsos o que no correspondan a esta persona.
              </p>

              {solicitudes.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Este usuario todavía no ha enviado documentos para TroncalCheck.
                </p>
              )}

              <div className="space-y-4">
                {solicitudes.map((s) => (
                  <div key={s.id} className="rounded-lg border border-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-foreground">
                          {ETIQUETA_ESTADO[s.estado] ?? s.estado}
                        </p>
                        {s.requiere_revision_manual && (
                          <p className="text-sm font-semibold text-destructive">
                            Requiere revisión manual
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Enviado el {new Date(s.updated_at).toLocaleString("es-CL")}
                          {s.asegurado && " · Adjuntó póliza de seguro"}
                        </p>
                        {s.nota_admin && (
                          <p className="text-xs text-destructive">Nota: {s.nota_admin}</p>
                        )}
                      </div>
                      {s.estado === "pendiente" && (
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
                      )}
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
                      {[
                        ...documentosRequeridos(rol),
                        ...((s.documentos as Record<string, string> | null)?.["chilevalora_peligrosas"] ||
                        normalizarChecklist(s.checklist)["chilevalora_peligrosas"].estado !== "pendiente"
                          ? [DOC_CHILEVALORA]
                          : []),
                      ].map((d) => {
                        const item = normalizarChecklist(s.checklist)[d.clave];
                        const ruta = (s.documentos as Record<string, string> | null)?.[d.clave];
                        return (
                          <div key={d.clave} className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm text-foreground">
                              {d.label}{" "}
                              <span className="text-xs font-semibold text-muted-foreground">
                                · {ETIQUETA_ESTADO[item.estado] ?? item.estado}
                              </span>
                              {item.estado === "rechazado" && item.motivo && (
                                <span className="text-xs text-destructive"> · {item.motivo}</span>
                              )}
                              {ruta ? (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="ml-2 h-auto px-0 text-xs"
                                  onClick={() => void verDocumento(ruta)}
                                >
                                  Ver archivo
                                </Button>
                              ) : (
                                <span className="ml-2 text-xs text-muted-foreground">Sin archivo</span>
                              )}
                              <PrerevisionIA
                                clave={d.clave}
                                ruta={ruta}
                                fila={prerevisiones.find((x) => x.clave === d.clave)}
                              />
                            </span>
                            <span className="flex gap-1">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => void marcarDocumento(s, d.clave, "aprobado")}
                              >
                                <Check className="h-3.5 w-3.5" /><span className="sr-only">Aprobar {d.label}</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => void marcarDocumento(s, d.clave, "rechazado")}
                              >
                                <X className="h-3.5 w-3.5" /><span className="sr-only">Rechazar {d.label}</span>
                              </Button>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {alertas.length > 0 && (
              <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
                <h2 className="text-lg font-extrabold tracking-tight text-foreground">
                  Alertas internas sobre este usuario
                </h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  Avisos automáticos del sistema, como patentes repetidas entre cuentas distintas.
                </p>
                <div className="divide-y divide-border">
                  {alertas.map((a) => (
                    <p key={a.id} className="py-2 text-sm text-foreground">
                      <span className="font-semibold">{a.tipo}</span> — {a.detalle}{" "}
                      <span className="text-xs text-muted-foreground">
                        · {a.estado} · {new Date(a.created_at).toLocaleString("es-CL")}
                      </span>
                    </p>
                  ))}
                </div>
              </section>
            )}

            {reportes.length > 0 && (
              <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
                <h2 className="text-lg font-extrabold tracking-tight text-foreground">
                  Reportes en su contra
                </h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  Denuncias enviadas por otros usuarios desde el tablero.
                </p>
                <div className="divide-y divide-border">
                  {reportes.map((r) => (
                    <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">{r.motivo}</span> — {r.detalle}{" "}
                        <span className="text-xs text-muted-foreground">
                          · {r.estado} · {new Date(r.created_at).toLocaleString("es-CL")}
                        </span>
                      </p>
                      {r.estado === "pendiente" && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => void resolverReporte(r, "revisado")}>
                            Marcar revisado
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void resolverReporte(r, "descartado")}
                          >
                            Descartar
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <Toaster />
    </div>
  );
}