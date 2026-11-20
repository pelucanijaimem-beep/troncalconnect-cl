import { Sparkles } from "lucide-react";
import { esClavePrerevision } from "@/lib/prerevision-documentos";

export type FilaPrerevision = {
  user_id: string;
  clave: string;
  ruta: string;
  veredicto: string;
  motivo: string;
};

/** Veredicto orientativo de la IA (solo administradores). Se oculta si el archivo cambió. */
export function PrerevisionIA({
  clave,
  ruta,
  fila,
}: {
  clave: string;
  ruta: string | undefined;
  fila: FilaPrerevision | undefined;
}) {
  if (!esClavePrerevision(clave) || !ruta || !fila || fila.ruta !== ruta) return null;
  const revisar = fila.veredicto === "revisar";
  return (
    <span
      className={
        revisar
          ? "mt-1 flex w-full items-start gap-1 text-xs font-semibold text-destructive"
          : "mt-1 flex w-full items-start gap-1 text-xs font-semibold text-muted-foreground"
      }
      title="Pre-revisión con IA: solo orienta, la aprobación la hace una persona."
    >
      <Sparkles className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
      <span>
        Pre-revisión IA: {revisar ? `Revisar: ${fila.motivo || "verificar con atención"}` : "Parece correcto"}
      </span>
    </span>
  );
}
