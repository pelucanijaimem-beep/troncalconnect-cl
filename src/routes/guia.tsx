import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ImageIcon, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const WHATSAPP =
  "https://wa.me/56947926230?text=Hola%2C%20tengo%20una%20duda%20sobre%20c%C3%B3mo%20usar%20TroncalTrack";

const PASOS = [
  {
    titulo: "Regístrate gratis.",
    texto:
      "Crea tu cuenta con tu RUT y tu teléfono. Elige si eres Transportista o Empresa. Toma menos de un minuto.",
    imagen: "/guia/paso-1-registro.png",
  },
  {
    titulo: "Verifica tu identidad.",
    texto:
      "Sube tus documentos (SOAP, Revisión Técnica, Permiso de Circulación, Licencia) y completa tu biometría. Puedes sacarles una foto y la IA completa las fechas por ti. Al validarse, obtienes el sello TroncalCheck.",
    imagen: "/guia/paso-2-verificacion.png",
  },
  {
    titulo: "Activa “Disponible en Ruta”.",
    texto:
      "Prende este botón para que las empresas vean dónde estás, solo mientras estás disponible. Tu ubicación se apaga apenas lo desactivas.",
    imagen: "/guia/paso-3-disponible.png",
  },
  {
    titulo: "Busca una carga y mira cuánto te queda.",
    texto:
      "Filtra por tu ruta y tipo de camión. Cada carga te muestra el margen operativo estimado, después de restar diésel y peajes — no solo el precio bruto.",
    imagen: "/guia/paso-4-buscar.png",
  },
  {
    titulo: "Postula, y si quieres, propón tu propia tarifa.",
    texto:
      "Si el precio publicado no te acomoda, puedes ofrecer el tuyo antes de postular. La empresa ve tu propuesta y decide.",
    imagen: "/guia/paso-5-postular.png",
  },
  {
    titulo: "Activa los avisos en tu teléfono.",
    texto:
      "Así te enteras al instante cuando se publica una carga en tu ruta, aunque no tengas la app abierta en ese momento.",
    imagen: "/guia/paso-6-avisos.png",
  },
  {
    titulo: "Cierra la entrega con Código PIN y firma.",
    texto:
      "Al llegar a destino, el receptor ingresa el código PIN de 6 dígitos y firma en pantalla junto a la foto de la guía. Tu entrega queda respaldada para cobrar sin excusas.",
    imagen: "/guia/paso-7-entrega.png",
  },
  {
    titulo: "Al terminar el viaje, califica y te califican.",
    texto:
      "Tú calificas a la empresa y ella te califica a ti. Así todos en TroncalTrack construyen su reputación real.",
    imagen: "/guia/paso-8-calificar.png",
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

function CapturaTelefono({ src, alt }: { src: string; alt: string }) {
  const [falla, setFalla] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  const archivo = src.split("/").pop() ?? src;

  // La imagen puede fallar antes de que la página sea interactiva; se revisa al montar.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFalla(true);
  }, []);

  return (
    <div className="mx-auto w-[240px] rounded-[2.5rem] bg-device p-2.5 shadow-device sm:w-[260px]">
      <div className="relative aspect-[9/19] overflow-hidden rounded-[2rem] bg-background">
        <span className="absolute left-1/2 top-2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-device" aria-hidden />
        {falla ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 bg-surface px-5 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-background">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            </span>
            <p className="text-xs font-bold text-foreground">Captura próximamente</p>
            <p className="break-all rounded-md border border-dashed border-border bg-background px-2 py-1 font-mono text-[11px] text-muted-foreground">
              {archivo}
            </p>
          </div>
        ) : (
          <img
            ref={ref}
            src={src}
            alt={alt}
            loading="lazy"
            onError={() => setFalla(true)}
            className="h-full w-full object-cover object-top"
          />
        )}
      </div>
    </div>
  );
}

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
          <li key={p.imagen} className="grid items-center gap-8 py-10 sm:py-14 md:grid-cols-[minmax(0,1fr)_auto] md:gap-14">
            <div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-base font-extrabold text-primary-foreground">
                {i + 1}
              </span>
              <h2 className="mt-4 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
                <span className="text-primary">Paso {i + 1} —</span> {p.titulo}
              </h2>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">{p.texto}</p>
            </div>
            <CapturaTelefono src={p.imagen} alt={`Paso ${i + 1}: ${p.titulo}`} />
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
