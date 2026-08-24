import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { MessageCircle, Phone, Route, Satellite, ShieldCheck, Timer } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Carga } from "@/lib/troncal-data";
import type { Viaje } from "@/lib/use-trip-tracking";
import { metricasViaje } from "@/lib/trip-metrics";

const LiveMap = lazy(() => import("./LiveMap"));

function MapaSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-surface text-sm text-muted-foreground">
      Cargando mapa en vivo…
    </div>
  );
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
  if (!carga) return null;
  const m = metricasViaje(carga, viaje);
  const enRuta = viaje?.estado === "en_ruta";
  const tel = carga.telefono.replace(/[^\d+]/g, "");

  return (
    <Dialog open={!!carga} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="h-[100dvh] w-screen max-w-none gap-0 overflow-hidden rounded-none border-0 p-0 sm:max-w-none"
      >
        <DialogHeader className="border-b border-border bg-card px-4 py-3">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Satellite className="h-5 w-5 text-primary" /> Rastreo en vivo — {carga.origen} →{" "}
            {carga.destino}
          </DialogTitle>
          <DialogDescription>
            {enRuta
              ? "El camión transmite su posición GPS en tiempo real."
              : "El rastreo se activa cuando el chofer inicia el viaje."}
          </DialogDescription>
        </DialogHeader>

        <div className="relative h-full w-full">
          <ClientOnly fallback={<MapaSkeleton />}>
            <Suspense fallback={<MapaSkeleton />}>
              <LiveMap
                origen={m.origen}
                destino={m.destino}
                actual={m.actual}
                etiquetaOrigen={carga.origen}
                etiquetaDestino={carga.destino}
                activo={!!enRuta}
              />
            </Suspense>
          </ClientOnly>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1000] p-3 sm:inset-x-auto sm:bottom-4 sm:left-4 sm:w-96 sm:p-0">
            <div className="pointer-events-auto rounded-2xl border border-border bg-card p-4 shadow-lg">
              {enRuta ? (
                <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  En ruta · GPS activo
                </p>
              ) : (
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {viaje?.estado === "entregada" ? "Viaje finalizado · GPS apagado" : "Viaje no iniciado"}
                </p>
              )}

              <p className="mt-2 flex items-center gap-2 text-lg font-extrabold text-foreground">
                <Timer className="h-5 w-5 text-primary" />
                Llegada estimada a {carga.destino}: {m.etaTexto} hrs
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-surface p-2">
                  <p className="text-muted-foreground">Recorrido</p>
                  <p className="font-bold text-foreground">{m.kmRecorridos} km</p>
                </div>
                <div className="rounded-lg bg-surface p-2">
                  <p className="text-muted-foreground">Restante</p>
                  <p className="font-bold text-foreground">{m.kmRestantes} km</p>
                </div>
                <div className="rounded-lg bg-surface p-2">
                  <p className="text-muted-foreground">Velocidad</p>
                  <p className="font-bold text-foreground">{Math.round(m.velocidad)} km/h</p>
                </div>
                <div className="rounded-lg bg-surface p-2">
                  <p className="flex items-center gap-1 text-muted-foreground">
                    <Route className="h-3.5 w-3.5" /> Tiempo en ruta
                  </p>
                  <p className="font-bold text-foreground">{m.tiempoEnRuta}</p>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <Button asChild className="flex-1">
                  <a href={`tel:${tel}`}>
                    <Phone className="h-4 w-4" /> Llamar al Chofer
                  </a>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <a
                    href={`https://wa.me/${tel.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                </Button>
              </div>

              <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Por privacidad, la ubicación solo se comparte durante el viaje y se elimina al
                marcar la carga como entregada.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
