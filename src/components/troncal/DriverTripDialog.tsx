import { CheckCircle2, Gauge, MapPin, Radio, Route, Timer } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Carga } from "@/lib/troncal-data";
import type { Viaje } from "@/lib/use-trip-tracking";
import { metricasViaje } from "@/lib/trip-metrics";

export function DriverTripDialog({
  carga,
  viaje,
  compartiendo = false,
  gpsObligatorio = false,
  errorUbicacion = null,
  onCompartirUbicacion,
  onFinalizar,
  onOpenChange,
}: {
  carga: Carga | null;
  viaje: Viaje | null;
  compartiendo?: boolean;
  gpsObligatorio?: boolean;
  errorUbicacion?: string | null;
  onCompartirUbicacion?: (activar: boolean) => void;
  onFinalizar: (c: Carga) => void;
  onOpenChange: (o: boolean) => void;
}) {
  if (!carga) return null;
  const m = metricasViaje(carga, viaje);
  const enRuta = viaje?.estado === "en_ruta";

  return (
    <Dialog open={!!carga} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary" /> Viaje activo
          </DialogTitle>
          <DialogDescription>
            {carga.origen} → {carga.destino} · {carga.km} km · {carga.empresa}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <p className="inline-flex items-center gap-2 text-sm font-bold text-primary">
            <span className="relative flex h-2.5 w-2.5">
              {enRuta && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              )}
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
            </span>
            {enRuta ? "Transmitiendo Ubicación GPS" : "GPS apagado"}
          </p>
          <p className="mt-3 text-5xl font-extrabold tracking-tight text-foreground">
            {Math.round(m.velocidad)}
            <span className="ml-1 text-lg font-semibold text-muted-foreground">km/h</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Velocidad actual del vehículo</p>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-surface">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.round(m.avance * 100)}%` }}
          />
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-border bg-card p-3">
            <dt className="flex items-center gap-1 text-muted-foreground">
              <Route className="h-4 w-4" /> Distancia restante
            </dt>
            <dd className="text-lg font-bold text-foreground">{m.kmRestantes} km</dd>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <dt className="flex items-center gap-1 text-muted-foreground">
              <Gauge className="h-4 w-4" /> Recorrido
            </dt>
            <dd className="text-lg font-bold text-foreground">{m.kmRecorridos} km</dd>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <dt className="flex items-center gap-1 text-muted-foreground">
              <Timer className="h-4 w-4" /> Llegada estimada
            </dt>
            <dd className="text-lg font-bold text-primary">{m.etaTexto} hrs</dd>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <dt className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" /> Señal
            </dt>
            <dd className="text-sm font-bold text-foreground">
              {m.gpsReal ? "GPS del dispositivo" : "Estimada por ruta"}
            </dd>
          </div>
        </dl>

        {onCompartirUbicacion && (
          <div
            className={`rounded-xl border p-4 ${
              compartiendo ? "border-primary/40 bg-primary/5" : "border-border bg-surface"
            }`}
          >
            <p className="flex items-center gap-2 text-sm font-bold text-foreground">
              <MapPin className="h-4 w-4 text-primary" />{" "}
              {gpsObligatorio ? "GPS obligatorio en este viaje" : "Compartir mi ubicación en este viaje"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {gpsObligatorio
                ? "Tu plan de flota exige transmitir la ubicación GPS mientras el viaje está activo, por seguridad de ambas partes. Solo se usa el GPS del teléfono, ningún otro dato, y se apaga y elimina sola al confirmar la entrega."
                : "Es opcional. Si lo activas, solo la empresa dueña de esta carga verá tu ubicación aproximada, y se apaga sola al confirmar la entrega."}
            </p>
            {errorUbicacion && (
              <p className="mt-2 text-xs font-semibold text-destructive">{errorUbicacion}</p>
            )}
            {!(gpsObligatorio && compartiendo) && (
              <Button
                variant={compartiendo ? "outline" : "default"}
                className="mt-3 w-full"
                disabled={!enRuta}
                onClick={() => onCompartirUbicacion(gpsObligatorio ? true : !compartiendo)}
              >
                {gpsObligatorio
                  ? "Activar GPS del viaje"
                  : compartiendo
                    ? "Dejar de compartir mi ubicación"
                    : "Compartir mi ubicación"}
              </Button>
            )}
            {compartiendo && (
              <p className="mt-2 text-center text-xs font-semibold text-foreground">
                Compartiendo tu ubicación con la empresa de esta carga.
              </p>
            )}
          </div>
        )}


        <Button
          size="lg"
          className="h-14 w-full text-base font-bold"
          disabled={!enRuta}
          onClick={() => onFinalizar(carga)}
        >
          <CheckCircle2 className="h-5 w-5" /> Confirmar Entrega en Destino
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Pide al receptor el código de 6 dígitos. Al confirmar se apaga el GPS y se elimina tu ubicación en vivo.
        </p>
      </DialogContent>
    </Dialog>
  );
}
