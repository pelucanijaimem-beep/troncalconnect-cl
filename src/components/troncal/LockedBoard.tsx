import { Lock, LogIn, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LockedBoard({
  onIngresar,
  onRegistro,
}: {
  onIngresar: () => void;
  onRegistro: () => void;
}) {
  return (
    <section id="cargas" className="mx-auto max-w-6xl px-4 py-10">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
          <Lock className="h-3.5 w-3.5" /> Tablero privado
        </span>
        <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Las cargas en vivo son solo para usuarios registrados
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Protegemos los datos de contacto de empresas y camioneros. Crea tu cuenta para
          ver los fletes disponibles, las tarifas por kilómetro y contactar directamente.
        </p>

        <div
          className="relative mt-6 rounded-xl border border-dashed border-border bg-surface p-4"
          aria-hidden="true"
        >
          <div className="pointer-events-none select-none opacity-40 blur-[2px]">
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="space-y-1.5">
                <Label>Origen</Label>
                <Input placeholder="Los Ángeles" disabled />
              </div>
              <div className="space-y-1.5">
                <Label>Destino</Label>
                <Input placeholder="Santiago" disabled />
              </div>
              <div className="space-y-1.5">
                <Label>Carrocería</Label>
                <Input placeholder="Rampla Plana" disabled />
              </div>
              <div className="space-y-1.5">
                <Label>Fecha</Label>
                <Input placeholder="dd-mm-aaaa" disabled />
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-20 rounded-xl border border-border bg-card" />
              ))}
            </div>
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-background/60 px-4 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Search className="h-6 w-6" />
            </span>
            <p className="text-sm font-semibold text-foreground">
              Buscador bloqueado · Cargas en vivo ocultas
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button size="lg" onClick={onIngresar}>
            <LogIn className="h-4 w-4" /> Iniciar Sesión para Ver Cargas en Vivo
          </Button>
          <Button size="lg" variant="outline" onClick={onRegistro}>
            Crear cuenta
          </Button>
        </div>
        <p className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-success" /> Registro con el Plan Inicial, sin tarjeta
          de crédito.
        </p>
      </div>
    </section>
  );
}
