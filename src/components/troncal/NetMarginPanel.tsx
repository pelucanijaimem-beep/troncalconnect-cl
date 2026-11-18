import { Info, TrendingDown, TrendingUp } from "lucide-react";
import { money } from "@/lib/troncal-data";

/** Highlighted net margin for the carrier: total freight minus fuel and tolls. */
export function NetMarginPanel({ neto, porKm }: { neto: number; porKm: number }) {
  const positivo = neto >= 0;
  const Icono = positivo ? TrendingUp : TrendingDown;
  return (
    <div
      className={`mt-3 flex flex-col gap-1 rounded-lg border px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 ${
        positivo ? "border-success/30 bg-success-soft" : "border-warning/40 bg-warning/10"
      }`}
    >
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          Margen Operativo Estimado
        </p>
        <p className={`flex flex-wrap items-baseline gap-x-2 text-lg font-extrabold ${positivo ? "text-success" : "text-foreground"}`}>
          <span className="inline-flex items-center gap-1">
            <Icono className="h-4 w-4" /> {money(neto)}
          </span>
          <span className="text-sm font-semibold">{money(porKm)} / km neto</span>
        </p>
      </div>
      <p className="inline-flex items-start gap-1 text-[11px] leading-snug text-muted-foreground sm:max-w-[16rem] sm:text-right">
        <Info className="mt-0.5 h-3 w-3 shrink-0" />
        <span>Cálculo referencial basado en tarifa estándar Ruta 5 (total − diésel − peajes).</span>
      </p>
    </div>
  );
}
