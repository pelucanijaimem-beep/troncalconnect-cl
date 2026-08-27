import { Gauge, RadioTower, Search, ShieldCheck } from "lucide-react";

const BENEFICIOS = [
  {
    icon: RadioTower,
    titulo: "Disponibilidad en Tiempo Real",
    texto: "Actualización continua de fletes y camiones disponibles.",
  },
  {
    icon: Gauge,
    titulo: "Maximiza tu Eficiencia",
    texto: "Reduce kilómetros en vacío y mejora el rendimiento por vuelta.",
  },
  {
    icon: ShieldCheck,
    titulo: "Red Confiable",
    texto: "Conecta únicamente con usuarios y empresas validadas.",
  },
  {
    icon: Search,
    titulo: "Plataforma Ágil y Fácil",
    texto: "Búsqueda rápida por origen, destino, tipo de carrocería y toneladas.",
  },
];

export function BenefitsGrid() {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 lg:py-16">
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Beneficios clave
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFICIOS.map((b) => (
            <div key={b.titulo} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <b.icon className="h-5 w-5 text-primary" />
              </span>
              <h3 className="mt-4 text-base font-bold text-foreground">{b.titulo}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
