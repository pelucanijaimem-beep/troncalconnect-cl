import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PackagePlus, Search, Truck } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/troncal/Header";
import { RoleSwitcher, type Rol } from "@/components/troncal/RoleSwitcher";
import { LaunchBanner } from "@/components/troncal/LaunchBanner";
import { SearchFilters, type Filtros } from "@/components/troncal/SearchFilters";
import { LoadCard } from "@/components/troncal/LoadCard";
import { TruckCard } from "@/components/troncal/TruckCard";
import { AuthDialog } from "@/components/troncal/AuthDialog";
import { PostTruckDialog } from "@/components/troncal/PostTruckDialog";
import { PostLoadDialog } from "@/components/troncal/PostLoadDialog";
import { LoadDetailsDialog } from "@/components/troncal/LoadDetailsDialog";
import { DonateDialog } from "@/components/troncal/DonateDialog";
import { CAMIONES, CARGAS, type Carga } from "@/lib/troncal-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TroncalTrack — Bolsa de Cargas y Camiones en Chile" },
      {
        name: "description",
        content:
          "Encuentra fletes y camiones disponibles en Chile. Publica tu carga o tu camión gratis en TroncalTrack, la bolsa de cargas del sur.",
      },
      { property: "og:title", content: "TroncalTrack — Bolsa de Cargas y Camiones en Chile" },
      {
        property: "og:description",
        content:
          "Fletes, camiones disponibles y contacto directo entre camioneros y empresas. 100% gratis durante el lanzamiento regional.",
      },
    ],
  }),
  component: Index,
});

const FILTROS_VACIOS: Filtros = { origen: "", destino: "", carroceria: "todas", fecha: "" };

function coincide(valor: string, filtro: string) {
  return !filtro.trim() || valor.toLowerCase().includes(filtro.trim().toLowerCase());
}

function Index() {
  const [rol, setRol] = useState<Rol>("camionero");
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VACIOS);
  const [authOpen, setAuthOpen] = useState(false);
  const [authModo, setAuthModo] = useState<"login" | "registro">("login");
  const [camionOpen, setCamionOpen] = useState(false);
  const [fleteOpen, setFleteOpen] = useState(false);
  const [donarOpen, setDonarOpen] = useState(false);
  const [detalle, setDetalle] = useState<Carga | null>(null);

  const cargas = useMemo(
    () =>
      CARGAS.filter(
        (c) =>
          coincide(c.origen, filtros.origen) &&
          coincide(c.destino, filtros.destino) &&
          (filtros.carroceria === "todas" || c.carroceria === filtros.carroceria) &&
          (!filtros.fecha || c.fecha === filtros.fecha),
      ),
    [filtros],
  );

  const camiones = useMemo(
    () =>
      CAMIONES.filter(
        (t) =>
          coincide(t.origen, filtros.origen) &&
          coincide(t.destino, filtros.destino) &&
          (filtros.carroceria === "todas" || t.carroceria === filtros.carroceria) &&
          (!filtros.fecha || t.fecha === filtros.fecha),
      ),
    [filtros],
  );

  const esCamionero = rol === "camionero";
  const abrirAuth = (modo: "login" | "registro") => {
    setAuthModo(modo);
    setAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header rol={rol} onRolChange={setRol} onAuth={abrirAuth} />
      <LaunchBanner onDonar={() => setDonarOpen(true)} />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <section className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {esCamionero ? "Buscar Cargas disponibles" : "Buscar Camiones disponibles"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {esCamionero
              ? "Fletes publicados por empresas verificadas en todo Chile."
              : "Camioneros con disponibilidad confirmada para tus rutas."}
          </p>

          <div className="mt-4 md:hidden">
            <RoleSwitcher rol={rol} onChange={setRol} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {esCamionero ? (
              <>
                <Button onClick={() => setCamionOpen(true)}>
                  <Truck className="h-4 w-4" /> Publicar mi Camión
                </Button>
                <Button variant="outline" onClick={() => setFiltros(FILTROS_VACIOS)}>
                  <Search className="h-4 w-4" /> Ver todas las cargas
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setFleteOpen(true)}>
                  <PackagePlus className="h-4 w-4" /> Publicar Flete
                </Button>
                <Button variant="outline" onClick={() => setFiltros(FILTROS_VACIOS)}>
                  <Search className="h-4 w-4" /> Ver todos los camiones
                </Button>
              </>
            )}
          </div>
        </section>

        <SearchFilters
          filtros={filtros}
          onChange={setFiltros}
          onLimpiar={() => setFiltros(FILTROS_VACIOS)}
        />

        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {esCamionero
              ? `${cargas.length} cargas encontradas`
              : `${camiones.length} camiones encontrados`}
          </h2>

          <div className="space-y-3">
            {esCamionero
              ? cargas.map((c) => <LoadCard key={c.id} carga={c} onDetalles={setDetalle} />)
              : camiones.map((t) => <TruckCard key={t.id} camion={t} />)}

            {(esCamionero ? cargas.length : camiones.length) === 0 && (
              <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
                <p className="font-semibold text-foreground">No hay resultados con esos filtros</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Prueba con otra ruta, carrocería o fecha.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="mt-10 border-t border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} TroncalTrack — Los Ángeles, Región del Biobío, Chile.</p>
          <button
            onClick={() => setDonarOpen(true)}
            className="cursor-pointer text-left font-medium text-primary hover:underline sm:ml-auto"
          >
            Apoyar el proyecto / Donaciones
          </button>
        </div>
      </footer>

      <AuthDialog open={authOpen} modo={authModo} rol={rol} onOpenChange={setAuthOpen} />
      <PostTruckDialog open={camionOpen} onOpenChange={setCamionOpen} />
      <PostLoadDialog open={fleteOpen} onOpenChange={setFleteOpen} />
      <LoadDetailsDialog carga={detalle} onOpenChange={(o) => !o && setDetalle(null)} />
      <DonateDialog open={donarOpen} onOpenChange={setDonarOpen} />
      <Toaster />
    </div>
  );
}
