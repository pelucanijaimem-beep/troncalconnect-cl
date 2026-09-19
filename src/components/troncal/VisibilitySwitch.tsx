import { Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

/** Control de privacidad de una publicación: tablero abierto o solo por invitación. */
export function VisibilitySwitch({
  visible,
  onChange,
  id = "visibilidad",
}: {
  visible: boolean;
  onChange: (v: boolean) => void;
  id?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3">
      <Switch id={id} checked={visible} onCheckedChange={onChange} className="mt-0.5" />
      <div className="text-sm">
        <Label htmlFor={id} className="inline-flex cursor-pointer items-center gap-1 font-semibold text-foreground">
          {visible ? (
            <>
              <Eye className="h-4 w-4 text-primary" /> Visible en el tablero
            </>
          ) : (
            <>
              <EyeOff className="h-4 w-4 text-primary" /> Solo por invitación
            </>
          )}
        </Label>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {visible
            ? "Cualquier usuario registrado puede encontrar esta publicación en el tablero."
            : "No aparece en el tablero. Solo la verán las personas que invites o a quienes envíes el enlace directo."}
        </p>
      </div>
    </div>
  );
}
