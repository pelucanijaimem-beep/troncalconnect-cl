import { MapPin, Navigation, Satellite, Truck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Carga } from "@/lib/troncal-data";
import type { Viaje } from "@/lib/use-trip-tracking";

function tiempo(ms: number) {
  const min = Math.floor(ms / 60000);
  const h = Math.floor(min / 60);
  return h > 0 ? `${h} h ${min % 60} min` : `${min} min`;
}

export function TrackingDialog({
  carga,
  viaje,
  onOpenChange,
}: {
  carga: Carga | null;
  viaje: Viaje | null;
  onOpenChange: (o: boolean) => void;
}) {
  const avance = viaje?.avance ?? 0;
  const x = 40 + avance * 460;
  const y = 150 - Math.sin(avance * Math.PI) * 55;
  const enRuta = viaje?.estado === "en_ruta";

  return (
    <Dialog open={!!carga} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {carga && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Satellite className="h-5 w-5 text-primary" /> Rastreo en vivo del viaje
              </DialogTitle>
              <DialogDescription>
                {carga.origen} → {carga.destino} · {carga.km} km · {carga.empresa}
              </DialogDescription>
            </DialogHeader>

            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <svg viewBox="0 0 540 220" className="h-56 w-full" role="img" aria-label="Mapa de la ruta">
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border" />
                  </pattern>
                </defs>
                <rect width="540" height="220" fill="url(#grid)" />
                <path
                  d="M 40 150 Q 270 40 500 150"
                  fill="none"
                  strokeWidth="5"
                  strokeLinecap="round"
                  className="stroke-border"
                />
                <path
                  d="M 40 150 Q 270 40 500 150"
                  fill="none"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="600"
                  strokeDashoffset={600 - avance * 600}
                  className="stroke-primary"
                />
                <circle cx="40" cy="150" r="7" className="fill-foreground" />
                <circle cx="500" cy="150" r="7" className="fill-primary" />
                <text x="40" y="180" textAnchor="middle" className="fill-current text-[11px] text-muted-foreground">
                  {carga.origen}
                </text>
                <text x="500" y="180" textAnchor="middle" className="fill-current text-[11px] text-muted-foreground">
                  {carga.destino}
                </text>
                <g transform={`translate(${x - 12}, ${y - 26})`}>
                  <circle cx="12" cy="12" r="16" className="fill-primary/20" />
                  <circle cx="12" cy="12" r="11" className="fill-primary" />
                </g>
              </svg>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-3">
                <dt className="text-muted-foreground">Estado</dt>
                <dd className="font-bold text-foreground">
                  {enRuta ? "En Ruta - GPS Activo" : viaje?.estado === "entregada" ? "Entregada" : "Sin iniciar"}
                </dd>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <dt className="text-muted-foreground">Avance</dt>
                <dd className="font-bold text-primary">{Math.round(avance * 100)}%</dd>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <dt className="text-muted-foreground">Kilómetros recorridos</dt>
                <dd className="font-bold text-foreground">{Math.round(carga.km * avance)} km</dd>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <dt className="text-muted-foreground">Tiempo en ruta</dt>
                <dd className="font-bold text-foreground">
                  {viaje?.inicio ? tiempo((viaje.fin ?? Date.now()) - viaje.inicio) : "—"}
                </dd>
              </div>
            </dl>

            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              {viaje?.posicion ? (
                <>
                  <MapPin className="h-4 w-4 text-primary" />
                  Posición {viaje.posicion.simulada ? "estimada por ruta" : "GPS del conductor"}:{" "}
                  {viaje.posicion.lat.toFixed(5)}, {viaje.posicion.lng.toFixed(5)}
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4" />
                  Esperando la primera señal GPS del conductor…
                </>
              )}
            </p>

            <p className="flex items-center gap-2 rounded-lg bg-surface p-3 text-sm text-foreground">
              <Truck className="h-4 w-4 text-primary" />
              El conductor comparte su ubicación mientras el viaje esté activo. El rastreo se
              detiene automáticamente al marcar la carga como entregada.
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
