import { createFileRoute, Link } from "@tanstack/react-router";
import { GuiaLayout, Seccion } from "@/components/troncal/landing/GuiaLayout";
import { CORREDORES } from "@/lib/corredores";

const TITULO = "Ingreso a Puertos: Enrolamiento y ASAT — TroncalTrack";
const DESCRIPCION =
  "Qué revisar antes de retirar o dejar carga en un puerto chileno: enrolamiento en la terminal y agendamiento del antepuerto en San Antonio.";

export const Route = createFileRoute("/guias/ingreso-puertos-enrolamiento-asat")({
  head: () => ({
    meta: [
      { title: TITULO },
      { name: "description", content: DESCRIPCION },
      { property: "og:title", content: TITULO },
      { property: "og:description", content: DESCRIPCION },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GuiaPuertos,
});

function GuiaPuertos() {
  return (
    <GuiaLayout
      etiqueta="Guía para transportistas"
      titulo="Ingreso a Puertos: Enrolamiento y ASAT"
      bajada="Lo que conviene revisar antes de viajar a un puerto a retirar o dejar carga."
    >
      <Seccion titulo="Enrolamiento en la terminal">
        <p>
          Antes de dirigirte a un puerto, verifica que tengas al día tu enrolamiento como transportista y conductor en
          el sistema de la terminal correspondiente. Cada terminal define sus propios requisitos y documentos.
        </p>
      </Seccion>
      <Seccion titulo="Agendamiento del antepuerto en San Antonio (ASAT)">
        <p>
          Si tu carga es un contenedor full de exportación en Puerto San Antonio, confirma el uso de la aplicación de
          agendamiento del antepuerto (ASAT). Es obligatorio: sin ese agendamiento no podrás bajar al terminal.
        </p>
      </Seccion>
      <Seccion titulo="Confirma antes de salir">
        <p>
          Estos requisitos los define y actualiza cada terminal y la autoridad portuaria respectiva, no TroncalTrack.
          Contáctalos directamente antes de viajar para confirmar la documentación vigente exigida en tu caso.
        </p>
        <p>
          TroncalTrack no gestiona, controla ni garantiza el acceso a ningún puerto o terminal, y no se hace
          responsable por rechazos de ingreso, atrasos, costos o pérdidas que resulten de un enrolamiento o
          agendamiento incompleto, vencido o mal realizado. Esta información es referencial y puede quedar
          desactualizada.
        </p>
      </Seccion>
      <Seccion titulo="Corredores de la Ruta 5">
        <ul className="space-y-1">
          {CORREDORES.map((c) => (
            <li key={c.slug}>
              <Link to="/rutas/$corredor" params={{ corredor: c.slug }} className="font-semibold text-primary hover:underline">
                {c.titulo}
              </Link>
            </li>
          ))}
        </ul>
      </Seccion>
    </GuiaLayout>
  );
}
