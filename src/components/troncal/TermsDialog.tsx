import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SECCIONES = [
  {
    numero: "1",
    titulo: "Naturaleza del Servicio (Plataforma de Intermediación Digital)",
    contenido: [
      "TRONCALTRACK.CL es una plataforma tecnológica de información e intermediación digital que pone en contacto a usuarios que requieren contratar servicios de transporte de carga ('Generadores de Carga' / 'Empresas') con prestadores independientes de servicios de transporte de carga ('Transportistas').",
      "TRONCALTRACK.CL NO ES UNA EMPRESA DE TRANSPORTES, NI OPERADOR LOGÍSTICO, NI CONSOLIDADOR DE CARGA, NI AGENCIA DE ADUANAS. La plataforma no presta servicios de transporte, no es dueña de flota de camiones, ni actúa como empleador o patrón de los transportistas registrados.",
    ],
  },
  {
    numero: "2",
    titulo: "Exclusión y Limitación de Responsabilidad Legal",
    contenido: [
      "Al utilizar la plataforma, el Usuario (tanto Empresa como Transportista) reconoce y acepta expresamente que TRONCALTRACK.CL queda totalmente eximida de cualquier responsabilidad legal, civil, penal o comercial derivada de:",
      "Robos, Hurtos o Enajenación Indebida: TroncalTrack.cl no se hace responsable por el robo, asalto, piratería de carretera, pérdida total o parcial, mermas o daños materiales de las mercancías o bienes transportados, cualquiera sea la causa o circunstancia durante el trayecto, carga o descarga.",
      "Incumplimientos Contratados: TroncalTrack.cl no garantiza el cumplimiento de los tiempos de entrega, acuerdos de pago, condiciones de la carga, ni los compromisos pactados entre el Generador de Carga y el Transportista. La relación contractual del flete es exclusiva y directa entre las partes.",
      "Seguros de Carga: Es responsabilidad única del Generador de Carga contratar las pólizas de seguro de transporte de carga correspondientes, y es responsabilidad del Transportista contar con las pólizas de responsabilidad civil o daños a terceros exigidas por la ley chilena.",
      "Daños a Terceros o Accidentes: TroncalTrack.cl no asume responsabilidad alguna por accidentes de tránsito, siniestros, infracciones a la Ley de Tránsito, o daños causados a terceros por los vehículos de los transportistas.",
    ],
  },
  {
    numero: "3",
    titulo: "Sello de Verificación 'TroncalCheck'",
    contenido: [
      "La verificación de antecedentes (TroncalCheck) realizada por TroncalTrack.cl consiste en una revisión informativa de documentos públicos (tales como RUT, revisión técnica, inscripción MTT u hoja de vida de conductor).",
      "Dicha verificación constituye una herramienta de apoyo preventivo y no representa una garantía absoluta o fianza sobre la conducta moral, idoneidad profesional o solvencia financiera de los usuarios. Cada parte debe aplicar la debida diligencia antes de entregar mercancías o firmar órdenes de flete.",
    ],
  },
  {
    numero: "4",
    titulo: "Tarifas y Negociación Directa",
    contenido: [
      "Los precios de los fletes, condiciones de pago y tarifas mostradas o acordadas dentro o fuera de la plataforma son pactados libremente entre el Transportista y la Empresa. TroncalTrack.cl únicamente cobra una tarifa por concepto de suscripción o acceso al software/directorio de contactos y no retiene porcentajes ni interviene en el flujo de dinero del flete.",
    ],
  },
  {
    numero: "5",
    titulo: "Jurisdicción y Ley Aplicable",
    contenido: [
      "Para todos los efectos legales, estos términos se rigen por las leyes de la República de Chile. Cualquier controversia será sometida a los tribunales ordinarios de justicia de la ciudad de Concepción o Santiago de Chile.",
    ],
  },
];

export function TermsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-5 text-left">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Términos, Condiciones y Póliza de Responsabilidad
          </DialogTitle>
          <DialogDescription className="text-left">
            TroncalTrack.cl — Última actualización: Agosto de 2026
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Bienvenido a TroncalTrack.cl. Al acceder, navegar o utilizar nuestra plataforma web y sus
            servicios, el usuario (ya sea en rol de Empresa/Generador de Carga o
            Transportista/Camionero) acepta de manera íntegra y sin reservas los términos descritos a
            continuación.
          </p>

          <ol className="mt-6 space-y-6">
            {SECCIONES.map((s) => (
              <li key={s.numero} className="rounded-xl border border-border bg-surface p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                    {s.numero}
                  </span>
                  <h3 className="mt-1 text-base font-bold text-foreground sm:text-lg">{s.titulo}</h3>
                </div>

                <div className="mt-4 space-y-3">
                  {s.contenido.map((parrafo, i) => (
                    <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                      {parrafo}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <DialogFooter className="border-t border-border px-6 py-4">
          <Button className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
