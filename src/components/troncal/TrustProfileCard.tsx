import { MessageSquareQuote, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerificationBadge, VerificationDisclaimer } from "./VerificationBadge";
import { RatingSummary, StarRating } from "./StarRating";
import { useVerificacion } from "@/lib/use-verificacion";
import { resumen, useCalificaciones } from "@/lib/use-calificaciones";

export function TrustProfileCard({
  usuario,
  onVerificar,
}: {
  usuario: string;
  onVerificar: () => void;
}) {
  const verificacion = useVerificacion(usuario);
  const calificaciones = useCalificaciones();
  const { promedio, total, propias } = resumen(calificaciones, usuario);

  return (
    <section
      id="troncalcheck"
      className="rounded-xl border border-border bg-card p-4 shadow-card"
    >
      <div className="flex flex-wrap items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-trust-soft text-trust">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-extrabold text-foreground sm:text-lg">
            TroncalCheck — Perfil de Confianza
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{usuario}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <VerificationBadge estado={verificacion.estado} asegurado={verificacion.asegurado} />
            <RatingSummary promedio={promedio} total={total} />
          </div>
        </div>
        <Button className="w-full sm:w-auto" onClick={onVerificar}>
          {verificacion.estado === "verificado"
            ? "Actualizar documentos"
            : "Verificación de Identidad"}
        </Button>
      </div>

      {propias.length > 0 && (
        <div className="mt-4 space-y-3 border-t border-border pt-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Comentarios recibidos
          </h3>
          {propias.slice(0, 4).map((c) => (
            <div key={c.id} className="rounded-lg border border-border bg-surface p-3">
              <div className="flex flex-wrap items-center gap-2">
                <StarRating valor={c.estrellas} size={14} />
                <span className="text-xs font-semibold text-foreground">{c.autor}</span>
                <span className="text-xs text-muted-foreground">· {c.ruta}</span>
              </div>
              <p className="mt-1 flex items-start gap-1.5 text-sm text-foreground">
                <MessageSquareQuote className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                {c.comentario}
              </p>
            </div>
          ))}
        </div>
      )}

      <VerificationDisclaimer className="mt-4 border-t border-border pt-3" />
    </section>
  );
}
