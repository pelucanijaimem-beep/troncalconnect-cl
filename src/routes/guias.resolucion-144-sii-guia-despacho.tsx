import { createFileRoute, Link } from "@tanstack/react-router";
import { GuiaLayout, Seccion } from "@/components/troncal/landing/GuiaLayout";
import { CORREDORES } from "@/lib/corredores";

const TITULO = "Guía de Despacho y Resolución 144 del SII — TroncalTrack";
const DESCRIPCION =
  "Qué exige la Resolución Exenta SII N° 144 en la guía de despacho: chofer, RUT del transportista y patente. Fechas clave y cómo prepararte.";

export const Route = createFileRoute("/guias/resolucion-144-sii-guia-despacho")({
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
  component: GuiaRes144,
});

function GuiaRes144() {
  return (
    <GuiaLayout
      etiqueta="Guía para empresas cargadoras"
      titulo="Guía de Despacho y Resolución 144 del SII"
      bajada="Lo esencial que debes saber si despachas mercadería en camión en Chile. Información general; para tu caso particular consulta con tu contador."
    >
      <Seccion titulo="Qué es la Resolución 144">
        <p>
          La Resolución Exenta SII N° 144, publicada el 23 de octubre de 2026, reúne las exigencias para las facturas y
          guías de despacho que amparan el traslado de bienes, y deja sin efecto la Resolución N° 154 de 2025.
        </p>
      </Seccion>
      <Seccion titulo="Qué datos nuevos debe llevar la guía">
        <ul className="list-disc space-y-1 pl-5">
          <li>Origen y destino efectivos del traslado, con dirección y comuna.</li>
          <li>Nombre completo y cédula de identidad del chofer.</li>
          <li>RUT del transportista.</li>
          <li>Patente del vehículo y, si corresponde, del remolque o semirremolque.</li>
          <li>Descripción precisa de la carga: unidades, peso o volumen y tipo de producto.</li>
        </ul>
      </Seccion>
      <Seccion titulo="Fechas clave">
        <ul className="list-disc space-y-1 pl-5">
          <li>Desde el 1 de noviembre de 2026 ya puedes emitir con los campos nuevos si tienes los datos.</li>
          <li>Hasta el 31 de enero de 2027 debes informar al SII si tu transporte es propio o tercerizado.</li>
          <li>Desde el 1 de mayo de 2027 todos los campos son obligatorios.</li>
        </ul>
      </Seccion>
      <Seccion titulo="Cómo te ayuda TroncalTrack">
        <p>
          Al trabajar con transportistas de TroncalTrack sabes antes del retiro quién lleva tu carga: el transportista
          tiene su RUT validado, el chofer pasa verificación de identidad y licencia con TroncalCheck y su camión queda
          registrado con su patente. Así tienes a mano los datos que pide la guía antes de que el camión salga.
        </p>
      </Seccion>
      <Seccion titulo="Corredores frecuentes">
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
