import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { MapPin, Radio, Satellite, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCamionesDisponibles, useMiDisponibilidad } from "@/lib/use-disponibilidad";

const AvailabilityMap = lazy(() => import("./AvailabilityMap"));

function MapaSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-surface text-sm text-muted-foreground">
      Cargando mapa…
    </div>
  );
}

export function AvailabilityPanel({
  esCamionero,
  usuario,
}: {
  esCamionero: boolean;
  usuario: { id?: string; nombre?: string; telefono?: string };
}) {
  const camiones = useCamionesDisponibles();
  const { activo, error, posicion, activar, desactivar } = useMiDisponibilidad(usuario);

  return (
    <section className="mt-6 overflow-hidden rounded-xl border border-border bg-card shadow-card">
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0 flex-1">
          <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
            <Satellite className="h-5 w-5 text-primary" />
            {esCamionero ? "Mapa en vivo · Disponible en Ruta" : "Camiones disponibles en vivo"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {esCamionero
              ? "Activa tu disponibilidad para que las empresas vean tu camión en tiempo real."
              : "Camiones que están compartiendo su posición GPS en este momento."}
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs font-bold text-foreground">
          <Radio className="h-3.5 w-3.5 text-primary" />
          {camiones.length} en línea
        </span>

        {esCamionero && (
          <Button
            className="w-full cursor-pointer sm:w-auto"
            variant={activo ? "outline" : "default"}
            onClick={() => (activo ? desactivar() : activar())}
          >
            <MapPin className="h-4 w-4" />
            {activo ? "Desactivar disponibilidad" : "Disponible en Ruta"}
          </Button>
        )}
      </div>

      {esCamionero && (
        <div className="border-b border-border px-4 py-2 text-sm">
          {error ? (
            <p className="text-primary">{error}</p>
          ) : activo ? (
            <p className="flex flex-wrap items-center gap-2 font-semibold text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Transmitiendo GPS
              {posicion && (
                <span className="font-normal text-muted-foreground">
                  · {posicion.lat.toFixed(4)}, {posicion.lng.toFixed(4)} · {posicion.velocidad} km/h
                </span>
              )}
            </p>
          ) : (
            <p className="text-muted-foreground">
              Tu ubicación está apagada. Nadie puede ver tu posición.
            </p>
          )}
        </div>
      )}

      <div className="relative h-[340px] w-full sm:h-[420px]">
        <ClientOnly fallback={<MapaSkeleton />}>
          <Suspense fallback={<MapaSkeleton />}>
            <AvailabilityMap camiones={camiones} {...(usuario.id ? { miId: usuario.id } : {})} />
          </Suspense>
        </ClientOnly>

        {camiones.length === 0 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-[1000] flex justify-center px-4">
            <p className="rounded-full bg-card/95 px-4 py-2 text-center text-xs font-medium text-muted-foreground shadow-lg">
              {esCamionero
                ? "Activa “Disponible en Ruta” para aparecer en el mapa."
                : "Ningún camión está transmitiendo su posición en este momento."}
            </p>
          </div>
        )}
      </div>

      <p className="flex items-start gap-2 border-t border-border px-4 py-3 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        Por privacidad, la ubicación se comparte solo mientras la disponibilidad está activa y se
        elimina al desactivarla.
      </p>
    </section>
  );
}
