import { Link, useNavigate } from "@tanstack/react-router";
import { BadgeCheck, Building2, Check, Crown, Search, Truck } from "lucide-react";
import { useCuposFundador } from "@/lib/use-fundadores";
import { Button } from "@/components/ui/button";

/** Número de WhatsApp de contacto del sitio (+569 4792 6230). */
const WHATSAPP_NUMERO = "56947926230";

const PLANES = [
  {
    id: "inicial",
    nombre: "Inicial",
    precio: "$0",
    periodo: "CLP / mes",
    destacadoGratis: true,
    descripcion: "Para partir explorando el mercado de cargas.",
    icono: Search,
    cta: "Comenzar Gratis",
    href: "/registro",
    features: [
      "Acceso gratuito sin vencimiento durante la fase de lanzamiento",
      "Ver el tablero de cargas con actualización diferida",
      "Perfil básico sin verificar",
      "Hasta 2 publicaciones de carga al mes",
    ],
  },
  {
    id: "transportista",
    nombre: "Transportista Pro",
    precio: "$14.990",
    periodo: "CLP / mes",
    destacado: true,
    descripcion: "El más elegido por choferes y dueños de camión.",
    icono: Truck,
    cta: "Suscribirme como Transportista",
    href: "/registro",
    plan: "transportista" as const,
    whatsapp:
      "Hola, quiero activar el plan Transportista Pro de TroncalTrack ($14.990/mes).",
    features: [
      "Sello azul de verificación «TroncalCheck» (tras validar RUT y documentos)",
      "Acceso instantáneo a datos de contacto directo (Teléfono / WhatsApp de la carga)",
      "Alertas de cargas de retorno en tiempo real para tus rutas preferidas",
      "Posicionamiento prioritario en las búsquedas de los generadores de carga",
    ],
  },
  {
    id: "empresa",
    nombre: "Empresa Pro",
    precio: "$29.990",
    periodo: "CLP / mes",
    descripcion: "Para generadores de carga y empresas logísticas.",
    icono: Building2,
    cta: "Suscribirme como Empresa",
    href: "/registro",
    plan: "empresa" as const,
    whatsapp:
      "Hola, quiero activar el plan Empresa Pro de TroncalTrack ($29.990/mes).",
    features: [
      "Publicación ilimitada de fletes y cargas",
      "Filtro exclusivo para asignar cargas solo a Transportistas Verificados",
      "Perfil corporativo verificado con logo y contacto de logística",
      "Soporte prioritario",
      "Cupo Empresa Fundadora: precio congelado de por vida y posicionamiento prioritario permanente",
    ],
  },
];

export function PricingPlans({ onRegistro }: { onRegistro: () => void }) {
  const navigate = useNavigate();
  const { quedan, total } = useCuposFundador();

  const handleClick = (p: (typeof PLANES)[number]) => {
    if (p.whatsapp) {
      window.open(
        `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(p.whatsapp)}`,
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }
    navigate({ to: p.href });
    onRegistro();
  };

  return (
    <section id="planes" className="border-b border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Planes y Membresías
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Precios transparentes en pesos chilenos (CLP), sin permanencia mínima. Estamos habilitando
          el pago en línea; mientras tanto coordinamos la activación de tu plan por WhatsApp.
        </p>

        {quedan !== null && quedan > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-bold text-primary sm:text-base">
            <Crown className="h-5 w-5 shrink-0" />
            Empresa Fundadora: quedan {quedan} de {total} cupos. Precio congelado de por vida,
            posicionamiento prioritario permanente e insignia en tu perfil corporativo.
          </div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PLANES.map((p) => (
            <article
              key={p.id}
              className={`flex flex-col rounded-2xl border bg-card p-6 shadow-card ${
                p.destacado ? "border-primary ring-1 ring-primary" : "border-border"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-md ${
                    p.destacado ? "bg-primary text-primary-foreground" : "bg-surface text-primary"
                  }`}
                >
                  <p.icono className="h-4 w-4" />
                </span>
                <h3 className="text-lg font-extrabold text-foreground">{p.nombre}</h3>
                {p.destacado && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    Más elegido
                  </span>
                )}
                {p.destacadoGratis && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-bold text-success">
                    Gratis sin vencimiento
                  </span>
                )}
                {p.id === "empresa" && quedan !== null && quedan > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    <Crown className="h-3 w-3" /> {quedan} cupos fundador
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{p.descripcion}</p>

              <p className="mt-4 flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-foreground">{p.precio}</span>
                <span className="text-sm font-semibold text-muted-foreground">{p.periodo}</span>
              </p>

              <ul className="mt-4 flex-1 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    {p.destacado ? (
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-trust" />
                    ) : (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    )}
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className="mt-6 w-full cursor-pointer transition-all hover:brightness-110"
                variant={p.destacado ? "default" : "outline"}
                onClick={() => handleClick(p)}
              >
                {p.cta}
              </Button>
            </article>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Quieres pagar anual y ahorrar un 20%?{" "}
          <Link to="/planes" className="font-semibold text-primary hover:underline">
            Ver todos los detalles de Planes y Membresías
          </Link>
        </p>
      </div>
    </section>
  );
}

