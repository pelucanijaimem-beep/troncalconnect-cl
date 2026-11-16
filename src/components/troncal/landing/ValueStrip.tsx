import { BadgePercent, CalendarCheck, Repeat } from "lucide-react";

const PUNTOS = [
  {
    icono: BadgePercent,
    titulo: "0% comisión por viaje",
    texto: "Lo que acuerdas con la empresa es tuyo completo. No descontamos nada de tu flete.",
  },
  {
    icono: CalendarCheck,
    titulo: "Suscripción mensual, sin subastas",
    texto: "Precio publicado y claro. No pagas extra por aparecer primero ni compites a la baja contra otros camiones.",
  },
  {
    icono: Repeat,
    titulo: "Cargas de retorno en Ruta 5",
    texto: "Encuentra carga desde tu destino para no volver con el camión vacío.",
  },
];

export function ValueStrip() {
  return (
    <section className="border-b border-border bg-surface" aria-labelledby="propuesta-valor">
      <div className="mx-auto max-w-6xl px-4 py-10 lg:py-12">
        <h2 id="propuesta-valor" className="text-center text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          0% comisión y sin subastas que castiguen tu tarifa
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {PUNTOS.map((p) => (
            <div key={p.titulo} className="flex gap-3 rounded-2xl border border-border bg-card p-5 shadow-card">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <p.icono className="h-5 w-5 text-primary" />
              </span>
              <div>
                <h3 className="text-base font-bold text-foreground">{p.titulo}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
