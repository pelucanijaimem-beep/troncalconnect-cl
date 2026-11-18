import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CalificacionPendiente } from "@/lib/use-calificaciones";

/** Viajes entregados y conformes que el usuario todavía no califica. */
export function PendingRatingsCard({
  pendientes,
  onCalificar,
}: {
  pendientes: CalificacionPendiente[];
  onCalificar: (p: CalificacionPendiente) => void;
}) {
  if (pendientes.length === 0) return null;
  return (
    <section className="rounded-xl border border-warning/40 bg-card p-4 shadow-card">
      <h2 className="flex items-center gap-2 text-base font-extrabold text-foreground">
        <Star className="h-5 w-5 fill-warning text-warning" /> Calificar Experiencia del Viaje
      </h2>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Estos viajes fueron confirmados como entregados y conformes. Tu calificación construye
        reputación verificada.
      </p>
      <ul className="mt-3 space-y-2">
        {pendientes.map((p) => (
          <li
            key={p.cargaId}
            className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">{p.ruta}</p>
              <p className="text-xs text-muted-foreground">
                {p.tipo === "a_empresa" ? "Empresa generadora" : "Transportista"}: {p.contraparte}
              </p>
            </div>
            <Button size="sm" className="w-full sm:w-auto" onClick={() => onCalificar(p)}>
              Calificar
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
