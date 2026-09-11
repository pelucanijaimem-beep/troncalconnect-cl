import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PackagePlus, Search, Star, Truck, Ban, Radio } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/troncal/Header";
import { TopSupportBar } from "@/components/troncal/TopSupportBar";
import { Hero } from "@/components/troncal/Hero";
import { LiveStatsBanner } from "@/components/troncal/LiveStatsBanner";
import { SolutionsSection } from "@/components/troncal/SolutionsSection";
import { BenefitsGrid } from "@/components/troncal/BenefitsGrid";
import { FaqSection } from "@/components/troncal/FaqSection";
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
import { TrackingDialog } from "@/components/troncal/TrackingDialog";
import { DriverTripDialog } from "@/components/troncal/DriverTripDialog";
import { AvailabilityPanel } from "@/components/troncal/AvailabilityPanel";
import { ContactDialog, type Contacto } from "@/components/troncal/ContactDialog";
import { TermsDialog } from "@/components/troncal/TermsDialog";
import { LockedBoard } from "@/components/troncal/LockedBoard";
import { TrustProfileCard } from "@/components/troncal/TrustProfileCard";
import { CompareLoadsDialog } from "@/components/troncal/CompareLoadsDialog";
import { PodDialog } from "@/components/troncal/PodDialog";
import {
  desbloquearEmpresa,
  estaBloqueada,
  useTableroPrefs,
} from "@/lib/use-tablero-prefs";
import { VerificationDialog } from "@/components/troncal/VerificationDialog";
import {
  RatingDialog,
  type EvaluacionPendiente,
} from "@/components/troncal/RatingDialog";
import { getVerificacionDe, useVerificaciones } from "@/lib/use-verificacion";
import { usePublicaciones } from "@/lib/use-publicaciones";
import { postularACarga, useCargas, useMisPostulaciones } from "@/lib/use-cargas";
import { cerrarSesion, useSesion } from "@/lib/use-session";
import {
  getPais,
  type Camion,
  type Carga,
  type PaisCodigo,
} from "@/lib/troncal-data";
import { useTripTracking } from "@/lib/use-trip-tracking";

export const Route = createFileRoute("/")({
  component: Index,
});

