import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PackagePlus, Search, Truck } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/troncal/Header";
import { TopSupportBar } from "@/components/troncal/TopSupportBar";
import { Hero } from "@/components/troncal/Hero";
import { PricingPlans } from "@/components/troncal/PricingPlans";
import { ComparisonTable } from "@/components/troncal/ComparisonTable";
import { RoleSwitcher, type Rol } from "@/components/troncal/RoleSwitcher";
import { LaunchBanner } from "@/components/troncal/LaunchBanner";
import { SearchFilters, type Filtros } from "@/components/troncal/SearchFilters";
import { EquipmentPills } from "@/components/troncal/EquipmentPills";
import { CountrySelector } from "@/components/troncal/CountrySelector";
import { LoadCard } from "@/components/troncal/LoadCard";
import { TruckCard } from "@/components/troncal/TruckCard";
import { AuthDialog } from "@/components/troncal/AuthDialog";
import { PostTruckDialog } from "@/components/troncal/PostTruckDialog";
import { PostLoadDialog } from "@/components/troncal/PostLoadDialog";
import { LoadDetailsDialog } from "@/components/troncal/LoadDetailsDialog";
import { DonateDialog } from "@/components/troncal/DonateDialog";
import { TrackingDialog } from "@/components/troncal/TrackingDialog";
import { ContactDialog, type Contacto } from "@/components/troncal/ContactDialog";
import {
  CAMIONES,
  CARGAS,
  getPais,
  type Camion,
  type Carga,
  type PaisCodigo,
} from "@/lib/troncal-data";
import { useTripTracking } from "@/lib/use-trip-tracking";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TroncalTrack — Bolsa de Cargas y Camiones en Sudamérica" },
      {
        name: "description",
        content:
          "Encuentra fletes y camiones disponibles en Chile, Argentina, Perú y Bolivia. Publica tu carga o tu camión gratis y rastrea tus viajes con GPS en vivo.",
      },
      { property: "og:title", content: "TroncalTrack — Bolsa de Cargas y Camiones en Sudamérica" },
      {
        property: "og:description",
        content:
          "Fletes, camiones disponibles, tarifas por kilómetro y rastreo GPS en vivo. 100% gratis durante el lanzamiento regional.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
  const [pais, setPais] = useState<PaisCodigo>("CL");
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VACIOS);
  const [authOpen, setAuthOpen] = useState(false);
  const [authModo, setAuthModo] = useState<"login" | "registro">("login");
  const [camionOpen, setCamionOpen] = useState(false);
  const [fleteOpen, setFleteOpen] = useState(false);
  const [donarOpen, setDonarOpen] = useState(false);
  const [detalle, setDetalle] = useState<Carga | null>(null);
  const [contacto, setContacto] = useState<Contacto | null>(null);
  const [rastreo, setRastreo] = useState<Carga | null>(null);

  const { getViaje, iniciarViaje, finalizarViaje } = useTripTracking();
  const paisActual = getPais(pais);

  const cargas = useMemo(
    () =>
      CARGAS.filter(
        (c) =>
          c.pais === pais &&
          coincide(c.origen, filtros.origen) &&
          coincide(c.destino, filtros.destino) &&
          (filtros.carroceria === "todas" || c.carroceria === filtros.carroceria) &&
          (!filtros.fecha || c.fecha === filtros.fecha),
      ),
    [filtros, pais],
  );

  const camiones = useMemo(
    () =>
      CAMIONES.filter(
        (t) =>
          t.pais === pais &&
          coincide(t.origen, filtros.origen) &&
          coincide(t.destino, filtros.destino) &&
          (filtros.carroceria === "todas" || t.carroceria === filtros.carroceria) &&
          (!filtros.fecha || t.fecha === filtros.fecha),
      ),
    [filtros, pais],
  );

  const esCamionero = rol === "camionero";
  const abrirAuth = (modo: "login" | "registro") => {
    setAuthModo(modo);
    setAuthOpen(true);
  };

  const contactarCarga = (c: Carga) =>
    setContacto({
      titulo: "Contactar al cargador",
      nombre: c.empresa,
      telefono: c.telefono,
      resumen: `${c.origen} → ${c.destino} · ${c.carroceria} · ${c.toneladas} Ton`,
    });

  const contactarCamion = (t: Camion) =>
    setContacto({
      titulo: "Contactar al camionero",
      nombre: t.conductor,
      telefono: t.telefono,
      resumen: `${t.origen} → ${t.destino} · ${t.carroceria} · ${t.toneladas} Ton`,
    });

  const iniciar = (c: Carga) => {
    iniciarViaje(c.id);
    toast.success("Viaje iniciado — GPS activo", {
      description: `Estás en ruta de ${c.origen} a ${c.destino}. El cargador puede seguir tu posición.`,
    });
  };

  const finalizar = (c: Carga) => {
    finalizarViaje(c.id);
    toast.success("Carga entregada", {
      description: "El seguimiento GPS se detuvo y el viaje quedó completado.",
    });
  };

  const rastrear = (c: Carga) => {
    const v = getViaje(c.id);
    if (v.estado === "disponible") {
      toast.info("El viaje aún no comienza", {
        description: "Verás la posición en vivo cuando el camionero inicie el viaje.",
      });
    }
    setRastreo(c);
  };

  const viajeRastreo = rastreo ? getViaje(rastreo.id) : null;
  const enRutaCount = cargas.filter((c) => getViaje(c.id).estado === "en_ruta").length;

  return (
    <div className="min-h-screen bg-background">
      <TopSupportBar />
      <Header
        rol={rol}
        pais={pais}
        onPaisChange={setPais}
        onRolChange={setRol}
        onAuth={abrirAuth}
      />
      <LaunchBanner onDonar={() => setDonarOpen(true)} />

      <Hero
        onRegistro={() => abrirAuth("registro")}
        onPublicarCamion={() => setCamionOpen(true)}
        onPublicarFlete={() => setFleteOpen(true)}
      />

      <PricingPlans onRegistro={() => abrirAuth("registro")} onDonar={() => setDonarOpen(true)} />

      <ComparisonTable />

      <main id="cargas" className="mx-auto max-w-6xl px-4 py-6">
        <section className="mb-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {esCamionero ? "Buscar Cargas disponibles" : "Buscar Camiones disponibles"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {esCamionero
              ? `Fletes publicados por empresas verificadas en ${paisActual.nombre}. Tarifas en ${paisActual.moneda}.`
              : `Camioneros con disponibilidad confirmada en ${paisActual.nombre}.`}
          </p>

          <div id="paises" className="mt-4 space-y-3 md:hidden">
            <CountrySelector pais={pais} onChange={setPais} className="w-full" />
          </div>
          <div className="mt-4 lg:hidden">
            <RoleSwitcher rol={rol} onChange={setRol} />
          </div>
          <div className="mt-4 hidden lg:block">
            <RoleSwitcher rol={rol} onChange={setRol} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {esCamionero ? (
              <>
                <Button id="publicar-camion" onClick={() => setCamionOpen(true)}>
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
          ciudades={paisActual.ciudades}
          onChange={setFiltros}
          onLimpiar={() => setFiltros(FILTROS_VACIOS)}
        />

        <div className="mt-4">
          <EquipmentPills
            valor={filtros.carroceria}
            onChange={(v) => setFiltros({ ...filtros, carroceria: v })}
          />
        </div>

        <section className="mt-6">
          <h2 className="mb-3 flex flex-wrap items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {esCamionero
              ? `${cargas.length} cargas encontradas`
              : `${camiones.length} camiones encontrados`}
            {enRutaCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold normal-case text-primary">
                {enRutaCount} en ruta con GPS activo
              </span>
            )}
          </h2>

          <div className="space-y-3">
            {esCamionero
              ? cargas.map((c) => (
                  <LoadCard
                    key={c.id}
                    carga={c}
                    rol={rol}
                    viaje={getViaje(c.id)}
                    onDetalles={setDetalle}
                    onContactar={contactarCarga}
                    onIniciar={iniciar}
                    onFinalizar={finalizar}
                    onRastrear={rastrear}
                  />
                ))
              : camiones.map((t) => (
                  <TruckCard key={t.id} camion={t} onContactar={contactarCamion} />
                ))}

            {!esCamionero && cargas.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Mis cargas publicadas
                </h2>
                <div className="space-y-3">
                  {cargas.map((c) => (
                    <LoadCard
                      key={c.id}
                      carga={c}
                      rol={rol}
                      viaje={getViaje(c.id)}
                      onDetalles={setDetalle}
                      onContactar={contactarCarga}
                      onIniciar={iniciar}
                      onFinalizar={finalizar}
                      onRastrear={rastrear}
                    />
                  ))}
                </div>
              </div>
            )}

            {(esCamionero ? cargas.length : camiones.length) === 0 && (
              <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
                <p className="font-semibold text-foreground">No hay resultados con esos filtros</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Prueba con otra ruta, carrocería, fecha o país.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer id="soporte" className="mt-10 border-t border-border bg-surface">
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
      <PostLoadDialog open={fleteOpen} onOpenChange={setFleteOpen} pais={pais} />
      <LoadDetailsDialog carga={detalle} onOpenChange={(o) => !o && setDetalle(null)} />
      <ContactDialog contacto={contacto} onOpenChange={(o) => !o && setContacto(null)} />
      <TrackingDialog
        carga={rastreo}
        viaje={viajeRastreo}
        onOpenChange={(o) => !o && setRastreo(null)}
      />
      <DonateDialog open={donarOpen} onOpenChange={setDonarOpen} />
      <Toaster />
    </div>
  );
}
