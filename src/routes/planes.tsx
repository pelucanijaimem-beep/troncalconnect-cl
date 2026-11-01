import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingMatrix } from "@/components/troncal/PricingMatrix";
import { WHATSAPP_PLANES } from "@/lib/pricing";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/planes")({
  head: () => ({
    meta: [
      { title: "Planes en UF para Generadores y Flotas — TroncalTrack" },
      { name: "description", content: "Planes para generadores de carga y flotas en Chile. Camión Independiente gratis permanente, flotas por camión activo y 20% de descuento Fundador de por vida." },
      { property: "og:title", content: "Planes en UF para Generadores y Flotas — TroncalTrack" },
      { property: "og:description", content: "Generadores desde 1,3 UF/mes. Flotas desde 0,08 UF por camión activo, gratis en lanzamiento. Fundadores con 20% de descuento de por vida." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlanesPage,
});

const FAQ_SUSCRIPCION = [
  {
    q: "¿Qué plan corresponde a mi empresa?",
    a: "Si publicas fletes, elige Generador Starter (1,3 UF/mes, 15 publicaciones y 1 administrador), Pro (3,2 UF/mes, 60 publicaciones y 3 usuarios) o Enterprise (desde 10 UF/mes, publicaciones ilimitadas y cotización personalizada). Si tienes camiones, Camión Independiente es gratis permanente; Flota Pyme cubre 2 a 9 camiones activos, Mediana de 10 a 49 y Enterprise 50 o más.",
  },
  {
    q: "¿Cómo se cobra por camión activo?",
    a: "Solo se cobran camiones con un chofer propio con cuenta registrada y actividad ese mes: 1 chofer por camión. El tramo depende de la cantidad de camiones activos, no de los declarados. Pyme: 0,25 UF por activo; Mediana: 0,17 UF; Enterprise: 0,08 UF. Si tienes 500 camiones y solo 200 activos, pagas 200 × 0,08 = 16 UF/mes, no por los 500. Si no hay camiones activos, el cobro por actividad es 0 UF. Por ahora la activación y gestión se realiza manualmente por WhatsApp.",
  },
  {
    q: "¿Cómo funciona el cupo Empresa Fundadora?",
    a: "Los cupos Empresa Fundadora otorgan un 20% de descuento de por vida sobre el precio normal del tramo real de tu empresa, tanto para Generadores como para Flotas. No es un precio fijo congelado ni un descuento por pagar anual. Si cambias de tamaño o tramo, conservas el 20%. Generador Pro paga 2,56 UF en vez de 3,2 UF; una flota con 5 camiones activos paga 1 UF en vez de 1,25 UF, y una con 200 paga 12,8 UF en vez de 16 UF. La disponibilidad de cupos se indica arriba.",
  },
  {
    q: "¿En qué consiste la promoción de lanzamiento?",
    a: "Durante los primeros 4 meses del período de lanzamiento, Flota Pyme, Mediana y Enterprise son gratis (0 UF), para incorporar camiones a la plataforma. Las tarifas publicadas son las normales después de la promoción. La activación se coordina por WhatsApp. Camión Independiente es gratis de forma permanente, también cuando termine el lanzamiento. La promoción no convierte en gratuitos los planes Generadores.",
  },
  {
    q: "¿Cómo se convierte la UF a pesos chilenos?",
    a: "Los precios están expresados en UF. El equivalente aproximado en CLP se calcula con el valor del día y se redondea al peso. Si la consulta no está disponible o no trae el dato del día, se muestra un respaldo fijo de $41.252,94 por UF, identificado como referencial. La cotización y el pago en pesos se coordinan por WhatsApp según el valor de la UF que corresponda.",
  },
  {
    q: "¿Cómo activo mi plan o gestiono las cuentas de mi flota?",
    a: "Los botones de activación y cotización abren WhatsApp para coordinar el plan, las cuentas de los choferes y el pago. Generador Enterprise requiere cotización personalizada; Flota Enterprise requiere cotización y contrato anual. No hay cobro automático de flotas. Cada camión necesita su propio chofer con cuenta registrada.",
  },
  {
    q: "¿Cuándo se activa mi perfil verificado TroncalCheck?",
    a: "Camión Independiente incluye el acceso al perfil verificado TroncalCheck sin una suscripción de pago. Debes completar la verificación de identidad y presentar la documentación correspondiente. El sello se activa tras aprobar la revisión documental; registrarte no lo concede automáticamente.",
  },
  {
    q: "¿Cobran comisión por cada flete?",
    a: "No. El modelo es por suscripción en los planes pagados, sin cobro por transacción ni comisión al transportista. Camión Independiente es gratis y los planes de flota se calculan por camión activo.",
  },
  {
    q: "¿Puedo cambiar de tramo más adelante?",
    a: "Sí. Coordina el cambio por WhatsApp según las publicaciones que necesites o el número real de camiones activos. El descuento Fundador del 20% se conserva sobre la tarifa normal del tramo que corresponda. Las condiciones de Flota Enterprise se acuerdan en su contrato anual.",
  },
];

function PlanesPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"><ArrowLeft className="h-4 w-4" /> TroncalTrack · Volver al inicio</Link>
          <h1 className="mt-5 text-3xl font-extrabold text-foreground sm:text-4xl">Planes y Membresías</h1>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">Generadores de Carga y Empresas de Transporte: elige según tu operación real. Precios en UF, equivalentes en pesos chilenos y sin comisiones por flete.</p>
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
