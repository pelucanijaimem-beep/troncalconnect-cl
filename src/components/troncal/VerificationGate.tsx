import { Clock, Lock, ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerificationChecklist } from "./VerificationChecklist";
import type { Checklist, EstadoVerificacion } from "@/lib/use-verificacion";


const COPY: Record<
  EstadoVerificacion,
  { icono: typeof ShieldAlert; titulo: string; descripcion: string; cta: string }
> = {
  sin_verificar: {
    icono: ShieldAlert,
    titulo: "Verifica tu identidad para ver las cargas disponibles",
    descripcion:
      "Por seguridad de las empresas que publican cargas, el tablero solo se muestra a camioneros con RUT y documentos validados por TroncalCheck.",
    cta: "Iniciar Verificación de Identidad",
  },
  en_revision: {
    icono: Clock,
    titulo: "Tu verificación está en revisión",
    descripcion:
      "El equipo de TroncalTrack está validando tus documentos. Apenas quede aprobada (sello TroncalCheck), el tablero de cargas se desbloquea automáticamente.",
    cta: "Ver estado de mi verificación",
  },
  rechazado: {
    icono: ShieldAlert,
    titulo: "Tu verificación fue rechazada",
    descripcion:
      "Revisa la nota del equipo de TroncalCheck en tu perfil y vuelve a enviar tus documentos para acceder al tablero de cargas.",
    cta: "Reenviar documentos",
  },
  verificado: {
    icono: ShieldCheck,
    titulo: "Verificado",
    descripcion: "",
    cta: "",
  },
};

export function VerificationGate({
  estado,
  checklist,
  onVerificar,
}: {
  estado: EstadoVerificacion;
  checklist: Checklist;
  onVerificar: () => void;
}) {
  const { icono: Icono, titulo, descripcion, cta } = COPY[estado];

  return (
    <section className="mx-auto max-w-6xl">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
          <Lock className="h-3.5 w-3.5" /> Tablero de cargas protegido
        </span>
        <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {titulo}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">{descripcion}</p>

        <div className="mt-6 flex items-center gap-3 rounded-xl border border-dashed border-border bg-surface p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Icono className="h-5 w-5" />
          </span>
          <p className="text-sm font-semibold text-foreground">
            Cargas ocultas · Requiere sello TroncalCheck
          </p>
        </div>

        <div className="mt-4">
          <VerificationChecklist checklist={checklist} />
        </div>


        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button size="lg" onClick={onVerificar}>
            <ShieldCheck className="h-4 w-4" /> {cta}
          </Button>
        </div>
        <p className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-success" /> La aprobación final la realiza el
          equipo de TroncalTrack tras validar tus documentos.
        </p>
      </div>
    </section>
  );
}
