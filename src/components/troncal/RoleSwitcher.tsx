import { Building2, HardHat } from "lucide-react";
import { cn } from "@/lib/utils";

export type Rol = "camionero" | "empresa";

export function RoleSwitcher({
  rol,
  onChange,
  className,
}: {
  rol: Rol;
  onChange: (r: Rol) => void;
  className?: string;
}) {
  const base =
    "flex flex-1 items-center justify-center rounded-md px-3 py-2 transition-colors cursor-pointer";
  return (
    <div
      className={cn(
        "flex w-full items-stretch gap-1 rounded-lg border border-border bg-surface p-1 md:w-auto",
        className,
      )}
      role="tablist"
      aria-label="Cambiar tipo de cuenta"
    >
      <button
        type="button"
        role="tab"
        aria-selected={rol === "camionero"}
        onClick={() => onChange("camionero")}
        className={cn(
          base,
          rol === "camionero"
            ? "bg-primary text-primary-foreground shadow-card"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <span className="flex flex-col items-center gap-0.5 text-center">
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <HardHat className="h-4 w-4 shrink-0" /> Transportista / Operador de Flota
          </span>
          <span
            className={cn(
              "text-[11px] leading-snug",
              rol === "camionero" ? "text-primary-foreground/80" : "text-muted-foreground",
            )}
          >
            Ofrezco camiones o flota (desde 1 unidad) para ejecutar fletes.
          </span>
        </span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={rol === "empresa"}
        onClick={() => onChange("empresa")}
        className={cn(
          base,
          rol === "empresa"
            ? "bg-primary text-primary-foreground shadow-card"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <span className="flex flex-col items-center gap-0.5 text-center">
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <Building2 className="h-4 w-4 shrink-0" /> Dador de Carga / Generador
          </span>
          <span
            className={cn(
              "text-[11px] leading-snug",
              rol === "empresa" ? "text-primary-foreground/80" : "text-muted-foreground",
            )}
          >
            Necesito mover carga desde mis plantas o bodegas hacia destino.
          </span>
        </span>
      </button>
    </div>
  );
}
