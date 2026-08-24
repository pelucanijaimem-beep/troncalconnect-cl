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
    "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors cursor-pointer";
  return (
    <div
      className={cn(
        "flex w-full items-center gap-1 rounded-lg border border-border bg-surface p-1 md:w-auto",
        className,
      )}
      role="tablist"
      aria-label="Cambiar rol"
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
        <HardHat className="h-4 w-4" /> Soy Camionero
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
        <Building2 className="h-4 w-4" /> Soy Empresa / Cargador
      </button>
    </div>
  );
}
