import { CalendarCheck, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero({
  onRegistro,
  onDemo,
}: {
  onRegistro: () => void;
  onDemo: () => void;
}) {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-4xl px-4 py-14 text-center lg:py-20">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
          Lanzamiento regional · 100% gratis
        </span>
        <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Tu camino al éxito empieza con el tablero de cargas de TroncalTrack.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Aumenta tus ganancias y conecta con transportistas y generadores de carga de confianza en
          todo Chile.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" onClick={onRegistro}>
            <Rocket className="h-4 w-4" /> Comenzar Ahora
          </Button>
          <Button size="lg" variant="outline" onClick={onDemo}>
            <CalendarCheck className="h-4 w-4" /> Solicitar Demo
          </Button>
        </div>
      </div>
    </section>
  );
}
