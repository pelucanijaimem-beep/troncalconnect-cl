import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Lock } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/troncal/Header";
import { LoadDetailsDialog } from "@/components/troncal/LoadDetailsDialog";
import { cargaPorId, type CargaDB } from "@/lib/use-cargas";
import { cerrarSesion, useSesion } from "@/lib/use-session";
import { getVerificacionDe, useVerificaciones } from "@/lib/use-verificacion";

export const Route = createFileRoute("/carga/$id")({
  component: CargaDirecta,
  head: () => ({
    meta: [
      { title: "Publicación compartida | TroncalTrack" },
      {
        name: "description",
        content:
          "Abre una publicación de carga compartida por su generador en TroncalTrack, el tablero de cargas de Chile.",
      },
      { property: "og:title", content: "Publicación compartida | TroncalTrack" },
      {
        property: "og:description",
        content: "Detalle de una carga compartida por enlace directo en TroncalTrack.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function CargaDirecta() {
  const { id } = Route.useParams();
  const sesion = useSesion();
  const verificaciones = useVerificaciones();
  const [carga, setCarga] = useState<CargaDB | null>(null);
  const [cargando, setCargando] = useState(true);
  const [abierto, setAbierto] = useState(true);

  useEffect(() => {
    let vivo = true;
    if (!sesion) {
      setCargando(false);
      return;
    }
    setCargando(true);
    void cargaPorId(id).then((c) => {
      if (!vivo) return;
      setCarga(c);
      setCargando(false);
    });
    return () => {
      vivo = false;
    };
  }, [id, sesion]);

  const soyVerificado =
    getVerificacionDe(verificaciones, sesion?.nombre).estado === "verificado";

  return (
    <div className="min-h-screen bg-background">
      <Header
        sesion={sesion}
        onSalir={cerrarSesion}
        rol="camionero"
        onRolChange={() => {}}
        onAuth={() => {}}
        onPublicarCamion={() => {}}
        onPublicarCarga={() => {}}
      />

      <main className="mx-auto max-w-2xl px-4 py-10">
        <Button asChild variant="ghost" className="mb-4">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" /> Volver al tablero
          </Link>
        </Button>

        {!sesion ? (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <p className="inline-flex items-center gap-2 font-semibold text-foreground">
              <Lock className="h-4 w-4" /> Necesitas iniciar sesión
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Ingresa a tu cuenta para abrir esta publicación compartida.
            </p>
            <Button asChild className="mt-4">
              <Link to="/registro">Ingresar o crear cuenta</Link>
            </Button>
          </div>
        ) : cargando ? (
          <p className="text-sm text-muted-foreground">Cargando publicación…</p>
        ) : !carga ? (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <p className="font-semibold text-foreground">Publicación no disponible</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Esta publicación es privada o ya no está activa. Pídele al dueño que te invite con
              tu correo registrado.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-border bg-card p-4">
              <h1 className="text-xl font-extrabold text-foreground">
                {carga.origen} → {carga.destino}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {carga.carroceria} · {carga.toneladas} Toneladas
              </p>
              <Button className="mt-4" onClick={() => setAbierto(true)}>
                Ver detalle completo
              </Button>
            </div>
            <LoadDetailsDialog
              carga={abierto ? carga : null}
              accesoContacto={Boolean(sesion.planActivo)}
              contactoVerificado={soyVerificado}
              esDueno={carga.userId === sesion.id}
              onOpenChange={(o) => setAbierto(o)}
            />
          </>
        )}
      </main>
      <Toaster />
    </div>
  );
}
