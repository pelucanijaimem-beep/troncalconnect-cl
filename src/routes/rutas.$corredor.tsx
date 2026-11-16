import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { GuiaLayout, Seccion } from "@/components/troncal/landing/GuiaLayout";
import { CORREDORES, corredorPorSlug } from "@/lib/corredores";
import { estimarRuta } from "@/lib/cotizador";

const clp = (n: number) => `$${n.toLocaleString("es-CL")}`;

export const Route = createFileRoute("/rutas/$corredor")({
  loader: ({ params }) => {
    const corredor = corredorPorSlug(params.corredor);
    if (!corredor) throw notFound();
    return { corredor };
  },
  head: ({ loaderData }) => {
    const c = loaderData?.corredor;
    if (!c) return { meta: [{ title: "Corredor no encontrado — TroncalTrack" }] };
    const title = `${c.titulo} — Cargas y camiones | TroncalTrack`;
    return {
      meta: [
        { title },
        { name: "description", content: c.descripcion },
        { property: "og:title", content: title },
        { property: "og:description", content: c.descripcion },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: CorredorPage,
});

function CorredorPage() {
  const { corredor: c } = Route.useLoaderData();
  const ruta = estimarRuta(c.origen, c.destino);
  const otros = CORREDORES.filter((o) => o.slug !== c.slug);
  return (
    <GuiaLayout etiqueta="Corredor Ruta 5" titulo={c.titulo} bajada={c.descripcion}>
      <Seccion titulo="La ruta">
        <p>
          Son aproximadamente {c.kmAprox.toLocaleString("es-CL")} km entre {c.origen} y {c.destino}, unas{" "}
          {c.horasAprox} de manejo en camión según tráfico y descansos. Recorrido habitual: {c.tramo}
        </p>
        {ruta && (
          <p>
            Peajes troncales referenciales para camión de más de 2 ejes: {clp(ruta.peajeMin)} a {clp(ruta.peajeMax)}{" "}
            ({ruta.plazas} plazas aprox.), sin pórticos urbanos ni peajes laterales. Revisa las tarifas vigentes antes
            de cerrar tu precio.
          </p>
        )}
      </Seccion>
      <Seccion titulo="Qué se mueve en este corredor">
        <ul className="list-disc space-y-1 pl-5">
          {c.cargasTipicas.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </Seccion>
      <Seccion titulo="Cargas de retorno">
        <p>{c.retorno} En TroncalTrack ves las cargas publicadas desde tu destino para planificar la vuelta.</p>
      </Seccion>
      <Seccion titulo="Cómo funciona en TroncalTrack">
        <p>
          Las empresas publican su flete y los transportistas verificados con TroncalCheck postulan con su link de
          rastreo GPS. No cobramos comisión por viaje ni hacemos subastas: el precio lo acuerdan ustedes.
        </p>
      </Seccion>
      <Seccion titulo="Otros corredores">
        <ul className="space-y-1">
          {otros.map((o) => (
            <li key={o.slug}>
              <Link to="/rutas/$corredor" params={{ corredor: o.slug }} className="font-semibold text-primary hover:underline">
                {o.titulo}
              </Link>
            </li>
          ))}
        </ul>
      </Seccion>
    </GuiaLayout>
  );
}
