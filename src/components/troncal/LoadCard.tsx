import { ArrowRight, BadgeCheck, CalendarDays, Package, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clp, type Carga } from "@/lib/troncal-data";

export function LoadCard({ carga, onDetalles }: { carga: Carga; onDetalles: (c: Carga) => void }) {
  const total = carga.km * carga.valorKm;
  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-card transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="flex flex-wrap items-center gap-x-2 text-base font-bold text-foreground sm:text-lg">
            <span>{carga.origen}</span>
            <ArrowRight className="h-4 w-4 text-primary" />
            <span>{carga.destino}</span>
            <span className="text-sm font-medium text-muted-foreground">({carga.km} km)</span>
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Package className="h-4 w-4" />
              {carga.carroceria} · {carga.toneladas} Toneladas
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              {new Date(carga.fecha + "T00:00:00").toLocaleDateString("es-CL")}
            </span>
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-xl font-extrabold text-primary">{clp(carga.valorKm)} / km</p>
          <p className="text-sm font-semibold text-foreground">Total: {clp(total)} CLP</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <span className="text-sm font-medium text-foreground">{carga.empresa}</span>
        {carga.verificada && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">
            <BadgeCheck className="h-3.5 w-3.5" /> Empresa Verificada
          </span>
        )}
        <div className="ml-auto flex w-full gap-2 sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => onDetalles(carga)}>
            Ver Detalles
          </Button>
          <Button asChild className="flex-1 sm:flex-none">
            <a href={`tel:${carga.telefono.replace(/\s/g, "")}`}>
              <Phone className="h-4 w-4" /> Contactar / Llamar
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}
