import { Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type Bloque = {
  titulo: string;
  intro?: string;
  puntos: { titulo?: string; texto: string; lista?: string[] }[];
};

const BLOQUES: Bloque[] = [
  {
    titulo: "Naturaleza del Servicio (Plataforma de Intermediación Digital)",
    intro:
      "TroncalTrack es una plataforma tecnológica independiente cuyo único propósito es poner en contacto a empresas que requieren trasladar mercancías con transportistas o empresas de transporte que ofrecen dichos servicios.",
    puntos: [
      {
        titulo: "No somos una empresa de transportes",
        texto:
          "TroncalTrack no posee flota vehicular propia, no actúa como transportista, ni opera como agente o consignatario de carga.",
      },
      {
        titulo: "Sin relación de subordinación",
        texto:
          "El uso de la plataforma no establece ninguna relación de sociedad, asociación, contrato de trabajo o representación jurídica entre TroncalTrack y ninguna de las partes que interactúan en ella.",
      },
    ],
  },
  {
    titulo: "Exclusión de Responsabilidad Operativa y Contractual",
    intro: "TroncalTrack actúa exclusivamente como un canal o punto de encuentro digital. Por lo tanto:",
    puntos: [
      {
        titulo: "Negociación Directa",
        texto:
          "Las condiciones del servicio de transporte (tales como precios, tarifas, formas y plazos de pago, horarios de entrega, requerimientos de carga, seguros y especificaciones del trayecto) se negocian, acuerdan y firman de forma libre y directa entre la Empresa y el Transportista.",
      },
      {
        titulo: "Sin responsabilidad por incumplimientos",
        texto:
          "TroncalTrack NO se hace responsable, bajo ningún motivo ni circunstancia, por el incumplimiento parcial, total o defectuoso de los acuerdos pactados entre las partes. Esto incluye, pero no se limita a:",
        lista: [
          "Retrasos en las entregas o recogidas de carga.",
          "Extravíos, robos, hurtos, merma o daños en la mercancía.",
          "Incumplimiento o no pago de las tarifas pactadas por parte de la empresa.",
          "Cancelaciones de viajes a última hora por cualquiera de las partes.",
          "Fallas mecánicas, siniestros o accidentes en ruta.",
        ],
      },
    ],
  },
  {
    titulo: "Resolución de Controversias",
    intro:
      "Dado que TroncalTrack no forma parte del contrato comercial suscrito entre el transportista y la empresa contratante:",
    puntos: [
      {
        texto:
          "Cualquier discrepancia, reclamo, disputa comercial o acción legal que surja derivada del servicio de transporte deberá ser resuelta única y exclusivamente entre la Empresa y el Transportista.",
      },
      {
        texto:
          "TroncalTrack no actuará como árbitro, mediador formal ni tribunal en ningún tipo de conflicto comercial, administrativo o legal.",
      },
    ],
  },
  {
    titulo: "Capacidad de Gestión y Soporte",
    intro:
      "La intervención de TroncalTrack ante cualquier evento, eventualidad o desacuerdo se limita estrictamente a:",
    puntos: [
      {
        texto:
          "Facilitar, en la medida de sus posibilidades técnicas, las vías de contacto registradas (teléfono, correo electrónico o mensajería) para que las partes involucradas puedan comunicarse directamente y gestionar la solución del problema.",
      },
      {
        texto:
          "TroncalTrack se reserva el derecho discrecional de suspender o bloquear de forma definitiva la cuenta de cualquier usuario (empresa o transportista) que acumule reclamos reiterados de incumplimiento o mal uso del servicio.",
      },
    ],
  },
  {
    titulo: "Veracidad de la Información y Verificación",
    puntos: [
      {
        texto:
          "Cada usuario es el único y exclusivo responsable de la veracidad, vigencia y legalidad de la información que publica o proporciona dentro de TroncalTrack (datos personales, licencias de conducir, permisos de circulación, revisiones técnicas, características de la carga, valores, etc.).",
      },
      {
        texto:
          "TroncalTrack no garantiza la autenticidad ni el estado legal o comercial de los usuarios ni de sus vehículos, recomendando siempre a las partes realizar sus propias validaciones antes de concretar una operación de transporte.",
      },
    ],
  },
  {
    titulo: "Aceptación de los Términos",
    puntos: [
      {
        texto:
          "El uso continuo de la plataforma troncaltrack.cl implica la lectura, comprensión y aceptación total de este documento. Si un usuario no está de acuerdo con alguna de estas condiciones, deberá abstenerse de utilizar los servicios de la plataforma.",
      },
    ],
  },
];

export function TermsSection() {
  return (
    <section id="terminos" className="border-t border-border bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-wide">TroncalTrack.cl</span>
        </div>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Términos, Condiciones y Políticas del Servicio
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">Última actualización: 2026</p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Bienvenido a TroncalTrack.cl. Al acceder, navegar o utilizar nuestra plataforma web y sus
          servicios, el usuario (ya sea en rol de Empresa/Generador de Carga o
          Transportista/Camionero) acepta de manera íntegra y sin reservas los términos descritos a
          continuación.
        </p>

        <ol className="mt-8 space-y-8">
          {BLOQUES.map((b, i) => (
            <li key={b.titulo} className="rounded-xl border border-border bg-surface p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <h3 className="mt-1 text-base font-bold text-foreground sm:text-lg">{b.titulo}</h3>
              </div>

              {b.intro && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{b.intro}</p>
              )}

              <div className="mt-4 space-y-4">
                {b.puntos.map((p) => (
                  <div key={p.texto} className="border-l-2 border-primary/30 pl-3">
                    {p.titulo && (
                      <p className="text-sm font-semibold text-foreground">{p.titulo}</p>
                    )}
                    <p className="text-sm leading-relaxed text-muted-foreground">{p.texto}</p>
                    {p.lista && (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        {p.lista.map((l) => (
                          <li key={l}>{l}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 sm:flex-row sm:items-center">
          <p className="text-sm font-semibold text-foreground">
            ¿Tienes dudas sobre estos términos o necesitas ayuda con un caso?
          </p>
          <Button asChild className="sm:ml-auto">
            <a href="mailto:soporte@troncaltrack.cl">
              <Mail className="h-4 w-4" /> Contactar a Soporte
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
