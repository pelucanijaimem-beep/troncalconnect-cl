import { Check, PackagePlus, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

const BENEFICIOS = [
  "Alertas de nuevas cargas en tiempo real.",
  "Calculadora de Valor por Kilómetro ($/km).",
  "Opción de bloquear empresas o choferes no deseados.",
  "Reserva de cargas al instante y seguimiento GPS en ruta.",
];

export function Hero({
  onRegistro,
  onPublicarCamion,
  onPublicarFlete,
}: {
  onRegistro: () => void;
  onPublicarCamion: () => void;
  onPublicarFlete: () => void;
}) {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
            Lanzamiento regional · 100% gratis
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            TroncalTrack™: La plataforma de cargas líder para camioneros y empresas en
            Sudamérica
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Encuentra el flete correcto y el mejor valor por kilómetro. Todo el control en tu mano,
            100% Gratis durante nuestro lanzamiento regional.
          </p>

          <ul className="mt-6 space-y-3">
            {BENEFICIOS.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm font-medium text-foreground sm:text-base">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </span>
                {b}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={onRegistro}>
              Regístrate Gratis
            </Button>
            <Button size="lg" variant="outline" onClick={onPublicarCamion}>
              <Truck className="h-4 w-4" /> Publicar mi Camión
            </Button>
            <Button size="lg" variant="outline" onClick={onPublicarFlete}>
              <PackagePlus className="h-4 w-4" /> Publicar Flete
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            La red troncal en cifras
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {[
              ["+12.400", "cargas publicadas al mes"],
              ["+3.100", "camioneros activos"],
              ["4 países", "Chile, Argentina, Perú y Bolivia"],
              ["$0", "costo durante el lanzamiento"],
            ].map(([valor, texto]) => (
              <div key={texto} className="rounded-xl border border-border bg-surface p-4">
                <p className="text-2xl font-extrabold text-primary">{valor}</p>
                <p className="mt-1 text-xs text-muted-foreground">{texto}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Tarifas siempre visibles en la moneda local de cada país y en USD para rutas
            transfronterizas.
          </p>
        </div>
      </div>
    </section>
  );
}
