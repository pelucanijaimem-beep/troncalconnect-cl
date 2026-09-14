import { AlertTriangle } from "lucide-react";

export function PortAccessNotice() {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10 lg:py-12">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <AlertTriangle className="h-6 w-6 text-primary" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-foreground sm:text-xl">
                Ingreso a puertos: enrolamiento y agendamiento
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Antes de dirigirte a un puerto a retirar o dejar carga, verifica que tengas al día tu
                enrolamiento como transportista/conductor en el sistema de la terminal correspondiente,
                y si tu carga es contenedor full de exportación en Puerto San Antonio, confirma el uso
                de la app de agendamiento del antepuerto (ASAT) — es obligatorio y sin eso no te dejan
                bajar al terminal. Estos requisitos los define y actualiza cada terminal y la autoridad
                portuaria respectiva, no TroncalTrack. Contáctalos directamente antes de viajar para
                confirmar la documentación vigente exigida en tu caso. TroncalTrack no gestiona, controla
                ni garantiza el acceso a ningún puerto o terminal, y no se hace responsable por rechazos
                de ingreso, atrasos, costos o pérdidas que resulten de un enrolamiento o agendamiento
                incompleto, vencido o mal realizado por parte del transportista. Esta información es
                referencial y puede quedar desactualizada.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
