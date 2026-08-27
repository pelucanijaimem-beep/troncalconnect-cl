import { BadgeCheck, Clock, ShieldAlert, ShieldCheck } from "lucide-react";
import type { EstadoVerificacion } from "@/lib/use-verificacion";

export function VerificationBadge({
  estado,
  asegurado = false,
  compacto = false,
}: {
  estado: EstadoVerificacion;
  asegurado?: boolean;
  compacto?: boolean;
}) {
  const base =
    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold";

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {estado === "verificado" && (
        <span className={`${base} bg-trust-soft text-trust`}>
          <BadgeCheck className="h-3.5 w-3.5" />
          {compacto ? "Verificado" : "Verificado — TroncalCheck"}
        </span>
      )}
      {estado === "en_revision" && (
        <span className={`${base} bg-warning/15 text-warning`}>
          <Clock className="h-3.5 w-3.5" /> Pendiente de Revisión
        </span>
      )}
      {estado === "rechazado" && (
        <span className={`${base} bg-destructive/10 text-destructive`}>
          <ShieldAlert className="h-3.5 w-3.5" /> Verificación rechazada
        </span>
      )}
      {estado === "sin_verificar" && (
        <span className={`${base} bg-muted text-muted-foreground`}>
          <ShieldAlert className="h-3.5 w-3.5" /> Sin Verificar
        </span>
      )}
      {asegurado && estado === "verificado" && (
        <span className={`${base} bg-success-soft text-success`}>
          <ShieldCheck className="h-3.5 w-3.5" /> Asegurado
        </span>
      )}
    </span>
  );
}

export function VerificationDisclaimer({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs leading-relaxed text-muted-foreground ${className}`}>
      TroncalTrack realiza un proceso de validación documental basado en los registros públicos
      disponibles (SII, Registro Civil y MTT). La veracidad y vigencia de la información
      proporcionada es responsabilidad exclusiva del usuario. TroncalTrack no asume responsabilidad
      por la falsificación ideológica de documentos por parte de terceros ni garantiza los
      acuerdos comerciales privados suscritos entre las partes.
    </p>
  );
}
