import { useEffect, useRef, useState, type ComponentType } from "react";
import {
  BatteryFull,
  Check,
  CircleDollarSign,
  Fingerprint,
  MapPin,
  Navigation,
  Pause,
  Play,
  Rocket,
  Share2,
  ShieldCheck,
  Signal,
  UserCheck,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Recorrido ilustrativo de la plataforma dentro de un marco de teléfono.
 * Usa únicamente datos de ejemplo fijos: no consulta cargas, perfiles ni viajes reales.
 */

type Paso = {
  titulo: string;
  texto: string;
  icono: ComponentType<{ className?: string }>;
  Pantalla: ComponentType;
};

const clp = (n: number) => `$${n.toLocaleString("es-CL")}`;

function PantallaRentabilidad() {
  const flete = 612000;
  const diesel = 214200;
  const peajes = 56500;
  const margen = flete - diesel - peajes;
  const km = 510;
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Carga disponible</p>
      <div className="rounded-xl border border-border bg-card p-3">
        <p className="text-sm font-extrabold leading-tight text-foreground">Los Ángeles → Santiago</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">Rampla plana · 26 t · {km} km por Ruta 5</p>
        <dl className="mt-3 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Flete ofrecido</dt>
            <dd className="font-bold text-foreground">{clp(flete)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">− Diésel estimado</dt>
            <dd className="font-semibold text-foreground">{clp(diesel)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">− Peajes Ruta 5</dt>
            <dd className="font-semibold text-foreground">{clp(peajes)}</dd>
          </div>
        </dl>
        <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
          <span className="bg-foreground/80" style={{ width: `${(diesel / flete) * 100}%` }} />
          <span className="bg-muted-foreground/50" style={{ width: `${(peajes / flete) * 100}%` }} />
          <span className="bg-primary" style={{ width: `${(margen / flete) * 100}%` }} />
        </div>
      </div>
      <div className="rounded-xl bg-device p-3 text-device-foreground">
        <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">Margen neto</p>
        <div className="mt-1 flex items-end justify-between gap-2">
          <p className="text-2xl font-extrabold leading-none">{clp(margen)}</p>
          <span className="rounded-md bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
            {clp(Math.round(margen / km))}/km
          </span>
        </div>
      </div>
      <p className="text-center text-[10px] text-muted-foreground">Cálculo automático antes de postular</p>
    </div>
  );
}

function PantallaVerificacion() {
  const items = [
    "Cédula de identidad",
    "Licencia profesional A5",
    "SOAP vigente",
    "Revisión técnica aprobada",
    "Carpeta tributaria SII (empresa)",
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
        <div className="relative">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-device text-sm font-extrabold text-device-foreground">
            RF
          </span>
          <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-primary">
            <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
          </span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold text-foreground">Rodrigo Fuentes</p>
          <p className="truncate text-[11px] text-muted-foreground">Transportes Fuentes SpA · Chillán</p>
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
            <ShieldCheck className="h-3 w-3" /> Verificado TroncalCheck
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-device p-3 text-device-foreground">
        <Fingerprint className="h-6 w-6 shrink-0 text-primary" />
        <div>
          <p className="text-xs font-bold">Biometría facial aprobada</p>
          <p className="text-[10px] opacity-70">El rostro coincide con la cédula</p>
        </div>
      </div>
      <ul className="space-y-1.5">
        {items.map((i) => (
          <li key={i} className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-foreground">
              <Check className="h-2.5 w-2.5 text-background" strokeWidth={3} />
            </span>
            <span className="flex-1 font-medium text-foreground">{i}</span>
            <span className="text-[10px] font-bold text-primary">OK</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PantallaGps() {
  return (
    <div className="space-y-3">
      <div className="relative h-44 overflow-hidden rounded-xl border border-border bg-muted">
        <svg viewBox="0 0 200 180" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
          <path d="M150 10 C 120 50, 140 80, 105 100 S 70 150, 55 172" className="fill-none stroke-border" strokeWidth="10" strokeLinecap="round" />
          <path d="M150 10 C 120 50, 140 80, 105 100 S 70 150, 55 172" className="fill-none stroke-muted-foreground/60" strokeWidth="2" strokeDasharray="5 5" />
          <path d="M55 172 C 70 150, 90 120, 105 100" className="fill-none stroke-primary" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="150" cy="10" r="4" className="fill-foreground" />
          <circle cx="55" cy="172" r="4" className="fill-foreground" />
        </svg>
        <span className="absolute left-[52.5%] top-[55.6%] -translate-x-1/2 -translate-y-1/2">
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/50 motion-reduce:animate-none" />
          <span className="relative flex h-4 w-4 rounded-full border-2 border-background bg-primary" />
        </span>
        <span className="absolute right-2 top-2 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-bold text-foreground">Santiago</span>
        <span className="absolute bottom-2 left-2 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-bold text-foreground">Los Ángeles</span>
        <span className="absolute left-[57%] top-[42%] rounded bg-device px-1.5 py-0.5 text-[10px] font-bold text-device-foreground">Talca</span>
      </div>
      <div className="rounded-xl border border-border bg-card p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="whitespace-nowrap text-sm font-extrabold text-foreground">Viaje activo</p>
          <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            En ruta · a tiempo
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-foreground">
          <Navigation className="h-3.5 w-3.5 text-primary" /> Ruta 5 Sur, Km 250 · Talca
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> Llegada estimada 18:40 · 82 km/h
        </div>
      </div>
      <span className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-xs font-bold text-primary-foreground">
        <Share2 className="h-3.5 w-3.5" /> Compartir enlace con el cliente
      </span>
    </div>
  );
}

function PantallaEntrega() {
  const pin = ["4", "8", "2", "9", "1", "7"];
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Cierre en destino</p>
        <p className="text-sm font-extrabold text-foreground">Centro de distribución · Santiago</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-3">
        <p className="text-xs font-bold text-foreground">Código PIN del receptor</p>
        <div className="mt-2 grid grid-cols-6 gap-1.5">
          {pin.map((d, i) => (
            <span
              key={i}
              className="flex h-9 items-center justify-center rounded-md border-2 border-foreground bg-background text-base font-extrabold text-foreground"
            >
              {d}
            </span>
          ))}
        </div>
        <p className="mt-2 flex items-center gap-1 text-[11px] font-bold text-primary">
          <Check className="h-3.5 w-3.5" strokeWidth={3} /> PIN validado
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-3">
        <p className="flex items-center gap-1 text-xs font-bold text-foreground">
          <UserCheck className="h-3.5 w-3.5" /> Datos de quien recibe
        </p>
        <div className="mt-2 space-y-1 rounded-lg border border-dashed border-border bg-background p-2.5">
          <p className="text-sm font-bold text-foreground">Carolina Soto</p>
          <p className="text-xs text-muted-foreground">RUT 18.432.665-1</p>
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">18-11 · 18:52 · Ubicación GPS registrada</p>
      </div>
      <span className="flex w-full items-center justify-center gap-2 rounded-lg bg-device py-2.5 text-xs font-bold text-device-foreground">
        <CircleDollarSign className="h-3.5 w-3.5 text-primary" /> Entrega conforme · respalda tu cobro
      </span>
    </div>
  );
}

const PASOS: Paso[] = [
  {
    titulo: "1. Rentabilidad real al instante",
    texto: "Ve el margen neto de cada flete después de diésel y peajes, antes de postular.",
    icono: CircleDollarSign,
    Pantalla: PantallaRentabilidad,
  },
  {
    titulo: "2. Verificación Biométrica TroncalCheck",
    texto: "Conductores con identidad, licencia y documentos del camión revisados.",
    icono: Fingerprint,
    Pantalla: PantallaVerificacion,
  },
  {
    titulo: "3. Rastreo GPS en vivo en Ruta 5",
    texto: "Sigue el viaje en tiempo real y comparte un enlace con tu cliente.",
    icono: Navigation,
    Pantalla: PantallaGps,
  },
  {
    titulo: "4. Entrega Segura con Código PIN",
    texto: "Cierra el viaje en destino con el PIN de 6 dígitos y el nombre y RUT de quien recibe.",
    icono: ShieldCheck,
    Pantalla: PantallaEntrega,
  },
];

function MarcoTelefono({ paso }: { paso: number }) {
  const { Pantalla } = PASOS[paso]!;
  return (
    <div className="relative mx-auto w-[272px] rounded-[2.75rem] bg-device p-2.5 shadow-device sm:w-[300px]">
      <div className="relative flex h-[560px] flex-col overflow-hidden rounded-[2.25rem] bg-background sm:h-[610px]">
        <div className="relative flex h-11 shrink-0 items-center justify-between px-6 pt-1 text-[12px] font-bold text-foreground">
          <span>9:41</span>
          <span className="absolute left-1/2 top-2 h-6 w-24 -translate-x-1/2 rounded-full bg-device" aria-hidden />
          <span className="flex items-center gap-1">
            <Signal className="h-3.5 w-3.5" />
            <span className="text-[10px] font-extrabold">5G</span>
            <Wifi className="h-3.5 w-3.5" />
            <BatteryFull className="h-4 w-4" />
          </span>
        </div>
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 pb-2">
          <span className="text-sm font-extrabold tracking-tight text-foreground">
            Troncal<span className="text-primary">Track</span>
          </span>
          <span className="rounded-full border border-border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
            Ejemplo
          </span>
        </div>
        <div className="flex-1 overflow-hidden px-4 py-3">
          <div key={paso} className="animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none">
            <Pantalla />
          </div>
        </div>
        <div className="flex shrink-0 justify-center gap-1.5 pb-2" aria-hidden>
          {PASOS.map((_, i) => (
            <span key={i} className={cn("h-1.5 rounded-full transition-all", i === paso ? "w-5 bg-primary" : "w-1.5 bg-border")} />
          ))}
        </div>
        <div className="mx-auto mb-2 h-1 w-28 shrink-0 rounded-full bg-foreground/80" aria-hidden />
      </div>
    </div>
  );
}

export function DemoEnAccion({ onRegistro }: { onRegistro: () => void }) {
  const [paso, setPaso] = useState(0);
  const [auto, setAuto] = useState(true);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(([e]) => setVisible(Boolean(e?.isIntersecting)), { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const elegir = (i: number) => {
    setPaso(i);
    setAuto(false);
  };

  return (
    <section ref={ref} className="border-b border-border bg-background" aria-labelledby="demo-en-accion">
      <div className="mx-auto max-w-6xl px-4 py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-x-14">
          <div className="lg:col-start-1 lg:row-start-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
              Mira TroncalTrack en acción
            </span>
            <h2 id="demo-en-accion" className="mt-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Así de fácil mueves o aseguras tu carga en Ruta 5
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
              Explora en segundos cómo funciona la plataforma desde tu teléfono, sin intermediarios.
            </p>
          </div>

          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
            <MarcoTelefono paso={paso} />
          </div>

          <div className="lg:col-start-1 lg:row-start-2">
            <ul className="space-y-3">
              {PASOS.map((p, i) => {
                const activo = i === paso;
                return (
                  <li key={p.titulo}>
                    <button
                      type="button"
                      onClick={() => elegir(i)}
                      aria-pressed={activo}
                      className={cn(
                        "relative w-full overflow-hidden rounded-xl border-2 bg-card p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        activo ? "border-primary bg-primary/5" : "border-border hover:border-foreground/30",
                      )}
                    >
                      <div className="flex gap-3">
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                            activo ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                          )}
                        >
                          <p.icono className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-foreground sm:text-base">{p.titulo}</h3>
                          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{p.texto}</p>
                        </div>
                      </div>
                      {activo && (
                        <span className="absolute inset-x-0 bottom-0 h-1 bg-primary/15" aria-hidden>
                          {auto ? (
                            <span
                              key={paso}
                              className="block h-full animate-demo-progreso bg-primary"
                              style={{ animationPlayState: visible ? "running" : "paused" }}
                              onAnimationEnd={() => setPaso((n) => (n + 1) % PASOS.length)}
                            />
                          ) : (
                            <span className="block h-full w-full bg-primary" />
                          )}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={onRegistro}>
                <Rocket className="h-4 w-4" /> Probar gratis ahora
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setAuto((a) => !a)}>
                {auto ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {auto ? "Pausar recorrido" : "Reanudar recorrido"}
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Pantallas con datos ilustrativos de Chile.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
