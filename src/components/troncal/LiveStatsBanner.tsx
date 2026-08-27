import { useEffect, useState } from "react";
import { Activity, MapPin, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const EQUIPOS = [
  { label: "Rampla / Cortina (Van)", value: "Sider" },
  { label: "Plataforma (Flatbed)", value: "Rampla Plana" },
  { label: "Frigorífico (Reefer)", value: "Thermo / Frigo" },
  { label: "Cama Baja (Heavy Haul)", value: "Cama Baja" },
  { label: "Tolva", value: "Tolva" },
  { label: "Flete / Carga Parcial (LTL)", value: "Furgón" },
];

const RUTAS = [
  "Santiago → Concepción",
  "Antofagasta → Santiago",
  "Los Ángeles → Santiago",
  "Valparaíso → Los Ángeles",
  "Puerto Montt → Temuco",
  "Iquique → Antofagasta",
];

function useContador(objetivo: number) {
  const [valor, setValor] = useState(0);
  useEffect(() => {
    let frame = 0;
    const total = 40;
    const id = window.setInterval(() => {
      frame += 1;
      setValor(Math.round((objetivo * frame) / total));
      if (frame >= total) window.clearInterval(id);
    }, 25);
    return () => window.clearInterval(id);
  }, [objetivo]);
  return valor;
}

export function LiveStatsBanner({
  cargasHoy,
  tarifaKm,
  rutasActivas,
  equipo,
  onEquipoChange,
}: {
  cargasHoy: number;
  tarifaKm: number;
  rutasActivas: number;
  equipo: string;
  onEquipoChange: (v: string) => void;
}) {
  const c = useContador(cargasHoy);
  const t = useContador(tarifaKm);
  const r = useContador(rutasActivas);

  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Mercado en vivo · Chile
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Activity className="h-4 w-4 text-primary" /> Cargas publicadas hoy
            </p>
            <p className="mt-2 text-3xl font-extrabold text-foreground">{c.toLocaleString("es-CL")}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-primary" /> Promedio tarifa por km
            </p>
            <p className="mt-2 text-3xl font-extrabold text-foreground">
              ${t.toLocaleString("es-CL")}<span className="text-base font-bold text-muted-foreground">/km</span>
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" /> Rutas activas
            </p>
            <p className="mt-2 text-3xl font-extrabold text-foreground">{r.toLocaleString("es-CL")}</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              Santiago · Concepción · Antofagasta · Los Ángeles
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex gap-6 whitespace-nowrap px-4 py-2 text-xs font-medium text-muted-foreground">
            {RUTAS.map((ruta) => (
              <span key={ruta} className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {ruta}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Filtros rápidos por tipo de equipo
          </p>
          <div className="flex flex-wrap gap-2">
            {EQUIPOS.map((e) => {
              const activo = equipo === e.value;
              return (
                <button
                  key={e.value}
                  type="button"
                  onClick={() => onEquipoChange(activo ? "todas" : e.value)}
                  className={cn(
                    "cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
                    activo
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-primary hover:text-primary",
                  )}
                >
                  {e.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
