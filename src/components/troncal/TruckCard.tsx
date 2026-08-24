import { ArrowRight, BadgeCheck, CalendarDays, Phone, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Camion } from "@/lib/troncal-data";

export function TruckCard({ camion }: { camion: Camion }) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-card transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="flex flex-wrap items-center gap-x-2 text-base font-bold text-foreground sm:text-lg">
            <span>{camion.origen}</span>
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>{camion.destino}</span>
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Truck className="h-4 w-4" />
              {camion.carroceria} · {camion.toneladas} Toneladas
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              Disponible el {new Date(camion.fecha + "T00:00:00").toLocaleDateString("es-CL")}
            </span>
          </p>
          <p className="mt-2 text-sm text-foreground">{camion.detalle}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <span className="text-sm font-medium text-foreground">{camion.conductor}</span>
        {camion.verificado && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">
            <BadgeCheck className="h-3.5 w-3.5" /> Camionero Verificado
          </span>
        )}
        <Button asChild className="ml-auto w-full sm:w-auto">
          <a href={`tel:${camion.telefono.replace(/\s/g, "")}`}>
            <Phone className="h-4 w-4" /> Contactar / Llamar
          </a>
        </Button>
      </div>
    </article>
  );
}
