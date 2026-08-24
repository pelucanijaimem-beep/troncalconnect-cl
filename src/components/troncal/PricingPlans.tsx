import { Check, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLANES = [
  {
    nombre: "Básico",
    precio: "US$ 39 / mes",
    descripcion: "Para camioneros independientes que recién parten.",
    features: [
      "Búsqueda de cargas ilimitada",
      "Calculadora de valor por kilómetro",
      "Alertas diarias por WhatsApp",
    ],
  },
  {
    nombre: "Avanzado",
    precio: "US$ 79 / mes",
    destacado: true,
    descripcion: "Para flotas pequeñas y transportistas frecuentes.",
    features: [
      "Todo lo del plan Básico",
      "Alertas en tiempo real y retornos (backhauls)",
      "Reputación y verificación de empresas",
      "Seguimiento GPS en ruta",
    ],
  },
  {
    nombre: "Pro",
    precio: "US$ 149 / mes",
    descripcion: "Para empresas cargadoras y flotas medianas.",
    features: [
      "Todo lo del plan Avanzado",
      "Publicación ilimitada de fletes",
      "Bloqueo de empresas o choferes",
      "Soporte prioritario 24/7",
    ],
  },
];

export function PricingPlans({ onRegistro, onDonar }: { onRegistro: () => void; onDonar: () => void }) {
  return (
    <section id="planes" className="border-b border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Planes y Precios
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Todos los planes están liberados durante el lanzamiento regional: paga $0 CLP / $0 USD por
          un año completo.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PLANES.map((p) => (
            <article
              key={p.nombre}
              className={`flex flex-col rounded-2xl border bg-card p-6 shadow-card ${
                p.destacado ? "border-primary ring-1 ring-primary" : "border-border"
              }`}
            >
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-foreground">{p.nombre}</h3>
                {p.destacado && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    Más elegido
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{p.descripcion}</p>

              <p className="mt-4 text-sm font-medium text-muted-foreground line-through">
                {p.precio}
              </p>
              <p className="text-2xl font-extrabold text-primary">¡GRATIS x 1 AÑO!</p>
              <p className="text-sm font-semibold text-foreground">$0 CLP / $0 USD</p>

              <ul className="mt-4 flex-1 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className="mt-6 w-full"
                variant={p.destacado ? "default" : "outline"}
                onClick={onRegistro}
              >
                Activar gratis
              </Button>
            </article>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-start gap-3 rounded-xl border border-dashed border-border bg-card p-4 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            ¿Te sirve TroncalTrack? Puedes aportar de forma voluntaria en USD o USDC (dólar digital).
          </p>
          <Button variant="ghost" size="sm" onClick={onDonar} className="sm:ml-auto text-primary">
            <Heart className="h-4 w-4" /> Apoyar el Proyecto / Donaciones
          </Button>
        </div>
      </div>
    </section>
  );
}
