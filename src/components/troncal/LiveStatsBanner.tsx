import { useState } from "react";
import { MapPin, Percent, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const EQUIPOS = [
  { label: "Rampla / Sider", value: "Sider" },
  { label: "Plataforma", value: "Rampla Plana" },
  { label: "Frigorífico", value: "Thermo / Frigo" },
  { label: "Cama Baja", value: "Cama Baja" },
  { label: "Tolva", value: "Tolva" },
  { label: "Estanque", value: "Estanque" },
  { label: "Camión 3/4", value: "Camión 3/4" },
  { label: "Furgón", value: "Furgón" },
  { label: "Carga Parcial (LTL)", value: "Furgón" },
];

export function LiveStatsBanner({
  tarifaKm,
  equipo,
  onEquipoChange,
}: {
  /** Promedio real $/km de los fletes publicados; 0 si aún no hay datos. */
  tarifaKm: number;
  equipo: string;
  onEquipoChange: (v: string) => void;
}) {
  const [elegido, setElegido] = useState<string | null>(null);

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
              <MapPin className="h-4 w-4 text-primary" /> Corredor activo
            </p>
            <p className="mt-2 text-xl font-extrabold text-foreground sm:text-2xl">
              Arica a Puerto Montt
              <span className="block text-sm font-bold text-muted-foreground">Ruta 5</span>
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-primary" /> Tarifa promedio referencial
            </p>
            <p className="mt-2 text-xl font-extrabold text-foreground sm:text-2xl">
              {tarifaKm > 0 ? (
                <>
                  ${tarifaKm.toLocaleString("es-CL")}
                  <span className="text-base font-bold text-muted-foreground">/km</span>
                </>
              ) : (
                <>
                  Por kilómetro
                  <span className="block text-sm font-bold text-muted-foreground">
                    Calculada con fletes reales
                  </span>
                </>
              )}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Percent className="h-4 w-4 text-primary" /> Comisión por viaje
            </p>
            <p className="mt-2 text-xl font-extrabold text-foreground sm:text-2xl">
              0%
              <span className="block text-sm font-bold text-muted-foreground">
                Solo suscripción, sin cobro por flete
              </span>
            </p>
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Filtros rápidos por tipo de equipo
          </p>
          <div className="flex flex-wrap gap-2">
            {EQUIPOS.map((e) => {
              const activo =
                equipo === e.value &&
                (elegido ? elegido === e.label : EQUIPOS.find((x) => x.value === equipo)?.label === e.label);
              return (
                <button
                  key={e.label}
                  type="button"
                  aria-pressed={activo}
                  onClick={() => {
                    setElegido(activo ? null : e.label);
                    onEquipoChange(activo ? "todas" : e.value);
                  }}
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
