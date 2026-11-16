import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GuiaLayout({
  etiqueta,
  titulo,
  bajada,
  children,
}: {
  etiqueta: string;
  titulo: string;
  bajada: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:py-12">
          <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Volver a TroncalTrack
          </Link>
          <p className="mt-5 text-xs font-bold uppercase tracking-widest text-primary">{etiqueta}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{titulo}</h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">{bajada}</p>
        </div>
      </section>
      <div className="mx-auto max-w-3xl px-4 py-10">
        {children}
        <div className="mt-10 rounded-2xl border border-border bg-card p-6 text-center shadow-card">
          <h2 className="text-lg font-extrabold text-foreground">Publica o encuentra tu próxima carga</h2>
          <p className="mt-1 text-sm text-muted-foreground">0% comisión por viaje. Crear tu cuenta es gratis.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/registro">
                <UserPlus className="h-4 w-4" /> Crear cuenta gratis
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/" hash="cargas">Ver el tablero de cargas</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

export function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="text-lg font-extrabold tracking-tight text-foreground sm:text-xl">{titulo}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}
