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
      { name: "description", content: "Membresías en pesos chilenos por camión registrado o licencia activa. Un camión gratis para siempre y 0% de comisión por viaje coordinado." },
      { property: "og:title", content: "Membresías para Transportistas y Dadores de Carga — TroncalTrack" },
      { property: "og:description", content: "Un camión gratis; flotas desde $3.500 por camión registrado y dadores desde $49.990 al mes. Fundador 20% de por vida." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlanesPage,
});

const FAQ_SUSCRIPCION = [
  { q: "¿Qué plan corresponde a mi operación?", a: "Transportistas: Camionero Solitario es gratis para siempre con 1 camión; Flota Mediana cubre de 2 a 20 y Flota Enterprise más de 20. Dadores de Carga: Empresa Pyme incluye 1 administrador y 10 publicaciones mensuales; Corporativo Premium permite publicaciones ilimitadas y cobra por licencia activa." },
  { q: "¿Cómo se cobra por camión?", a: "Se cuentan las patentes registradas en la organización, no solo las que viajaron durante el mes. De 2 a 20 camiones: $4.990 por cada uno; más de 20: $3.500 por cada uno de todos los camiones. 5 camiones cuestan $24.950 mensuales y 300 cuestan $1.050.000. Un camión es gratis para siempre." },
  { q: "¿Cómo se cobra por licencia?", a: "Empresa Pyme cuesta $49.990 al mes e incluye 1 administrador y hasta 10 publicaciones. Corporativo Premium cuesta $149.990 mensuales por cada usuario activo de la organización: 2 coordinadores cuestan $299.980. Las publicaciones son ilimitadas en Premium." },
  { q: "¿Qué promociones se mantienen?", a: "Los dos planes de Dadores de Carga tienen el primer mes de prueba gratis desde la creación de su organización. Flota Mediana y Enterprise mantienen los cuatro meses gratis del período de lanzamiento, sin fecha de corte anunciada. Camionero Solitario continúa gratis para siempre." },
  { q: "¿Cómo funciona Empresa Fundadora?", a: "Los cupos Fundador conservan el 20% de descuento de por vida sobre el precio normal del tramo y las unidades reales. Una flota de 5 camiones paga $19.960 en lugar de $24.950 después de la promoción. El beneficio no es un precio fijo congelado ni un descuento anual." },
  { q: "¿Puedo gestionar camiones y coordinadores?", a: "Desde Mi membresía puedes registrar patentes y, en Corporativo Premium, agregar cuentas existentes de Dadores de Carga como licencias activas. El total mensual se recalcula al guardar cada cambio. Empresa Pyme admite solo un usuario. No se consideran pagadas las membresías por volver desde una pantalla de pago." },
  { q: "¿Cuándo se activa el sello TroncalCheck?", a: "La verificación de identidad con Didit compara el RUT con tu registro. El sello TroncalCheck requiere además la aprobación documental. Las empresas ven estados e insignias, nunca archivos de identidad o documentos privados." },
  { q: "¿Cobran comisión por flete?", a: "No. TroncalTrack tiene 0% de comisión por viaje coordinado, sin cobro por transacción al transportista y sin corte de cola de intermediarios. Solo pagas la membresía que corresponda." },
];

function PlanesPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"><ArrowLeft className="h-4 w-4" /> TroncalTrack · Volver al inicio</Link>
          <h1 className="mt-5 text-3xl font-extrabold text-foreground sm:text-4xl">Planes y Membresías</h1>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">Transportistas y Dadores de Carga: membresías en pesos chilenos, según camiones registrados o licencias activas. 0% de comisión por viaje coordinado.</p>
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
