import type { ComponentType, ReactNode } from "react";
import {
  BatteryFull,
  BellRing,
  Check,
  CircleDollarSign,
  Fingerprint,
  MapPin,
  Navigation,
  Send,
  Share2,
  ShieldCheck,
  Signal,
  Star,
  Truck,
  UserCheck,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Pantallas de ejemplo para el marco de teléfono.
 * Todos los datos son fijos e ilustrativos: nunca consultan cargas, perfiles ni viajes reales.
 */

const clp = (n: number) => `$${n.toLocaleString("es-CL")}`;

type MarcoProps = {
  children: ReactNode;
  /** Cantidad de puntos de navegación; si se omite, no se muestran. */
  pasos?: number;
  /** Índice del punto activo. */
  paso?: number;
  /** "sm" replica el marco compacto de la guía; "md" es el de la portada. */
  size?: "sm" | "md";
};

export function MarcoTelefono({ children, pasos, paso, size = "md" }: MarcoProps) {
  const compacto = size === "sm";
  return (
    <div
      className={cn(
        "relative mx-auto bg-device p-2.5 shadow-device",
        compacto ? "w-[240px] rounded-[2.5rem] sm:w-[260px]" : "w-[272px] rounded-[2.75rem] sm:w-[300px]",
      )}
    >
      <div
        className={cn(
          "relative flex flex-col overflow-hidden bg-background",
          compacto ? "h-[506px] rounded-[2rem]" : "h-[560px] rounded-[2.25rem] sm:h-[610px]",
        )}
      >
        <div className="relative flex h-11 shrink-0 items-center justify-between px-6 pt-1 text-[12px] font-bold text-foreground">
          <span>9:41</span>
          <span
            className={cn(
              "absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-device",
              compacto ? "h-5 w-20" : "h-6 w-24",
            )}
            aria-hidden
          />
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
        <div className="flex-1 overflow-hidden px-4 py-3">{children}</div>
        {pasos ? (
          <div className="flex shrink-0 justify-center gap-1.5 pb-2" aria-hidden>
            {Array.from({ length: pasos }).map((_, i) => (
              <span
                key={i}
                className={cn("h-1.5 rounded-full transition-all", i === paso ? "w-5 bg-primary" : "w-1.5 bg-border")}
              />
            ))}
          </div>
        ) : null}
        <div className="mx-auto mb-2 h-1 w-28 shrink-0 rounded-full bg-foreground/80" aria-hidden />
      </div>
    </div>
  );
}

/** Campo de formulario ilustrativo: solo texto, no es un input real. */
function CampoEjemplo({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="rounded-lg border border-border bg-background px-2.5 py-1.5">
      <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{etiqueta}</p>
      <p className="truncate text-sm font-bold text-foreground">{valor}</p>
    </div>
  );
}

export function PantallaRegistro() {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Crea tu cuenta</p>
      <div className="space-y-2 rounded-xl border border-border bg-card p-3">
        <CampoEjemplo etiqueta="RUT" valor="18.432.665-1" />
        <CampoEjemplo etiqueta="Teléfono" valor="+56 9 4792 6230" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <span className="flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-xs font-bold text-primary-foreground">
          <Truck className="h-3.5 w-3.5" /> Transportista
        </span>
        <span className="flex items-center justify-center gap-1.5 rounded-lg border-2 border-foreground py-2 text-xs font-bold text-foreground">
          <ShieldCheck className="h-3.5 w-3.5" /> Empresa
        </span>
      </div>
      <p className="text-center text-[10px] text-muted-foreground">Gratis y sin comisión · menos de un minuto</p>
    </div>
  );
}

export function PantallaDisponible() {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Tu estado de ruta</p>
      <div className="flex items-center justify-between gap-2 rounded-xl bg-device p-3 text-device-foreground">
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold">Disponible en Ruta</p>
            <p className="text-[10px] opacity-70">Las empresas ven tu posición</p>
          </div>
        </div>
        <span className="flex h-6 w-11 shrink-0 items-center rounded-full bg-primary p-0.5" aria-hidden>
          <span className="ml-auto h-5 w-5 rounded-full bg-background" />
        </span>
      </div>
      <div className="rounded-xl border border-border bg-card p-3">
        <p className="text-xs font-bold text-foreground">Chillán · Ruta 5 Sur</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          3 empresas de tu ruta vieron tu disponibilidad hoy
        </p>
      </div>
      <p className="text-center text-[10px] text-muted-foreground">Tu ubicación se apaga al desactivarlo</p>
    </div>
  );
}

