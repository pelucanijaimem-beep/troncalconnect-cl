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

  const recargar = useCallback(async () => {
    const [s, p, c] = await Promise.all([
      supabase
        .from("verificaciones")
        .select("id, user_id, nombre, estado, asegurado, documentos, nota_admin, updated_at")
        .order("updated_at", { ascending: false }),
      supabase
        .from("perfiles")
        .select("id, nombre, email, telefono, rol, plan_activo, bloqueado, verificado")
        .order("created_at", { ascending: false }),
      supabase
        .from("cargas")
        .select("id, titulo, origen, destino, empresa, precio, created_at")
        .order("created_at", { ascending: false }),
    ]);
    setSolicitudes((s.data ?? []) as Solicitud[]);
    setPerfiles((p.data ?? []) as Perfil[]);
    setCargas((c.data ?? []) as CargaFila[]);
  }, []);

  useEffect(() => {
    if (esAdmin) void recargar();
  }, [esAdmin, recargar]);

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
        pais="CL"
        onPaisChange={() => undefined}
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
                  placeholder="Motivo del rechazo (opcional)"
                  value={notas[s.id] ?? ""}
                  onChange={(e) => setNotas((n) => ({ ...n, [s.id]: e.target.value }))}
                />
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
      </main>
      <Toaster />
    </div>
  );
}
