import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  BellRing,
  Building2,
  Check,
  Crown,
  Infinity as InfinityIcon,
  MessageCircle,
  Search,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/planes")({
  head: () => ({
    meta: [
      {
        title: "Planes y Membresías en CLP — TroncalTrack",
      },
      {
        name: "description",
        content:
          "Elige tu plan TroncalTrack: Inicial gratis, Transportista Pro con sello TroncalCheck por $14.990 CLP/mes, o Empresa Pro por $29.990 CLP/mes. 20% de descuento pagando anual.",
      },
      { property: "og:title", content: "Planes y Membresías en CLP — TroncalTrack" },
      {
        property: "og:description",
        content:
          "Plan Inicial gratuito, Transportista Pro + TroncalCheck y Empresa Pro. Precios en CLP con 20% de descuento anual.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlanesPage,
});

type Feature = { texto: string; icono?: "check" | "especial" };

type Plan = {
  id: string;
  nombre: string;
  subtitulo: string;
  precioMensual: number;
  destacado?: boolean;
  cta: string;
  icono: typeof Truck;
  features: Feature[];
};

const PLANES: Plan[] = [
  {
    id: "inicial",
    nombre: "Inicial",
    subtitulo: "Para partir explorando el mercado de cargas.",
    precioMensual: 0,
    cta: "Comenzar Gratis",
    icono: Search,
    features: [
      { texto: "Ver el tablero de cargas con actualización diferida" },
      { texto: "Perfil básico sin verificar" },
      { texto: "Hasta 2 publicaciones de carga al mes" },
    ],
  },
  {
    id: "transportista",
    nombre: "Transportista Pro",
    subtitulo: "El más elegido por choferes y dueños de camión.",
    precioMensual: 14990,
    destacado: true,
    cta: "Suscribirme como Transportista",
    icono: Truck,
    features: [
      {
        texto: "Sello azul de verificación «TroncalCheck» (tras validar RUT y documentos)",
        icono: "especial",
      },
      {
        texto: "Acceso instantáneo a datos de contacto directo (Teléfono / WhatsApp de la carga)",
        icono: "especial",
      },
      {
        texto: "Alertas de cargas de retorno en tiempo real para tus rutas preferidas",
        icono: "especial",
      },
      {
        texto: "Posicionamiento prioritario en las búsquedas de los generadores de carga",
        icono: "especial",
      },
    ],
  },
  {
    id: "empresa",
    nombre: "Empresa Pro",
    subtitulo: "Para generadores de carga y empresas logísticas.",
    precioMensual: 29990,
    cta: "Suscribirme como Empresa",
    icono: Building2,
    features: [
      { texto: "Publicación ilimitada de fletes y cargas", icono: "especial" },
      {
        texto: "Filtro exclusivo para asignar cargas solo a Transportistas Verificados",
        icono: "especial",
      },
      {
        texto: "Perfil corporativo verificado con logo y contacto de logística",
        icono: "especial",
      },
      { texto: "Soporte prioritario", icono: "especial" },
    ],
  },
];

const FAQ_SUSCRIPCION = [
  {
    q: "¿Cómo puedo pagar mi suscripción?",
    a: "Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express) y pagos a través de Mercado Pago y Webpay (Flow). Todos los precios se cobran en pesos chilenos (CLP).",
  },
  {
    q: "¿Cómo funciona el descuento anual del 20%?",
    a: "Al elegir Pago Anual se cobra el año completo por adelantado con un 20% de descuento sobre el valor mensual. Por ejemplo, Transportista Pro queda en $11.990 CLP/mes (un solo cobro de $143.880 CLP al año).",
  },
  {
    q: "¿Puedo cancelar cuando quiera?",
    a: "Sí. Puedes cancelar tu suscripción en cualquier momento desde tu panel, sin multas ni permanencia mínima. Tu plan se mantiene activo hasta el final del período ya pagado y luego vuelves al Plan Inicial.",
  },
  {
    q: "¿Cuándo se activa mi sello TroncalCheck?",
    a: "Al suscribirte como Transportista Pro podrás enviar tu documentación (RUT, licencia, padrón y póliza). Una vez aprobada la validación documental, el sello azul se activa en tu perfil y publicaciones.",
  },
  {
    q: "¿Puedo cambiar de plan más adelante?",
    a: "Sí. Puedes subir o bajar de plan en cualquier momento; el cambio se aplica de inmediato y prorrateamos la diferencia en tu próximo cobro.",
  },
];

function clp(valor: number) {
  return "$" + Math.round(valor).toLocaleString("es-CL");
}

function LogoPago({ texto, sub }: { texto: string; sub?: string }) {
  return (
    <span className="inline-flex flex-col items-center justify-center rounded-md border border-border bg-card px-3 py-1.5 leading-tight">
      <span className="text-xs font-extrabold tracking-tight text-foreground">{texto}</span>
      {sub && <span className="text-[9px] font-medium text-muted-foreground">{sub}</span>}
    </span>
  );
}

function PlanesPage() {
  const [anual, setAnual] = useState(false);

  return (
    <main className="min-h-screen bg-background">
      {/* Encabezado */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Planes y Membresías
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Elige el plan ideal para tu operación
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Precios transparentes en pesos chilenos (CLP), sin permanencia mínima. Cancela cuando
            quieras y conserva tu historial y reputación.
          </p>

          {/* Switch mensual / anual */}
          <div className="mt-6 inline-flex items-center rounded-full border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setAnual(false)}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                !anual ? "bg-primary text-primary-foreground" : "text-foreground hover:text-primary"
              }`}
            >
              Pago Mensual
            </button>
            <button
              type="button"
              onClick={() => setAnual(true)}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                anual ? "bg-primary text-primary-foreground" : "text-foreground hover:text-primary"
              }`}
            >
              Pago Anual
              <span
                className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  anual ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"
                }`}
              >
                −20%
              </span>
            </button>
          </div>
          {anual && (
            <p className="mt-2 text-xs font-semibold text-success">
              Ahorras un 20% pagando el año completo por adelantado.
            </p>
          )}
        </div>
      </section>

      {/* Tarjetas de planes */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-6 lg:grid-cols-3">
            {PLANES.map((plan) => {
              const Icono = plan.icono;
              const mensualConDescuento = plan.precioMensual * 0.8;
              const precioMostrar = anual ? mensualConDescuento : plan.precioMensual;
              const totalAnual = mensualConDescuento * 12;

              return (
                <article
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl border bg-card p-6 shadow-card ${
                    plan.destacado ? "border-primary ring-2 ring-primary" : "border-border"
                  }`}
                >
                  {plan.destacado && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                      Más Popular
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-md ${
                        plan.destacado ? "bg-primary text-primary-foreground" : "bg-surface text-primary"
                      }`}
                    >
                      <Icono className="h-5 w-5" />
                    </span>
                    <h2 className="text-lg font-extrabold text-foreground">{plan.nombre}</h2>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">{plan.subtitulo}</p>

                  <div className="mt-5">
                    {anual && plan.precioMensual > 0 && (
                      <p className="text-sm font-medium text-muted-foreground line-through">
                        {clp(plan.precioMensual)} CLP / mes
                      </p>
                    )}
                    <p className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-foreground">
                        {plan.precioMensual === 0 ? "$0" : clp(precioMostrar)}
                      </span>
                      <span className="text-sm font-semibold text-muted-foreground">
                        CLP / mes
                      </span>
                    </p>
                    {anual && plan.precioMensual > 0 && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Un solo cobro anual de {clp(totalAnual)} CLP
                      </p>
                    )}
                  </div>

                  <ul className="mt-5 flex-1 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f.texto} className="flex items-start gap-2 text-sm text-foreground">
                        {f.icono === "especial" ? (
                          <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-trust" />
                        ) : (
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        )}
                        {f.texto}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="mt-6 w-full"
                    variant={plan.destacado ? "default" : "outline"}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </article>
              );
            })}
          </div>

          {/* Medios de pago */}
          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-success" />
              Pagos 100% seguros y cifrados. Aceptamos:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <LogoPago texto="VISA" />
              <LogoPago texto="Mastercard" />
              <LogoPago texto="AMEX" />
              <LogoPago texto="Mercado Pago" />
              <LogoPago texto="Webpay" sub="by Flow" />
              <LogoPago texto="Redcompra" sub="Débito" />
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios transversales */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icono: Crown,
              titulo: "Sin permanencia",
              texto: "Cancela en cualquier momento desde tu panel, sin multas.",
            },
            {
              icono: BellRing,
              titulo: "Alertas en tiempo real",
              texto: "Cargas de retorno y nuevas rutas directo a tu WhatsApp.",
            },
            {
              icono: MessageCircle,
              titulo: "Contacto directo",
              texto: "Teléfono y WhatsApp visibles de inmediato en planes Pro.",
            },
            {
              icono: InfinityIcon,
              titulo: "Publicación ilimitada",
              texto: "En el plan Empresa Pro publica todos los fletes que necesites.",
            },
          ].map((b) => (
            <div key={b.titulo} className="rounded-xl border border-border bg-card p-4">
              <b.icono className="h-5 w-5 text-primary" />
              <p className="mt-2 text-sm font-bold text-foreground">{b.titulo}</p>
              <p className="mt-1 text-xs text-muted-foreground">{b.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ de suscripción */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Preguntas frecuentes sobre la suscripción
          </h2>
          <Accordion type="single" collapsible className="mt-6">
            {FAQ_SUSCRIPCION.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="text-left text-base font-semibold">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Cierre */}
      <section className="bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <Star className="mx-auto h-6 w-6 text-primary" />
          <p className="mt-2 text-lg font-extrabold text-foreground">
            ¿Aún tienes dudas sobre qué plan te conviene?
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Escríbenos por WhatsApp al +569 4792 6230 (lunes a viernes, 9:00 a 17:00 hrs) y te
            ayudamos a elegir.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/">Volver al inicio</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
