import type { ReactNode } from "react";
import { Rocket, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero({ onRegistro, children }: { onRegistro: () => void; children?: ReactNode }) {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-4xl px-4 py-14 text-center lg:py-20">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
          Cobertura nacional en Chile · Despliegue activo en Ruta 5
        </span>
        <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Carga de retorno y fletes verificados en toda la Ruta 5, con 0% comisión
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Conecta transportistas con identidad biométrica y GPS en vivo con empresas cargadoras en Chile,
          sin intermediarios ni subastas a la baja.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" onClick={onRegistro}>
            <Rocket className="h-4 w-4" /> Comenzar Ahora
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#cargas">
              <Truck className="h-4 w-4" /> Ver el tablero de cargas
            </a>
          </Button>
        </div>
        {children}
      </div>
    </section>
  );
}