export function PantallaRentabilidad() {
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

export function PantallaPostular() {
  const publicado = 612000;
  const contraoferta = 645000;
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Tu postulación</p>
      <div className="rounded-xl border border-border bg-card p-3">
        <p className="text-sm font-extrabold leading-tight text-foreground">Los Ángeles → Santiago</p>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Precio publicado</span>
          <span className="font-bold text-foreground">{clp(publicado)}</span>
        </div>
      </div>
      <div className="rounded-xl border-2 border-primary bg-card p-3">
        <p className="text-[10px] font-bold uppercase tracking-wide text-primary">Tu contraoferta</p>
        <p className="mt-1 text-2xl font-extrabold leading-none text-foreground">{clp(contraoferta)}</p>
        <p className="mt-1 text-[10px] text-muted-foreground">
          $33.000 sobre el publicado · la empresa decide
        </p>
      </div>
      <span className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-xs font-bold text-primary-foreground">
        <Send className="h-3.5 w-3.5" /> Enviar postulación
      </span>
    </div>
  );
}

export function PantallaAvisos() {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Aviso en tu teléfono</p>
      <div className="rounded-xl border border-border bg-card p-3 shadow-card">
        <div className="flex items-start gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-device text-device-foreground">
            <BellRing className="h-4 w-4 text-primary" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-xs font-extrabold text-foreground">TroncalTrack</p>
              <span className="shrink-0 text-[9px] font-bold text-muted-foreground">ahora</span>
            </div>
            <p className="mt-0.5 text-[11px] font-bold leading-snug text-foreground">
              Nueva carga en tu ruta: Los Ángeles → Santiago
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Rampla plana · 26 t · $612.000</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 rounded-xl bg-device p-3 text-device-foreground">
        <p className="text-xs font-bold">Avisos activados</p>
        <span className="flex h-6 w-11 shrink-0 items-center rounded-full bg-primary p-0.5" aria-hidden>
          <span className="ml-auto h-5 w-5 rounded-full bg-background" />
        </span>
      </div>
      <p className="text-center text-[10px] text-muted-foreground">
        Llega aunque no tengas la app abierta
      </p>
    </div>
  );
}

export function PantallaCalificar() {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Califica el viaje</p>
      <div className="rounded-xl border border-border bg-card p-3">
        <p className="text-xs font-bold text-foreground">Transportes Fuentes SpA</p>
        <div className="mt-1.5 flex gap-1" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className="h-5 w-5 fill-primary text-primary" />
          ))}
        </div>
        <div className="mt-2 rounded-lg border border-dashed border-border bg-background p-2">
          <p className="text-[11px] leading-snug text-foreground">
            Carga rápida en planta y trato respetuoso.
          </p>
        </div>
      </div>
      <span className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-xs font-bold text-primary-foreground">
        <Check className="h-3.5 w-3.5" strokeWidth={3} /> Enviar calificación
      </span>
      <div className="rounded-xl border border-border bg-card p-3">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Te calificaron</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-sm font-extrabold text-foreground">
            <Star className="h-4 w-4 fill-primary text-primary" /> 4.9
          </div>
          <span className="text-[10px] font-bold text-muted-foreground">14 viajes calificados</span>
        </div>
      </div>
    </div>
  );
}

export function PantallaVerificacion() {
  const items = [
    "Cédula de identidad",
    "Licencia profesional A5",
    "SOAP vigente",
    "Revisión técnica aprobada",
    "Permiso de circulación vigente",
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

export function PantallaGps() {
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

export function PantallaEntrega() {
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

export type PasoPantalla = {
  titulo: string;
  texto: string;
  icono: ComponentType<{ className?: string }>;
  Pantalla: ComponentType;
};

export type { MarcoProps };
