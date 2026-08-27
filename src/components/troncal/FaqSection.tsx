import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const PREGUNTAS = [
  {
    q: "¿Cómo publico un flete si soy empresa?",
    a: "Crea tu cuenta, entra al panel privado y pulsa «Publicar Flete». Indica origen, destino, fecha de carguío, tipo de carrocería, toneladas y tarifa ofrecida. Tu publicación queda visible al instante para los camioneros disponibles en esa ruta.",
  },
  {
    q: "¿Cómo busco cargas de retorno para no viajar en vacío?",
    a: "En el tablero filtra por origen (la ciudad donde descargas) y destino (tu base). También puedes publicar tu camión con la fecha en que quedas libre y recibir ofertas directas de generadores de carga.",
  },
  {
    q: "¿Cómo funciona el pago de los fletes?",
    a: "TroncalTrack es una plataforma de intermediación: el pago se acuerda y se paga directamente entre la empresa y el transportista. Recomendamos dejar por escrito la tarifa, los días de pago y las condiciones de descarga antes de tomar la carga.",
  },
  {
    q: "¿Qué significa la tarifa por kilómetro ($/km)?",
    a: "Es el valor del flete dividido por la distancia de la ruta. Te sirve para comparar rápidamente qué carga conviene más según tu costo operacional por kilómetro (combustible, peajes, neumáticos y mantención).",
  },
  {
    q: "¿Tiene costo usar la plataforma?",
    a: "El Plan Inicial es gratuito e incluye el tablero con actualización diferida y hasta 2 publicaciones de carga al mes. Para contacto directo, alertas en tiempo real y publicación ilimitada, ofrecemos los planes Transportista Pro ($14.990 CLP/mes) y Empresa Pro ($29.990 CLP/mes).",
  },
  {
    q: "¿Cómo sé que el otro usuario es confiable?",
    a: "Todas las cuentas pasan por verificación de datos (RUT, teléfono y correo). Además puedes revisar el historial de la publicación y contactar por teléfono o WhatsApp antes de comprometer el viaje.",
  },
];

export function FaqSection({ onRegistro }: { onRegistro: () => void }) {
  return (
    <section id="faq" className="border-b border-border bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12 lg:py-16">
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Preguntas frecuentes
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Todo lo que necesitas saber para empezar a mover carga hoy mismo.
        </p>

        <Accordion type="single" collapsible className="mt-6">
          {PREGUNTAS.map((p) => (
            <AccordionItem key={p.q} value={p.q}>
              <AccordionTrigger className="text-left text-base font-semibold">
                {p.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{p.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-6 text-center">
          <p className="font-bold text-foreground">¿Listo para tu próxima carga?</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Regístrate y accede al tablero en vivo en menos de un minuto.
          </p>
          <Button className="mt-4" onClick={onRegistro}>
            Comenzar Ahora
          </Button>
        </div>
      </div>
    </section>
  );
}
