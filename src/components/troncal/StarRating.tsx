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

export function RatingSummary({ promedio, total }: { promedio: number; total: number }) {
  if (!total) {
    return <span className="text-xs text-muted-foreground">Sin calificaciones aún</span>;
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
      <StarRating valor={promedio} size={14} />
      {promedio.toFixed(1)} ({total} {total === 1 ? "evaluación" : "evaluaciones"})
    </span>
  );
}
