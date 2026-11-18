import { BadgeCheck, Hourglass, ShieldCheck, Wallet } from "lucide-react";
import type { EstadoVerificacion } from "@/lib/use-verificacion";

/** Financial-trust badge for the company that publishes a load. Unverified companies get a neutral label. */
export function CompanyTrustBadge({
  estado,
  asegurado = false,
  plazoPago,
}: {
  estado: EstadoVerificacion;
  asegurado?: boolean;
  plazoPago: string;
}) {
  const base = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold";
  if (estado === "verificado") {
    return (
      <span className="inline-flex flex-wrap items-center gap-1.5">
        <span className={`${base} bg-success-soft text-success`}>
          <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
          <span>Empresa Verificada · SII y Carpeta Tributaria al día</span>
        </span>
        <span className={`${base} bg-success-soft text-success`}>
          <Wallet className="h-3.5 w-3.5 shrink-0" /> {plazoPago}
        </span>
        {asegurado && (
          <span className={`${base} bg-success-soft text-success`}>
            <ShieldCheck className="h-3.5 w-3.5" /> Asegurado
          </span>
        )}
      </span>
    );
  }
  return (
    <span className={`${base} bg-muted text-muted-foreground`}>
      <Hourglass className="h-3.5 w-3.5 shrink-0" /> Validación Comercial en Proceso
    </span>
  );
}
