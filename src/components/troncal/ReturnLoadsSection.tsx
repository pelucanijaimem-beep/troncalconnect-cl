import { CornerUpLeft, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Carga } from "@/lib/troncal-data";
import { sugerenciasRetorno } from "@/lib/retorno";

/**
 * "Cargas de retorno para ti": cargas publicadas cerca del destino del viaje
 * en curso o recién terminado, para evitar volver con el camión vacío.
 */
export function ReturnLoadsSection({
  destino,
  carroceria,
  excluirId,
  cargas,
  onDetalles,
  onCerrar,
}: {
  destino: string;
  carroceria?: string;
  excluirId?: string;
  cargas: Carga[];
  onDetalles: (c: Carga) => void;
  onCerrar: () => void;
}) {
  const sugerencias = sugerenciasRetorno(cargas, destino, carroceria, excluirId);

  return (
    <section className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-foreground">
            <CornerUpLeft className="h-5 w-5 text-primary" /> Cargas de retorno para ti
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Fletes publicados cerca de {destino}, tu destino actual. Evita volver con el camión
            vacío.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onCerrar} aria-label="Ocultar cargas de retorno">
          <X className="h-4 w-4" /> Ocultar
        </Button>
      </div>

      {sugerencias.length === 0 ? (
        <p className="mt-3 rounded-lg border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
          Todavía no hay cargas publicadas cerca de {destino}. Activa tus alertas de coincidencia
          para enterarte apenas se publique una.
        </p>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {sugerencias.map((s) => (
            <button
              key={s.carga.id}
              onClick={() => onDetalles(s.carga)}
              className="rounded-lg border border-border bg-card p-3 text-left transition hover:border-primary"
            >
              <p className="flex items-center gap-1 text-sm font-bold text-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                {s.carga.origen} → {s.carga.destino}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {s.carga.carroceria} · {s.carga.toneladas} Ton · {s.carga.km} km
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {s.cercania === "misma_ciudad" ? "En tu destino" : "En la misma región"}
                </span>
                {s.mismoEquipo && (
                  <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                    Calza con tu equipo
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
