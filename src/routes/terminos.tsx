import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/terminos")({
  head: () => ({
    meta: [
      { title: "Términos, Condiciones y Póliza — TroncalTrack" },
      {
        name: "description",
        content:
          "Términos, condiciones de uso y póliza de limitación de responsabilidad de TroncalTrack.cl",
      },
      {
        property: "og:title",
        content: "Términos, Condiciones y Póliza — TroncalTrack",
      },
      {
        property: "og:description",
        content:
          "Términos, condiciones de uso y póliza de limitación de responsabilidad de TroncalTrack.cl",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TerminosPage,
});

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

function TerminosPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-foreground">
            <span className="text-primary">TroncalTrack</span>
            <span className="text-xs align-top text-muted-foreground">™</span>
          </Link>
          <Button variant="outline" size="sm" asChild>
            <Link to="/" className="flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Términos, Condiciones de Uso y Póliza de Limitación de Responsabilidad
          </h1>
          <p className="mt-3 text-lg font-semibold text-foreground">TRONCALTRACK.CL</p>
          <p className="mt-1 text-sm text-muted-foreground">Última actualización: Agosto de 2026</p>
        </div>

        <div className="space-y-8">
          {SECCIONES.map((seccion) => (
            <section
              key={seccion.numero}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <h2 className="mb-4 flex items-start gap-3 text-xl font-bold text-foreground">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                  {seccion.numero}
                </span>
                <span className="pt-0.5">{seccion.titulo}</span>
              </h2>
              <div className="space-y-4">
                {seccion.contenido.map((parrafo, i) => (
                  <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                    {parrafo}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-3 border-t border-border pt-8 sm:flex-row">
          <Button asChild>
            <Link to="/registro" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Volver al registro
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/planes">Ver planes</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
