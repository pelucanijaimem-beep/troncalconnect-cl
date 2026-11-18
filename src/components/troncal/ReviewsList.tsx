import { MessageSquareQuote, ThumbsDown, ThumbsUp } from "lucide-react";
import { StarRating } from "./StarRating";
import { esEtiquetaNegativa } from "@/lib/calificacion-viaje";
import type { Resena } from "@/lib/use-calificaciones";

/** Historial de las últimas reseñas de un viaje entregado y conforme. */
export function ReviewsList({
  resenas,
  titulo = "Últimas reseñas",
  vacio,
}: {
  resenas: Resena[];
  titulo?: string;
  vacio?: string;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {titulo}
      </h3>
      {resenas.length === 0 ? (
        <p className="text-xs text-muted-foreground">{vacio ?? "Aún no tiene reseñas de viajes."}</p>
      ) : (
        <ul className="space-y-2">
          {resenas.map((r) => (
            <li key={r.id} className="rounded-lg border border-border bg-surface p-3">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <StarRating valor={r.estrellas} size={14} />
                <span className="text-xs font-semibold text-foreground">{r.autor}</span>
                <span className="text-xs text-muted-foreground">· {r.ruta}</span>
                <span className="text-xs text-muted-foreground">
                  · {new Date(r.fecha).toLocaleDateString("es-CL")}
                </span>
              </div>
              {r.etiquetas.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {r.etiquetas.map((e) => {
                    const negativa = esEtiquetaNegativa(r.tipo, e);
                    return (
                      <span
                        key={e}
                        className={
                          negativa
                            ? "inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive"
                            : "inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success"
                        }
                      >
                        {negativa ? (
                          <ThumbsDown className="h-3 w-3" />
                        ) : (
                          <ThumbsUp className="h-3 w-3" />
                        )}
                        {e}
                      </span>
                    );
                  })}
                </div>
              )}
              {r.comentario && (
                <p className="mt-2 flex items-start gap-1.5 text-sm text-foreground">
                  <MessageSquareQuote className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 break-words">{r.comentario}</span>
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
