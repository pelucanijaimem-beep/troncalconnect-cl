import { PLANES_GENERADORES, PLANES_TRANSPORTE, formatoUF } from "@/lib/pricing";

export function ComparisonTable() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-extrabold text-foreground">Tu operación, tu tramo</h2>
        <div className="mt-5 grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 text-lg font-bold text-foreground">Dadores de Carga</h3>
            <ul className="divide-y divide-border">
              {PLANES_GENERADORES.map(p => <li key={p.id} className="py-3 text-sm"><p className="font-bold text-foreground">{p.nombre} · {formatoUF(p.uf)} UF/mes</p><p className="mt-1 text-muted-foreground">{Number.isFinite(p.publicaciones) ? `${p.publicaciones} publicaciones incluidas/mes` : "Publicaciones ilimitadas"}{p.adicionalUf > 0 ? ` · Adicional: +${formatoUF(p.adicionalUf)} UF, sin bloqueo` : ""}</p></li>)}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-lg font-bold text-foreground">Transportistas</h3>
            <ul className="divide-y divide-border">
              {PLANES_TRANSPORTE.map(p => <li key={p.id} className="py-3 text-sm"><p className="font-bold text-foreground">{p.nombre} · {formatoUF(p.uf)} UF{p.uf === 0 ? "/mes" : " por camión registrado/mes"}</p><p className="mt-1 text-muted-foreground">{p.uf === 0 ? "1 camión · Gratis permanente" : `${p.min}${Number.isFinite(p.max) ? ` a ${p.max}` : " o más"} camiones registrados · Gratis durante los primeros 4 meses de lanzamiento`}</p></li>)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
