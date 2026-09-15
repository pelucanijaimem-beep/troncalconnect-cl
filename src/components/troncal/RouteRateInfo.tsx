import { TrendingUp } from "lucide-react";
import { money, type PaisCodigo } from "@/lib/troncal-data";
import { useTarifaRuta } from "@/lib/use-tarifas-ruta";

/** Promedio histórico real de $/km pagado en la ruta, con datos de la plataforma. */
export function RouteRateInfo({
  origen,
  destino,
  pais,
  className = "",
}: {
  origen: string;
  destino: string;
  pais: PaisCodigo;
  className?: string | undefined;
}) {
  const { promedio, registros, cargando } = useTarifaRuta(origen, destino);

  if (cargando) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-surface px-2 py-1 text-xs font-semibold ${
        promedio ? "text-foreground" : "text-muted-foreground"
      } ${className}`}
      title="Promedio calculado con viajes completados en esta ruta dentro de TroncalTrack"
    >
      <TrendingUp className="h-3.5 w-3.5 text-primary" />
      {promedio
        ? `Promedio histórico de la ruta: ${money(promedio, pais)} / km (${registros} viajes)`
        : "Sin datos suficientes aún en esta ruta"}
    </span>
  );
}

/** Distintivo del tipo de publicador de la carga. */
export function PublisherBadge({
  tipo,
  className = "",
}: {
  tipo?: "generador" | "intermediario" | undefined;
  className?: string | undefined;
}) {
  const esGenerador = (tipo ?? "generador") === "generador";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
        esGenerador ? "bg-success-soft text-success" : "bg-warning/15 text-warning"
      } ${className}`}
      title={
        esGenerador
          ? "La empresa declara que la carga es propia."
          : "La empresa declara que gestiona la carga de un tercero."
      }
    >
      {esGenerador ? "Generador de Carga Directo" : "Intermediario / Comisionista"}
    </span>
  );
}
