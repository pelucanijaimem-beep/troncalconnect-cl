import { useNavigate, Link } from "@tanstack/react-router";
import { BadgeCheck, Building2, Check, Search, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLANES = [
  {
    id: "inicial",
    nombre: "Inicial",
    precio: "$0",
    periodo: "CLP / mes",
    descripcion: "Para partir explorando el mercado de cargas.",
    icono: Search,
    cta: "Comenzar Gratis",
    href: "/registro",
    features: [
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
    href: "https://mpago.la/25CXadN",
    externo: true,
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
    href: "https://mpago.la/1zS5CuL",
    externo: true,
    features: [
      "Publicación ilimitada de fletes y cargas",
      "Filtro exclusivo para asignar cargas solo a Transportistas Verificados",
      "Perfil corporativo verificado con logo y contacto de logística",
      "Soporte prioritario",
    ],
  },
];

export function PricingPlans({ onRegistro }: { onRegistro: () => void }) {
  const navigate = useNavigate();

  const handleClick = (p: (typeof PLANES)[number]) => {
    if (p.externo) {
      window.open(p.href, "_blank", "noopener,noreferrer");
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
          Precios transparentes en pesos chilenos (CLP), sin permanencia mínima. Paga con tarjeta,
          Mercado Pago o Webpay (Flow).
        </p>

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
