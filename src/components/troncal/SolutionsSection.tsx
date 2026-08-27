import { Building2, Network, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

const PERFILES = [
  {
    icon: Truck,
    titulo: "Transportistas / Camioneros",
    texto:
      "Encuentra cargas de retorno, elimina viajes en vacío y asegura el pago de tus fletes.",
    cta: "Publicar mi Camión",
    accion: "camion" as const,
  },
  {
    icon: Building2,
    titulo: "Generadores de Carga / Empresas",
    texto:
      "Publica tu flete en segundos y encuentra camiones disponibles verificados en tiempo real.",
    cta: "Publicar Flete",
    accion: "flete" as const,
  },
  {
    icon: Network,
    titulo: "Operadores Logísticos",
    texto: "Gestiona tu flota y optimiza tus rutas de tramo largo por todo Chile.",
    cta: "Crear cuenta gratis",
    accion: "registro" as const,
  },
];

export function SolutionsSection({
  onPublicarCamion,
  onPublicarFlete,
  onRegistro,
}: {
  onPublicarCamion: () => void;
  onPublicarFlete: () => void;
  onRegistro: () => void;
}) {
  const handler = {
    camion: onPublicarCamion,
    flete: onPublicarFlete,
    registro: onRegistro,
  };

  return (
    <section id="soluciones" className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 lg:py-16">
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Soluciones según tu perfil
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Una sola plataforma para quienes mueven la carga, quienes la generan y quienes coordinan
          la operación completa.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PERFILES.map((p) => (
            <div
              key={p.titulo}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <p.icon className="h-5 w-5 text-primary" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-foreground">{p.titulo}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.texto}</p>
              <Button className="mt-5 w-full" variant="outline" onClick={handler[p.accion]}>
                {p.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
