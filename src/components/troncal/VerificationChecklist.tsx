import { CheckCircle2, Clock, XCircle } from "lucide-react";
import {
  avanceChecklist,
  DOCUMENTOS_REQUERIDOS,
  type Checklist,
} from "@/lib/use-verificacion";

const ICONO = {
  aprobado: CheckCircle2,
  rechazado: XCircle,
  pendiente: Clock,
} as const;

const COLOR = {
  aprobado: "text-success",
  rechazado: "text-destructive",
  pendiente: "text-warning",
} as const;

const ETIQUETA = {
  aprobado: "Aprobado",
  rechazado: "Rechazado",
  pendiente: "Pendiente",
} as const;

export function VerificationChecklist({
  checklist,
  compacto = false,
}: {
  checklist: Checklist;
  compacto?: boolean;
}) {
  const avance = avanceChecklist(checklist);

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
          Checklist TroncalCheck
        </h3>
        <span className="text-xs font-semibold text-muted-foreground">
          {avance.aprobados} de {avance.total} documentos aprobados
        </span>
      </div>

      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-valuenow={avance.aprobados}
        aria-valuemin={0}
        aria-valuemax={avance.total}
        aria-label="Avance de la verificación documental"
      >
        <div
          className="h-full rounded-full bg-success transition-all"
          style={{ width: `${(avance.aprobados / avance.total) * 100}%` }}
        />
      </div>

      <ul className="mt-3 space-y-2">
        {DOCUMENTOS_REQUERIDOS.map((d) => {
          const item = checklist[d.clave];
          const Icono = ICONO[item.estado];
          return (
            <li key={d.clave} className="flex items-start gap-2">
              <Icono className={`mt-0.5 h-4 w-4 shrink-0 ${COLOR[item.estado]}`} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {d.label}{" "}
                  <span className={`text-xs font-bold ${COLOR[item.estado]}`}>
                    · {ETIQUETA[item.estado]}
                  </span>
                </p>
                {!compacto && item.estado === "pendiente" && (
                  <p className="text-xs text-muted-foreground">{d.ayuda}</p>
                )}
                {item.estado === "rechazado" && item.motivo && (
                  <p className="text-xs font-medium text-destructive">Motivo: {item.motivo}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
