import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingMatrix } from "@/components/troncal/PricingMatrix";
import { WHATSAPP_PLANES } from "@/lib/pricing";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/planes")({
  head: () => ({
    meta: [
      { title: "Membresías para Transportistas y Dadores de Carga — TroncalTrack" },
      { name: "description", content: "Membresías en pesos chilenos por camión registrado o publicaciones. Un camión gratis para siempre y 0% de comisión por viaje coordinado." },
      { property: "og:title", content: "Membresías para Transportistas y Dadores de Carga — TroncalTrack" },
      { property: "og:description", content: "Un camión gratis; generadores desde $53.990 al mes y publicaciones adicionales sin bloqueo. Fundador 20% de por vida." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlanesPage,
});

const FAQ_SUSCRIPCION = [
  { q: "¿Qué incluyen los planes de Generadores de Carga?", a: "Starter: $53.990 al mes y 15 publicaciones incluidas. Pro: $131.990 al mes y 60 incluidas. Enterprise: desde $412.990 al mes, publicaciones ilimitadas y cotización manual. No cobramos por licencia de usuario." },
  { q: "¿Qué pasa si supero las publicaciones incluidas?", a: "Puedes seguir publicando sin bloqueo por cuota. Starter registra +$1.290 por cada publicación adicional y Pro +$790. Enterprise no tiene adicionales. Se guarda el conteo y el importe para facturación manual; todavía no hay cobros automáticos." },
  { q: "¿Cómo se cuentan las publicaciones?", a: "Se cuentan por mes calendario de Chile para toda la organización, incluidas las privadas. Eliminar una carga no borra su consumo registrado. Las publicaciones anteriores al inicio del registro se conservan sin cargos retroactivos; las ya eliminadas no pueden reconstruirse." },
  { q: "¿Cómo se cobra por camión?", a: "Un camión es gratis para siempre. De 2 a 20 camiones registrados:  $4.990 por camión al mes; desde 21: $3.500 por cada camión. Se mantienen los tramos por patentes registradas." },
  { q: "¿En qué moneda están los precios?", a: "Todos los precios están fijados en pesos chilenos (CLP). TroncalTrack se reserva el derecho de ajustar sus tarifas conforme a sus políticas internas de precios, informando oportunamente a los usuarios. La facturación se coordina manualmente." },
  { q: "¿Qué promociones se mantienen?", a: "Generadores mantienen el primer mes gratis en la membresía base; los adicionales quedan registrados para facturación manual. Las flotas conservan los cuatro meses gratis durante el lanzamiento, sin fecha de corte anunciada. Un camión es gratis siempre." },
  { q: "¿Cómo funciona Empresa Fundadora?", a: "Se mantiene el 20% de descuento de por vida sobre la tarifa normal de tu tramo. Los adicionales registran también el descuento cuando corresponde. No es un precio fijo congelado." },
  { q: "¿Cómo activo y pago mi membresía?", a: "La activación es manual por WhatsApp y el pago se coordina por transferencia. No hay cobros automáticos habilitados. Los excedentes se registran, no se cobran automáticamente." },
  { q: "¿Cuándo se activa el sello TroncalCheck?", a: "La identidad con Didit compara el RUT con tu registro. TroncalCheck requiere además aprobación documental. Las empresas ven estados e insignias, nunca documentos privados." },
  { q: "¿Cobran comisión por flete?", a: "No. TroncalTrack tiene 0% de comisión por viaje coordinado y no cobra por transacción al transportista." },
];

function PlanesPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"><ArrowLeft className="h-4 w-4" /> TroncalTrack · Volver al inicio</Link>
          <h1 className="mt-5 text-3xl font-extrabold text-foreground sm:text-4xl">Planes y Membresías</h1>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">Transportistas y Dadores de Carga: membresías en pesos chilenos fijos, según camiones registrados o publicaciones. 0% de comisión por viaje coordinado.</p>
          <Button asChild variant="outline" className="mt-4"><Link to="/membresia">Mi membresía</Link></Button>
        </div>
      </header>
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-8"><PricingMatrix /></div>
      </section>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <h2 className="text-2xl font-extrabold text-foreground">Preguntas frecuentes sobre los planes</h2>
          <Accordion type="single" collapsible className="mt-6">
            {FAQ_SUSCRIPCION.map(f => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="text-left text-base font-semibold">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
      <section>
        <div className="mx-auto max-w-3xl px-4 py-10 text-center">
          <h2 className="text-xl font-extrabold text-foreground">Conversemos sobre tu operación</h2>
          <p className="mt-2 text-sm text-muted-foreground">WhatsApp +569 4792 6230 · 9:00 a 17:00 hrs.</p>
          <Button asChild className="mt-4"><a href={`https://wa.me/${WHATSAPP_PLANES}?text=${encodeURIComponent("Hola, quiero consultar los planes de TroncalTrack para mi empresa.")}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" />Consultar por WhatsApp</a></Button>
        </div>
      </section>
    </main>
  );
}
