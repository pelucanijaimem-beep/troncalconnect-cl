import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MarcoTelefono,
  PantallaAvisos,
  PantallaCalificar,
  PantallaDisponible,
  PantallaEntrega,
  PantallaPostular,
  PantallaRegistro,
  PantallaRentabilidad,
  PantallaVerificacion,
} from "@/components/troncal/landing/Pantallas";

const WHATSAPP =
  "https://wa.me/56947926230?text=Hola%2C%20tengo%20una%20duda%20sobre%20c%C3%B3mo%20usar%20TroncalTrack";

const PASOS = [
  {
    titulo: "Regístrate gratis.",
    texto:
      "Crea tu cuenta con tu RUT y tu teléfono. Elige si eres Transportista o Empresa. Toma menos de un minuto.",
    Pantalla: PantallaRegistro,
  },
  {
    titulo: "Verifica tu identidad.",
    texto:
      "Sube tus documentos (SOAP, Revisión Técnica, Permiso de Circulación, Licencia) y completa tu biometría. Puedes sacarles una foto y la IA completa las fechas por ti. Al validarse, obtienes el sello TroncalCheck.",
    Pantalla: PantallaVerificacion,
  },
  {
    titulo: "Activa “Disponible en Ruta”.",
    texto:
      "Prende este botón para que las empresas vean dónde estás, solo mientras estás disponible. Tu ubicación se apaga apenas lo desactivas.",
    Pantalla: PantallaDisponible,
  },
  {
    titulo: "Busca una carga y mira cuánto te queda.",
    texto:
      "Filtra por tu ruta y tipo de camión. Cada carga te muestra el margen operativo estimado, después de restar diésel y peajes — no solo el precio bruto.",
    Pantalla: PantallaRentabilidad,
  },
  {
    titulo: "Postula, y si quieres, propón tu propia tarifa.",
    texto:
      "Si el precio publicado no te acomoda, puedes ofrecer el tuyo antes de postular. La empresa ve tu propuesta y decide.",
    Pantalla: PantallaPostular,
  },
  {
    titulo: "Activa los avisos en tu teléfono.",
    texto:
      "Así te enteras al instante cuando se publica una carga en tu ruta, aunque no tengas la app abierta en ese momento.",
    Pantalla: PantallaAvisos,
  },
  {
    titulo: "Cierra la entrega con código y RUT del receptor.",
    texto:
      "Al llegar a destino, el receptor te da el código de 6 dígitos que le envió la empresa. Lo ingresas junto a su nombre y RUT, sin subir fotos, y la entrega queda registrada con fecha, hora y ubicación.",
    Pantalla: PantallaEntrega,
  },
  {
    titulo: "Al terminar el viaje, califica y te califican.",
    texto:
      "Tú calificas a la empresa y ella te califica a ti. Así todos en TroncalTrack construyen su reputación real.",
    Pantalla: PantallaCalificar,
  },
];

export const Route = createFileRoute("/guia")({
  head: () => ({
    meta: [
      { title: "Guía rápida de uso para transportistas — TroncalTrack" },
      {
        name: "description",
        content:
          "Cómo usar TroncalTrack en 8 pasos: registro, verificación TroncalCheck, cargas con margen real, postulación, avisos, entrega y calificaciones.",
      },
      { property: "og:title", content: "Cómo usar TroncalTrack en 8 pasos" },
      {
        property: "og:description",
        content:
          "De tu registro a tu primer flete verificado en Ruta 5, sin intermediarios ni comisiones.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://troncaltrack.com/guia" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://troncaltrack.com/guia" }],
  }),
  component: GuiaPage,
});

function GuiaPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Guía rápida de uso</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Cómo usar TroncalTrack en 8 pasos
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
            De tu registro a tu primer flete verificado en Ruta 5, sin intermediarios ni comisiones.
          </p>
        </div>
      </header>

      <ol className="mx-auto max-w-5xl divide-y divide-border px-4">
        {PASOS.map((p, i) => (
          <li key={p.titulo} className="grid items-center gap-8 py-10 sm:py-14 md:grid-cols-[minmax(0,1fr)_auto] md:gap-14">
            <div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-base font-extrabold text-primary-foreground">
                {i + 1}
              </span>
              <h2 className="mt-4 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
                <span className="text-primary">Paso {i + 1} —</span> {p.titulo}
              </h2>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">{p.texto}</p>
            </div>
            <MarcoTelefono size="sm">
              <p.Pantalla />
            </MarcoTelefono>
          </li>
        ))}
      </ol>

      <section className="mx-auto max-w-5xl px-4 pb-10">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
          <span className="absolute inset-y-0 left-0 w-1.5 bg-primary" aria-hidden />
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
                ¿Alguna duda? Te respondemos directo por WhatsApp
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Lunes a viernes, de 9:00 a 17:00 hrs.</p>
            </div>
            <Button size="lg" asChild className="h-auto min-h-11 shrink-0 whitespace-normal py-2.5">
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" /> Escribir por WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 pb-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al inicio
        </Link>
      </div>
    </main>
  );
}
