import { useState } from "react";
import { CheckCircle2, Copy, KeyRound, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatearRut } from "@/lib/rut";
import type { CodigoEntrega } from "@/lib/use-entrega-codigo";

const fechaHora = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("es-CL", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

/** Código de entrega visible solo para la empresa dueña de la carga. */
export function CodigoEntregaPanel({
  datos,
  onRegenerar,
}: {
  datos: CodigoEntrega;
  onRegenerar: () => Promise<string | null>;
}) {
  const [generando, setGenerando] = useState(false);

  if (datos.estado === "entregado") {
    return (
      <div className="space-y-1 rounded-xl border border-border bg-card p-3 text-sm">
        <p className="flex items-center gap-1.5 font-semibold text-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary" /> Entregado y Conforme
        </p>
        <p className="text-xs text-muted-foreground">
          Recibió {datos.receptorNombre ?? "el receptor"}
          {datos.receptorRut ? ` (RUT ${formatearRut(datos.receptorRut)})` : ""} el{" "}
          {fechaHora(datos.entregadoAt)} · Transportista: {datos.transportista}
        </p>
      </div>
    );
  }

  const copiar = async () => {
    if (!datos.codigo) return;
    try {
      await navigator.clipboard.writeText(datos.codigo);
      toast.success("Código copiado");
    } catch {
      toast.error("No pudimos copiar el código", { description: "Anótalo manualmente." });
    }
  };

  const regenerar = async () => {
    setGenerando(true);
    const error = await onRegenerar();
    setGenerando(false);
    if (error) toast.error("No pudimos generar un código nuevo", { description: error });
    else toast.success("Código nuevo generado", { description: "El código anterior dejó de funcionar." });
  };

  return (
    <div className="space-y-2 rounded-xl border-2 border-primary/40 bg-card p-3">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <KeyRound className="h-4 w-4 text-primary" /> Código de entrega · En Ruta con {datos.transportista}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <span
          className="font-mono text-3xl font-bold tracking-[0.3em] text-foreground"
          aria-label={`Código de entrega ${datos.codigo ?? ""}`}
        >
          {datos.codigo}
        </span>
        <Button type="button" size="sm" variant="outline" onClick={() => void copiar()}>
          <Copy className="h-4 w-4" /> Copiar código
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Entrégalo solo al receptor en destino cuando la carga llegue conforme.
      </p>
      {datos.bloqueado && (
        <p role="alert" className="text-xs font-semibold text-destructive">
          El transportista agotó los intentos con un código incorrecto. Genera uno nuevo y envíalo al
          receptor.
        </p>
      )}
      <button
        type="button"
        disabled={generando}
        onClick={() => void regenerar()}
        className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-2 hover:underline disabled:opacity-60"
      >
        <RefreshCw className="h-3.5 w-3.5" /> {generando ? "Generando…" : "Generar código nuevo"}
      </button>
    </div>
  );
}
