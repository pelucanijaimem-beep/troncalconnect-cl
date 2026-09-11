import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CARROCERIAS } from "@/lib/troncal-data";
import {
  guardarPreferencias,
  PREFERENCIAS_VACIAS,
  type PreferenciasAlerta,
} from "@/lib/use-alertas";

function Pastillas({
  opciones,
  seleccion,
  onToggle,
  etiqueta,
}: {
  opciones: string[];
  seleccion: string[];
  onToggle: (v: string) => void;
  etiqueta: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={etiqueta}>
      {opciones.map((op) => {
        const activo = seleccion.includes(op);
        return (
          <button
            key={op}
            type="button"
            aria-pressed={activo}
            onClick={() => onToggle(op)}
            className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
              activo
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground"
            }`}
          >
            {op}
          </button>
        );
      })}
    </div>
  );
}

export function AlertPrefsDialog({
  open,
  onOpenChange,
  ciudades,
  userId,
  nombre,
  email,
  prefsIniciales,
  onGuardado,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  ciudades: string[];
  userId: string | undefined;
  nombre: string;
  email: string;
  prefsIniciales: PreferenciasAlerta;
  onGuardado: () => void;
}) {
  const [prefs, setPrefs] = useState<PreferenciasAlerta>(prefsIniciales);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (open) setPrefs(prefsIniciales);
  }, [open, prefsIniciales]);

  const alternar = (campo: "origenes" | "destinos" | "carrocerias", valor: string) =>
    setPrefs((p) => ({
      ...p,
      [campo]: p[campo].includes(valor)
        ? p[campo].filter((v) => v !== valor)
        : [...p[campo], valor],
    }));

  const guardar = async () => {
    if (!userId) {
      toast.error("Inicia sesión para configurar tus alertas.");
      return;
    }
    setGuardando(true);
    const error = await guardarPreferencias({ userId, nombre, email, prefs });
    setGuardando(false);
    if (error) {
      toast.error("No pudimos guardar tus alertas", { description: error });
      return;
    }
    toast.success("Alertas guardadas", {
      description:
        "Te avisaremos apenas se publique una carga que calce con tus rutas y carrocerías.",
    });
    onGuardado();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-primary" /> Alertas de coincidencia
          </DialogTitle>
          <DialogDescription>
            Guarda tus rutas frecuentes y el tipo de carrocería que operas. Te avisaremos dentro de
            la plataforma y por correo cuando aparezca una carga que calce.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Ciudades de origen frecuentes</Label>
            <Pastillas
              opciones={ciudades}
              seleccion={prefs.origenes}
              onToggle={(v) => alternar("origenes", v)}
              etiqueta="Ciudades de origen frecuentes"
            />
          </div>

          <div className="space-y-2">
            <Label>Ciudades de destino frecuentes</Label>
            <Pastillas
              opciones={ciudades}
              seleccion={prefs.destinos}
              onToggle={(v) => alternar("destinos", v)}
              etiqueta="Ciudades de destino frecuentes"
            />
          </div>

          <div className="space-y-2">
            <Label>Tipos de carrocería</Label>
            <Pastillas
              opciones={[...CARROCERIAS]}
              seleccion={prefs.carrocerias}
              onToggle={(v) => alternar("carrocerias", v)}
              etiqueta="Tipos de carrocería"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Ciudad base (para viajes de retorno)</Label>
            <Select
              value={prefs.ciudadBase || "sin_definir"}
              onValueChange={(v) =>
                setPrefs((p) => ({ ...p, ciudadBase: v === "sin_definir" ? "" : v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu ciudad base" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sin_definir">Sin definir</SelectItem>
                {ciudades.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              El filtro «Viaje de retorno» mostrará cargas cuyo destino sea esta ciudad, para
              reducir kilómetros vacíos.
            </p>
          </div>

          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2">
            <span className="text-sm font-semibold text-foreground">
              Recibir aviso por correo electrónico
            </span>
            <Switch
              checked={prefs.alertasEmail}
              onCheckedChange={(v) => setPrefs((p) => ({ ...p, alertasEmail: v }))}
              aria-label="Recibir aviso por correo electrónico"
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2">
            <span className="text-sm font-semibold text-foreground">Alertas activas</span>
            <Switch
              checked={prefs.activo}
              onCheckedChange={(v) => setPrefs((p) => ({ ...p, activo: v }))}
              aria-label="Alertas activas"
            />
          </label>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPrefs(PREFERENCIAS_VACIAS)}
          >
            Limpiar
          </Button>
          <Button type="button" disabled={guardando} onClick={() => void guardar()}>
            {guardando ? "Guardando…" : "Guardar alertas"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
