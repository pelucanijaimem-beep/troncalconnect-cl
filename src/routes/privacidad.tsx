import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/privacidad")({
  head: () => ({
    meta: [
      { title: "Política de Privacidad — TroncalTrack" },
      {
        name: "description",
        content:
          "Cómo TroncalTrack recolecta, usa, protege y conserva los datos personales de transportistas y empresas en Chile, y cómo ejercer tus derechos ARCO.",
      },
      { property: "og:title", content: "Política de Privacidad — TroncalTrack" },
      {
        property: "og:description",
        content:
          "Datos que recolectamos (RUT, teléfono, correo, GPS, documentos TroncalCheck), su uso, plazos de conservación y tus derechos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacidadPage,
});

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-extrabold tracking-tight text-foreground sm:text-xl">{titulo}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
            <ShieldCheck className="h-4 w-4" /> Documento legal
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Política de Privacidad de TroncalTrack
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Última actualización: septiembre de 2026. Este documento explica cómo tratamos los datos
            personales de transportistas, empresas generadoras de carga y visitantes de
            TroncalTrack.cl, conforme a la Ley N° 19.628 sobre Protección de la Vida Privada y sus
            modificaciones vigentes en Chile.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-10">
        <Seccion titulo="1. Quién es responsable de tus datos">
          <p>
            El responsable del tratamiento es TroncalTrack, con operación en Los Ángeles, Región del
            Biobío, Chile. Para cualquier consulta sobre privacidad puedes escribir a{" "}
            <a className="font-semibold text-primary hover:underline" href="mailto:privacidad@troncaltrack.com">
              privacidad@troncaltrack.com
            </a>{" "}
            o al +569 4792 6230 (lunes a viernes, 9:00 a 17:00 hrs).
          </p>
        </Seccion>

        <Seccion titulo="2. Qué datos personales recolectamos">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-foreground">Datos de cuenta:</strong> nombre o razón social,
              correo electrónico, teléfono y WhatsApp, contraseña cifrada y rol elegido
              (transportista o generador de carga).
            </li>
            <li>
              <strong className="text-foreground">Datos de identificación tributaria:</strong> RUT
              de la persona natural o jurídica, necesario para validar identidad y evitar fraudes.
            </li>
            <li>
              <strong className="text-foreground">Documentos de verificación TroncalCheck:</strong>{" "}
              cédula de identidad, licencia de conducir clase A3/A4/A5, SOAP vigente, revisión
              técnica, permiso de circulación, certificado de antecedentes, padrón y pólizas de
              carga cuando corresponda.
            </li>
            <li>
              <strong className="text-foreground">Ubicación GPS en tiempo real:</strong> solo se
              obtiene desde tu navegador mientras activas voluntariamente el estado «Disponible en
              Ruta» o mientras un viaje está en curso. Al desactivarlo, dejamos de recibir tu
              posición.
            </li>
            <li>
              <strong className="text-foreground">Datos operacionales:</strong> cargas publicadas,
              postulaciones, calificaciones recibidas y emitidas, comprobantes de entrega (POD) y
              preferencias de alertas de ruta.
            </li>
            <li>
              <strong className="text-foreground">Datos técnicos:</strong> registros de acceso,
              dirección IP y tipo de dispositivo, con fines de seguridad.
            </li>
          </ul>
          <p>No recolectamos datos de menores de edad ni datos sensibles no señalados aquí.</p>
        </Seccion>

        <Seccion titulo="3. Para qué usamos tus datos">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Crear y administrar tu cuenta e iniciar sesión de forma segura.</li>
            <li>
              Mostrar cargas y camiones disponibles, y permitir el contacto entre transportistas y
              generadores de carga.
            </li>
            <li>
              Validar tu identidad y documentación para otorgar o mantener el sello TroncalCheck.
            </li>
            <li>
              Mostrar tu posición en el mapa de disponibilidad y permitir el seguimiento del viaje a
              la empresa dueña de la carga, únicamente mientras tú lo tengas activo.
            </li>
            <li>Enviar avisos operativos: postulaciones, coincidencias de carga y estados de verificación.</li>
            <li>Prevenir fraudes, suplantaciones y usos indebidos de la plataforma.</li>
            <li>Cumplir obligaciones legales y requerimientos de autoridad competente.</li>
          </ul>
          <p>
            No vendemos tus datos personales ni los cedemos a terceros con fines publicitarios.
          </p>
        </Seccion>

        <Seccion titulo="4. Quién puede ver tus datos">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              Tu nombre público, región de operación, calificación y sello de verificación son
              visibles para otros usuarios registrados.
            </li>
            <li>
              Tu teléfono, WhatsApp y datos de contacto se muestran solo a usuarios con plan activo
              o a la contraparte de una carga en la que participas.
            </li>
            <li>
              Tus documentos de verificación son privados: solo los revisa el equipo de
              administración de TroncalTrack y nunca se publican.
            </li>
            <li>
              Tu ubicación GPS se comparte de forma aproximada en el mapa y de forma precisa solo
              con la empresa de la carga que estás transportando.
            </li>
            <li>
              Usamos proveedores de infraestructura (alojamiento, base de datos y envío de correos)
              que tratan los datos solo por encargo nuestro y bajo obligación de confidencialidad.
            </li>
          </ul>
        </Seccion>

        <Seccion titulo="5. Cómo protegemos tus datos">
          <p>
            Aplicamos cifrado en tránsito (HTTPS), almacenamiento cifrado de contraseñas, control de
            acceso por roles y reglas de seguridad a nivel de base de datos que impiden que un
            usuario acceda a información de otro. Los documentos de verificación se guardan en
            almacenamiento privado con acceso restringido al equipo administrador. Ningún sistema es
            infalible, por lo que ante un incidente que afecte tus datos te informaremos por correo
            en el menor plazo posible.
          </p>
        </Seccion>

        <Seccion titulo="6. Cuánto tiempo conservamos tus datos">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-foreground">Datos de cuenta:</strong> mientras la cuenta esté
              activa y hasta 12 meses después de su cierre.
            </li>
            <li>
              <strong className="text-foreground">Documentos de verificación:</strong> hasta 24
              meses desde su aprobación o vencimiento, para acreditar la validación realizada.
            </li>
            <li>
              <strong className="text-foreground">Ubicación GPS:</strong> el historial del viaje se
              conserva hasta 90 días desde su término; las posiciones de disponibilidad se eliminan
              al desactivar el estado.
            </li>
            <li>
              <strong className="text-foreground">Cargas, postulaciones y calificaciones:</strong>{" "}
              se conservan como historial de reputación mientras la cuenta exista.
            </li>
            <li>
              <strong className="text-foreground">Registros de facturación y respaldo legal:</strong>{" "}
              por los plazos que exija la normativa tributaria chilena.
            </li>
          </ul>
        </Seccion>

        <Seccion titulo="7. Tus derechos">
          <p>
            Conforme a la ley chilena de protección de datos personales puedes ejercer, en cualquier
            momento y sin costo, tus derechos de acceso, rectificación, cancelación (supresión) y
            oposición, además de solicitar la portabilidad de tus datos y revocar los
            consentimientos otorgados, como el de geolocalización.
          </p>
          <p>
            Para ejercerlos escribe a{" "}
            <a className="font-semibold text-primary hover:underline" href="mailto:privacidad@troncaltrack.com">
              privacidad@troncaltrack.com
            </a>{" "}
            indicando tu nombre, RUT y la solicitud concreta. Responderemos dentro de los plazos
            legales y, en general, en un máximo de 10 días hábiles. Si consideras que tu solicitud no
            fue atendida correctamente, puedes recurrir ante la autoridad competente en Chile.
          </p>
        </Seccion>

        <Seccion titulo="8. Cookies y tecnologías similares">
          <p>
            Usamos almacenamiento local y cookies estrictamente necesarias para mantener tu sesión
            iniciada y recordar tus preferencias del tablero (filtros, favoritos y país). No usamos
            cookies publicitarias de terceros.
          </p>
        </Seccion>

        <Seccion titulo="9. Cambios a esta política">
          <p>
            Podemos actualizar este documento para reflejar mejoras del servicio o cambios legales.
            Publicaremos la nueva versión en esta misma página con su fecha de actualización y, si el
            cambio es relevante, te avisaremos por correo.
          </p>
        </Seccion>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link to="/">Volver al inicio</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/terminos">Términos y Condiciones</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
