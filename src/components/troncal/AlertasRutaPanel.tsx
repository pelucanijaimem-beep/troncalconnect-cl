import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AlertTriangle, ShieldAlert } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSesion } from "@/lib/use-session";
import {
  TIPOS_ALERTA_RUTA,
  alertasRecientesPara,
  crearAlertaRuta,
  type AlertaRuta,
} from "@/lib/use-alertas-ruta";

/**
 * Se muestra dentro del detalle de una carga. Carga alertas recientes para el
 * mismo origen/destino y ofrece un botón para reportar una nueva. Fase 1:
 * coincidencia por nombre de ciudad, sin GPS ni mapa — rápido de construir,
 * sin costo de APIs externas.
 */
export function AlertasRutaPanel({ origen, destino }: { origen: string; destino: string }) {
  const sesion = useSesion();
  const [alertas, setAlertas] = useState<AlertaRuta[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [tipo, setTipo] = useState<string>(TIPOS_ALERTA_RUTA[0]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let vivo = true;
    void alertasRecientesPara(origen, destino).then((a) => {
      if (vivo) setAlertas(a);
    });
    return () => {
      vivo = false;
    };
  }, [origen, destino]);

  const reportar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!sesion) {
      toast.error("Inicia sesión para reportar.");
      return;
    }
    const detalle = String(new FormData(e.currentTarget).get("detalle") ?? "");
    setEnviando(true);
    const error = await crearAlertaRuta({ userId: sesion.id, tipo, origen, destino, detalle });
    setEnviando(false);
    if (error) {
      toast.error("No pudimos registrar el reporte", { description: error });
      return;
    }
    toast.success("Gracias, tu reporte ayuda a otros camioneros en esta ruta.");
    setAbierto(false);
    void alertasRecientesPara(origen, destino).then(setAlertas);
  };

  return (
    <>
      {alertas.length > 0 && (
        <div className="flex gap-2 rounded-lg border border-warning bg-warning/10 p-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <div>
            <p className="font-semibold text-foreground">
              {alertas.length} reporte{alertas.length === 1 ? "" : "s"} reciente
              {alertas.length === 1 ? "" : "s"} en esta ruta
            </p>
            <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
              {alertas.slice(0, 3).map((a) => (
                <li key={a.id}>
                  {a.tipo} · {a.origen} → {a.destino}
                  {a.detalle ? ` — ${a.detalle}` : ""}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <Button
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => setAbierto(true)}
      >
        <ShieldAlert className="h-4 w-4" /> Reportar algo en esta ruta
      </Button>

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reportar un problema en la ruta</DialogTitle>
            <DialogDescription>
              {origen} → {destino}. Tu reporte queda visible para otros camioneros con rutas
              similares durante 45 días.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(e) => void reportar(e)}>
            <div className="space-y-1.5">
              <Label>Tipo de problema</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_ALERTA_RUTA.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="detalle-alerta">Detalle (opcional)</Label>
              <Textarea
                id="detalle-alerta"
                name="detalle"
                placeholder="Ej: cerca del peaje, de noche, vehículo gris siguiendo por 10 km"
                maxLength={300}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={enviando} className="w-full">
                {enviando ? "Enviando…" : "Enviar reporte"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
