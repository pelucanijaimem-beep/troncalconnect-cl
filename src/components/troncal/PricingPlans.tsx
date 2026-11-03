import { Link } from "@tanstack/react-router";
import { PricingMatrix } from "./PricingMatrix";

export function PricingPlans(_props: { onRegistro: () => void }) {
  return (
    <section id="planes" className="border-b border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">Planes y Membresías</h2>
        <p className="mb-6 mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">
          Transportistas por camión registrado y Dadores de Carga por licencia. Precios mensuales en pesos chilenos. 0% de comisión por viaje coordinado.
        </p>
        <PricingMatrix />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/planes" className="font-semibold text-primary hover:underline">Ver detalles y preguntas frecuentes de los planes</Link>
        </p>
      </div>
    </section>
  );
}