const FILTROS_VACIOS: Filtros = {
  origen: "",
  destino: "",
  carroceria: "todas",
  fecha: "",
  soloVerificados: false,
  precioMin: "",
  precioMax: "",
  estado: "todos",
};

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
  const [detalle, setDetalle] = useState<Carga | null>(null);
  const [contacto, setContacto] = useState<Contacto | null>(null);
  const [rastreo, setRastreo] = useState<Carga | null>(null);
  const [viajeActivo, setViajeActivo] = useState<Carga | null>(null);
  const [termsOpen, setTermsOpen] = useState(false);
  const [verificacionOpen, setVerificacionOpen] = useState(false);
  const [evaluacion, setEvaluacion] = useState<EvaluacionPendiente | null>(null);
  const [comparaOpen, setComparaOpen] = useState(false);
  const [podCarga, setPodCarga] = useState<Carga | null>(null);

  const sesion = useSesion();
  const { camiones: CAMIONES } = usePublicaciones();
  const { cargas: CARGAS } = useCargas(Boolean(sesion));
  const { ids: postuladas, agregar: agregarPostulacion } = useMisPostulaciones(sesion?.id);
  const accesoContacto = Boolean(sesion?.planActivo);
  const navigate = useNavigate();
  const { getViaje, iniciarViaje, finalizarViaje } = useTripTracking();
  const verificaciones = useVerificaciones();
  const prefs = useTableroPrefs();
  const paisActual = getPais(pais);
  const miVerificacion = getVerificacionDe(verificaciones, sesion?.nombre);
  const soyVerificado = miVerificacion.estado === "verificado";

  const cargas = useMemo(
    () =>
      CARGAS.filter(
        (c) =>
          c.pais === pais &&
          coincide(c.origen, filtros.origen) &&
          coincide(c.destino, filtros.destino) &&
          (filtros.carroceria === "todas" || c.carroceria === filtros.carroceria) &&
          (!filtros.fecha || c.fecha === filtros.fecha) &&
          (!c.soloVerificados || rol !== "camionero" || soyVerificado) &&
          (!filtros.precioMin || c.valorKm >= Number(filtros.precioMin)) &&
          (!filtros.precioMax || c.valorKm <= Number(filtros.precioMax)) &&
          (rol !== "camionero" || !estaBloqueada(prefs.bloqueadas, c.empresa)) &&
          (!filtros.soloVerificados ||
            getVerificacionDe(verificaciones, c.empresa).estado === "verificado"),
      ),
    [filtros, pais, CARGAS, verificaciones, rol, soyVerificado, prefs.bloqueadas],
  );

  const favoritas = useMemo(
    () => CARGAS.filter((c) => prefs.favoritos.includes(c.id)),
    [CARGAS, prefs.favoritos],
  );

  const camiones = useMemo(
    () =>
      CAMIONES.filter(
        (t) =>
          t.pais === pais &&
          coincide(t.origen, filtros.origen) &&
          coincide(t.destino, filtros.destino) &&
          (filtros.carroceria === "todas" || t.carroceria === filtros.carroceria) &&
          (!filtros.fecha || t.fecha === filtros.fecha) &&
          (filtros.estado === "todos" || (t.estado ?? "buscando") === filtros.estado) &&
          (!filtros.soloVerificados ||
            getVerificacionDe(verificaciones, t.conductor).estado === "verificado"),
      ),
    [filtros, pais, CAMIONES, verificaciones],
  );


  const esCamionero = rol === "camionero";
  const abrirAuth = (modo: "login" | "registro") => {
    setAuthModo(modo);
    setAuthOpen(true);
  };

  const requiereSesion = (accion: () => void) => {
    if (!sesion) {
      abrirAuth("registro");
      toast.info("Crea tu cuenta", {
        description: "Necesitas iniciar sesión para ver y publicar cargas en vivo.",
      });
      return;
    }
    accion();
  };

  const contactarCarga = (c: Carga) =>
    requiereSesion(() => {
      if (!accesoContacto) {
        toast.error("Datos de contacto bloqueados", {
          description: "Necesitas un Plan Pro activo para ver el teléfono y WhatsApp del cargador.",
        });
        void navigate({ to: "/planes" });
        return;
      }
      setContacto({
      titulo: "Contactar al cargador",
      nombre: c.empresa,
      telefono: c.telefono,
        resumen: `${c.origen} → ${c.destino} · ${c.carroceria} · ${c.toneladas} Ton`,
      });
    });

  const contactarCamion = (t: Camion) =>
    setContacto({
      titulo: "Contactar al camionero",
      nombre: t.conductor,
      telefono: t.telefono,
      resumen: `${t.origen} → ${t.destino} · ${t.carroceria} · ${t.toneladas} Ton`,
    });

  const postular = async (c: Carga) => {
    if (!sesion) {
      abrirAuth("registro");
      return;
    }
    if (!sesion.planActivo) {
      toast.error("Necesitas un plan mensual activo", {
        description:
          "Suscríbete al Plan Transportista Pro ($14.990 CLP/mes) para postular a las cargas.",
      });
      return;
    }
    const error = await postularACarga(c.id, sesion.id, `${c.origen} → ${c.destino}`);
    if (error) {
      toast.error("No pudimos enviar tu postulación", {
        description: "Verifica que tu plan mensual esté activo e inténtalo nuevamente.",
      });
      return;
    }
    agregarPostulacion(c.id);
    toast.success("Postulación enviada", {
      description: `El cargador ${c.empresa} recibirá tus datos de contacto.`,
    });
  };


  const iniciar = (c: Carga) => {
    iniciarViaje(c.id);
    setViajeActivo(c);
    toast.success("Viaje iniciado — GPS activo", {
      description: `Estás en ruta de ${c.origen} a ${c.destino}. El cargador puede seguir tu posición.`,
    });
  };

  const finalizar = (c: Carga) => {
    finalizarViaje(c.id);
    setViajeActivo(null);
    toast.success("Carga entregada", {
      description: "El seguimiento GPS se detuvo y el viaje quedó completado.",
    });
    setEvaluacion({
      evaluado: c.empresa,
      ruta: `${c.origen} → ${c.destino}`,
      papel: "Generador de Carga",
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

  const cargasHoy = Math.max(CARGAS.filter((c) => c.pais === pais).length, 128);
  const tarifaPromedioKm = (() => {
    const lista = CARGAS.filter((c) => c.pais === pais && c.km > 0);
    if (!lista.length) return 1180;
    return Math.round(lista.reduce((a, c) => a + c.valorKm, 0) / lista.length);
  })();
  const rutasActivas = new Set(
    CARGAS.filter((c) => c.pais === pais).map((c) => `${c.origen}-${c.destino}`),
  ).size || 24;

  const solicitarDemo = () => {
    toast.success("Solicitud de demo enviada", {
      description: "Te contactaremos al +569 4792 6230 o escríbenos a soporte@troncaltrack.cl.",
    });
  };

  const viajeRastreo = rastreo ? getViaje(rastreo.id) : null;
  const viajeChofer = viajeActivo ? getViaje(viajeActivo.id) : null;
  const enRutaCount = cargas.filter((c) => getViaje(c.id).estado === "en_ruta").length;

  return (
    <div className="min-h-screen bg-background">
      <TopSupportBar />
      <Header
        sesion={sesion}
        onSalir={() => {
          cerrarSesion();
          toast.success("Sesión cerrada.");
        }}
        rol={rol}
        pais={pais}
        onPaisChange={setPais}
        onRolChange={setRol}
        onAuth={abrirAuth}
        onPublicarCamion={() => requiereSesion(() => setCamionOpen(true))}
        onPublicarCarga={() => requiereSesion(() => setFleteOpen(true))}
      />
      <LaunchBanner />

      <Hero onRegistro={() => abrirAuth("registro")} onDemo={solicitarDemo} />

      <LiveStatsBanner
        cargasHoy={cargasHoy}
        tarifaKm={tarifaPromedioKm}
        rutasActivas={rutasActivas}
        equipo={filtros.carroceria}
        onEquipoChange={(v) => {
          setFiltros({ ...filtros, carroceria: v });
          document.getElementById("cargas")?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      <section className="mx-auto max-w-6xl px-4 pb-2 pt-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
              <Radio className="h-5 w-5 text-primary" />
              Actividad en vivo en Chile
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Camiones transmitiendo su posición GPS en este momento. Inicia sesión para ver el
              detalle de cada camión y contactar.
            </p>
          </div>
        </div>

        <AvailabilityPanel
          esCamionero={esCamionero}
          usuario={{
            ...(sesion?.id ? { id: sesion.id } : {}),
            ...(sesion?.nombre ? { nombre: sesion.nombre } : {}),
            ...(sesion?.telefono ? { telefono: sesion.telefono } : {}),
          }}
          bloqueado={!sesion}
          onRequiereSesion={() => abrirAuth("registro")}
        />
      </section>

      <SolutionsSection
        onPublicarCamion={() => requiereSesion(() => setCamionOpen(true))}
        onPublicarFlete={() => requiereSesion(() => setFleteOpen(true))}
        onRegistro={() => abrirAuth("registro")}
      />

      <BenefitsGrid />

      <PricingPlans onRegistro={() => abrirAuth("registro")} />

      <ComparisonTable />

      <FaqSection onRegistro={() => abrirAuth("registro")} />

      {!sesion && (
        <LockedBoard
          onIngresar={() => abrirAuth("login")}
          onRegistro={() => abrirAuth("registro")}
        />
      )}

      {sesion && (
      <main id="cargas" className="mx-auto max-w-6xl px-4 py-6">
        <p className="mb-2 text-sm font-semibold text-primary">
          Panel privado de {sesion.nombre}
        </p>

        <div className="mb-6">
          <TrustProfileCard
            usuario={sesion.nombre}
            onVerificar={() => setVerificacionOpen(true)}
          />
        </div>

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
                <Button id="publicar-camion" onClick={() => requiereSesion(() => setCamionOpen(true))}>
                  <Truck className="h-4 w-4" /> Publicar mi Camión
                </Button>
                <Button variant="outline" onClick={() => setFiltros(FILTROS_VACIOS)}>
                  <Search className="h-4 w-4" /> Ver todas las cargas
                </Button>
                <Button variant="outline" onClick={() => setComparaOpen(true)}>
                  <Star className="h-4 w-4" /> Mis cargas guardadas ({favoritas.length})
                </Button>
              </>

            ) : (
              <>
                <Button onClick={() => requiereSesion(() => setFleteOpen(true))}>
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
          moneda={paisActual.moneda}
          mostrarEstado={!esCamionero}
          onChange={setFiltros}
          onLimpiar={() => setFiltros(FILTROS_VACIOS)}
        />

        <div className="mt-4">
          <EquipmentPills
            valor={filtros.carroceria}
            onChange={(v) => setFiltros({ ...filtros, carroceria: v })}
          />
        </div>

        {esCamionero && prefs.bloqueadas.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface p-3 text-sm">
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              <Ban className="h-4 w-4 text-primary" /> Empresas bloqueadas:
            </span>
            {prefs.bloqueadas.map((b) => (
              <button
                key={b}
                onClick={() => desbloquearEmpresa(b)}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold capitalize text-muted-foreground hover:border-primary hover:text-primary"
                title="Desbloquear empresa"
              >
                {b} ✕
              </button>
            ))}
          </div>
        )}

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
                    onDetalles={(c) => requiereSesion(() => setDetalle(c))}
                    onContactar={contactarCarga}
                    onIniciar={iniciar}
                    onFinalizar={(c) => setPodCarga(c)}
                    onRastrear={rastrear}
                    onVerViaje={setViajeActivo}
                    onPostular={(carga) => void postular(carga)}
                    yaPostulada={postuladas.includes(c.id)}
                    accesoContacto={accesoContacto}
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
                      onDetalles={(c) => requiereSesion(() => setDetalle(c))}
                      onContactar={contactarCarga}
                      onIniciar={iniciar}
                      onFinalizar={finalizar}
                      onRastrear={rastrear}
                      onVerViaje={setViajeActivo}
                      accesoContacto
                    />
                  ))}
                </div>
              </div>
            )}

            {(esCamionero ? cargas.length : camiones.length) === 0 && (
              <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
                <p className="font-semibold text-foreground">
                  No hay cargas publicadas para esta ruta en este momento.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {esCamionero
                    ? "Publica tu camión para recibir ofertas directas de empresas cargadoras."
                    : "Publica tu flete para que los camioneros disponibles te contacten al instante."}
                </p>
                <Button
                  className="mt-4"
                  onClick={() =>
                    esCamionero ? setCamionOpen(true) : setFleteOpen(true)
                  }
                >
                  {esCamionero ? (
                    <>
                      <Truck className="h-4 w-4" /> Publicar mi Camión
                    </>
                  ) : (
                    <>
                      <PackagePlus className="h-4 w-4" /> Publicar Flete
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
      )}

      <footer id="soporte" className="mt-10 border-t border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} TroncalTrack — Los Ángeles, Región del Biobío, Chile.</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <button
              onClick={() => setTermsOpen(true)}
              className="cursor-pointer text-left font-medium text-foreground hover:text-primary hover:underline"
            >
              Términos y Condiciones
            </button>
            <a
              href="#faq"
              className="cursor-pointer font-medium text-foreground hover:text-primary hover:underline"
            >
              Preguntas frecuentes
            </a>
            <a
              href="mailto:soporte@troncaltrack.cl"
              className="cursor-pointer font-medium text-foreground hover:text-primary hover:underline"
            >
              Soporte
            </a>
            <button
              onClick={() => abrirAuth("registro")}
              className="cursor-pointer text-left font-medium text-foreground hover:text-primary hover:underline"
            >
              Registro
            </button>
          </div>
        </div>
      </footer>

      <AuthDialog open={authOpen} modo={authModo} rol={rol} onOpenChange={setAuthOpen} />
      <PostTruckDialog open={camionOpen} onOpenChange={setCamionOpen} pais={pais} />
      <PostLoadDialog open={fleteOpen} onOpenChange={setFleteOpen} pais={pais} />
      <LoadDetailsDialog accesoContacto={accesoContacto} carga={detalle} onOpenChange={(o) => !o && setDetalle(null)} />
      <ContactDialog contacto={contacto} onOpenChange={(o) => !o && setContacto(null)} />
      <DriverTripDialog
        carga={viajeActivo}
        viaje={viajeChofer}
        onFinalizar={(c) => setPodCarga(c)}
        onOpenChange={(o) => !o && setViajeActivo(null)}
      />
      <TrackingDialog
        carga={rastreo}
        viaje={viajeRastreo}
        onOpenChange={(o) => !o && setRastreo(null)}
      />
      <CompareLoadsDialog
        open={comparaOpen}
        onOpenChange={setComparaOpen}
        cargas={favoritas}
        onDetalles={(c) => {
          setComparaOpen(false);
          setDetalle(c);
        }}
      />
      <PodDialog
        carga={podCarga}
        onOpenChange={(o) => !o && setPodCarga(null)}
        onConfirmado={(c) => {
          setPodCarga(null);
          finalizar(c);
        }}
      />
      <TermsDialog open={termsOpen} onOpenChange={setTermsOpen} />
      <VerificationDialog
        open={verificacionOpen}
        onOpenChange={setVerificacionOpen}
        usuario={sesion?.nombre ?? ""}
        userId={sesion?.id}
      />
      <RatingDialog
        evaluacion={evaluacion}
        autor={sesion?.nombre ?? "Usuario TroncalTrack"}
        onOpenChange={(o) => !o && setEvaluacion(null)}
      />
      <Toaster />
    </div>
  );
}
