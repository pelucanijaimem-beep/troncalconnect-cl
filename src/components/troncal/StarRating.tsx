import { textoReputacion } from "@/lib/calificacion-viaje";
import { Star } from "lucide-react";

export function StarRating({
  valor,
  onChange,
  size = 16,
}: {
  valor: number;
  onChange?: (v: number) => void;
  size?: number;
}) {
  const estrellas = [1, 2, 3, 4, 5];
  return (
    <span className="inline-flex items-center gap-0.5">
      {estrellas.map((n) => {
        const activa = n <= Math.round(valor);
        const icono = (
          <Star
            style={{ width: size, height: size }}
            className={activa ? "fill-warning text-warning" : "text-muted-foreground"}
          />
        );
        return onChange ? (
          <button
            key={n}
            type="button"
            aria-label={`${n} estrellas`}
            onClick={() => onChange(n)}
            className="cursor-pointer p-0.5"
          >
            {icono}
          </button>
        ) : (
          <span key={n}>{icono}</span>
        );
      })}
    </span>
  );
}

/** Reputación compacta: "★ 4.9 (14 viajes)" o "Nuevo en TroncalTrack". */
export function RatingSummary({ promedio, total }: { promedio: number; total: number }) {
  if (!total) {
    return (
      <span className="inline-flex items-center rounded-full bg-surface px-2 py-0.5 text-xs font-semibold text-muted-foreground">
        {textoReputacion(0, 0)}
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold text-foreground"
      aria-label={`Promedio ${promedio.toFixed(1)} de 5 en ${total} ${total === 1 ? "viaje calificado" : "viajes calificados"}`}
    >
      <Star className="h-3.5 w-3.5 fill-warning text-warning" />
      {textoReputacion(promedio, total).replace(/^★ /, "")}
    </span>
  );
}
