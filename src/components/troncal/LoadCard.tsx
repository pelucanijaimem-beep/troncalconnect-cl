import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Package,
  Phone,
  PlayCircle,
  Satellite,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { money, type Carga } from "@/lib/troncal-data";
import type { Viaje } from "@/lib/use-trip-tracking";
import type { Rol } from "./RoleSwitcher";
import { VerificationBadge } from "./VerificationBadge";
import { RatingSummary } from "./StarRating";
import { useVerificacion } from "@/lib/use-verificacion";
import { resumen, useCalificaciones } from "@/lib/use-calificaciones";

export function LoadCard({
  carga,
  rol,
  viaje,
  onDetalles,
  onContactar,
  onIniciar,
  onFinalizar,
  onRastrear,
  onVerViaje,
}: {
  carga: Carga;
  rol: Rol;
  viaje: Viaje;
  onDetalles: (c: Carga) => void;
  onContactar: (c: Carga) => void;
  onIniciar: (c: Carga) => void;
  onFinalizar: (c: Carga) => void;
  onRastrear: (c: Carga) => void;
  onVerViaje: (c: Carga) => void;
}) {
  const verificacion = useVerificacion(carga.empresa);
  const calificaciones = useCalificaciones();
  const { promedio, total: totalEval } = resumen(calificaciones, carga.empresa);
  const montoTotal = carga.km * carga.valorKm;
  const enRuta = viaje.estado === "en_ruta";
  const entregada = viaje.estado === "entregada";


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
          <p className="text-xl font-extrabold text-primary">
            {money(carga.valorKm, carga.pais)} / km
          </p>
          <p className="text-sm font-semibold text-foreground">
            Total: {money(montoTotal, carga.pais)}
          </p>
        </div>
      </div>

      {(enRuta || entregada) && (
        <div className="mt-3">
          {enRuta ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              En Ruta - GPS Activo · {Math.round(viaje.avance * 100)}%
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success">
              <CheckCircle2 className="h-3.5 w-3.5" /> Carga entregada
            </span>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <span className="text-sm font-medium text-foreground">{carga.empresa}</span>
        <VerificationBadge estado={verificacion.estado} asegurado={verificacion.asegurado} compacto />
        <RatingSummary promedio={promedio} total={totalEval} />
        {carga.soloVerificados && (
          <span className="inline-flex items-center gap-1 rounded-full bg-trust-soft px-2 py-0.5 text-xs font-semibold text-trust">
            <ShieldCheck className="h-3.5 w-3.5" /> Exclusiva para verificados
          </span>
        )}
        <div className="ml-auto flex w-full flex-wrap gap-2 sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => onDetalles(carga)}>
            Ver Detalles
          </Button>

          {rol === "camionero" ? (
            <>
              <Button
                variant="outline"
                className="flex-1 sm:flex-none"
                onClick={() => onContactar(carga)}
              >
                <Phone className="h-4 w-4" /> Contactar
              </Button>
              {!enRuta && !entregada && (
                <Button className="flex-1 sm:flex-none" onClick={() => onIniciar(carga)}>
                  <PlayCircle className="h-4 w-4" /> Iniciar Viaje
                </Button>
              )}
              {enRuta && (
                <>
                  <Button className="flex-1 sm:flex-none" onClick={() => onVerViaje(carga)}>
                    <Satellite className="h-4 w-4" /> Ver Viaje Activo
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-none"
                    onClick={() => onFinalizar(carga)}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Carga Entregada
                  </Button>
                </>
              )}
            </>
          ) : (
            <Button
              className="flex-1 sm:flex-none"
              variant={enRuta ? "default" : "outline"}
              onClick={() => onRastrear(carga)}
            >
              <Satellite className="h-4 w-4" /> Rastrear Carga
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
