import { useEffect, useRef, useState } from "react";
import { CircleDollarSign, Fingerprint, Navigation, Pause, Play, Rocket, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MarcoTelefono,
  PantallaEntrega,
  PantallaGps,
  PantallaRentabilidad,
  PantallaVerificacion,
  type PasoPantalla,
} from "@/components/troncal/landing/Pantallas";

/**
 * Recorrido ilustrativo de la plataforma dentro de un marco de teléfono.
 * Usa únicamente datos de ejemplo fijos: no consulta cargas, perfiles ni viajes reales.
 */

const PASOS: PasoPantalla[] = [
  {
    titulo: "1. Rentabilidad real al instante",
    texto: "Ve el margen neto de cada flete después de diésel y peajes, antes de postular.",
    icono: CircleDollarSign,
    Pantalla: PantallaRentabilidad,
  },
  {
    titulo: "2. Verificación Biométrica TroncalCheck",
    texto: "Conductores con identidad, licencia y documentos del camión revisados.",
    icono: Fingerprint,
    Pantalla: PantallaVerificacion,
  },
  {
    titulo: "3. Rastreo GPS en vivo en Ruta 5",
    texto: "Sigue el viaje en tiempo real y comparte un enlace con tu cliente.",
    icono: Navigation,
    Pantalla: PantallaGps,
  },
  {
    titulo: "4. Entrega Segura con Código PIN",
    texto: "Cierra el viaje en destino con el PIN de 6 dígitos y el nombre y RUT de quien recibe.",
    icono: ShieldCheck,
    Pantalla: PantallaEntrega,
  },
];

export function DemoEnAccion({ onRegistro }: { onRegistro: () => void }) {
  const [paso, setPaso] = useState(0);
  const [auto, setAuto] = useState(true);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(([e]) => setVisible(Boolean(e?.isIntersecting)), { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const elegir = (i: number) => {
    setPaso(i);
    setAuto(false);
  };

  const { Pantalla } = PASOS[paso]!;

  return (
    <section ref={ref} className="border-b border-border bg-background" aria-labelledby="demo-en-accion">
      <div className="mx-auto max-w-6xl px-4 py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-x-14">
          <div className="lg:col-start-1 lg:row-start-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
              Mira TroncalTrack en acción
            </span>
            <h2 id="demo-en-accion" className="mt-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Así de fácil mueves o aseguras tu carga en Ruta 5
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
              Explora en segundos cómo funciona la plataforma desde tu teléfono, sin intermediarios.
            </p>
          </div>

          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
            <MarcoTelefono pasos={PASOS.length} paso={paso}>
              <div key={paso} className="animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none">
                <Pantalla />
              </div>
            </MarcoTelefono>
          </div>

          <div className="lg:col-start-1 lg:row-start-2">
            <ul className="space-y-3">
              {PASOS.map((p, i) => {
                const activo = i === paso;
                return (
                  <li key={p.titulo}>
                    <button
                      type="button"
                      onClick={() => elegir(i)}
                      aria-pressed={activo}
                      className={cn(
                        "relative w-full overflow-hidden rounded-xl border-2 bg-card p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        activo ? "border-primary bg-primary/5" : "border-border hover:border-foreground/30",
                      )}
                    >
                      <div className="flex gap-3">
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                            activo ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                          )}
                        >
                          <p.icono className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-foreground sm:text-base">{p.titulo}</h3>
                          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{p.texto}</p>
                        </div>
                      </div>
                      {activo && (
                        <span className="absolute inset-x-0 bottom-0 h-1 bg-primary/15" aria-hidden>
                          {auto ? (
                            <span
                              key={paso}
                              className="block h-full animate-demo-progreso bg-primary"
                              style={{ animationPlayState: visible ? "running" : "paused" }}
                              onAnimationEnd={() => setPaso((n) => (n + 1) % PASOS.length)}
                            />
                          ) : (
                            <span className="block h-full w-full bg-primary" />
                          )}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={onRegistro}>
                <Rocket className="h-4 w-4" /> Probar gratis ahora
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setAuto((a) => !a)}>
                {auto ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {auto ? "Pausar recorrido" : "Reanudar recorrido"}
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Pantallas con datos ilustrativos de Chile.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
