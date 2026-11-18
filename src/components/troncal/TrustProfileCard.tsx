import { HandCoins, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "./VerificationBadge";
import { VerificationChecklist } from "./VerificationChecklist";
import { RatingSummary } from "./StarRating";
import { ReviewsList } from "./ReviewsList";
import { useVerificacion, type RolVerificacion } from "@/lib/use-verificacion";
import { reputacionDe, useReputacion, useResenas } from "@/lib/use-calificaciones";

export function TrustProfileCard({
  usuario,
  userId,
  onVerificar,
  rol = "camionero",
}: {
  usuario: string;
  userId?: string | undefined;
  onVerificar: () => void;
  rol?: RolVerificacion;
}) {
  const verificacion = useVerificacion(usuario);
  const reputacion = useReputacion();
  const { promedio, total } = reputacionDe(reputacion, userId);
  const resenas = useResenas(userId, 5);
  const pagosPuntuales = resenas.filter((r) => r.etiquetas.includes("Pago puntual")).length;
  const buenHistorialPago =
    pagosPuntuales >= 2 && !resenas.some((r) => r.etiquetas.includes("Atraso en pago"));

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
            {buenHistorialPago && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">
                <HandCoins className="h-3.5 w-3.5" /> Buen historial de pago ({pagosPuntuales}{" "}
                viajes)
              </span>
            )}
          </div>
        </div>
        <Button className="w-full sm:w-auto" onClick={onVerificar}>
          {verificacion.estado === "verificado"
            ? "Actualizar documentos"
            : "Verificación de Identidad"}
        </Button>
      </div>

      <div className="mt-4">
        <VerificationChecklist checklist={verificacion.checklist} compacto rol={rol} />
      </div>


      {resenas.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <ReviewsList resenas={resenas} titulo="Últimas reseñas recibidas" />
        </div>
      )}

    </section>
  );
}
