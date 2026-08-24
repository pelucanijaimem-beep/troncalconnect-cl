import { cn } from "@/lib/utils";
import { CARROCERIAS } from "@/lib/troncal-data";

export function EquipmentPills({
  valor,
  onChange,
}: {
  valor: string;
  onChange: (v: string) => void;
}) {
  const opciones = ["todas", ...CARROCERIAS];
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por carrocería">
      {opciones.map((op) => {
        const activo = valor === op;
        return (
          <button
            key={op}
            type="button"
            aria-pressed={activo}
            onClick={() => onChange(op)}
            className={cn(
              "cursor-pointer rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors",
              activo
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground",
            )}
          >
            {op === "todas" ? "Todas" : op}
          </button>
        );
      })}
    </div>
  );
}
