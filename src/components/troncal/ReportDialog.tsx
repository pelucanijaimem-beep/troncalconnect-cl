import { useState, type FormEvent } from "react";
import { toast } from "sonner";
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
import { MOTIVOS_REPORTE, crearReporte } from "@/lib/reportes";
import { useSesion } from "@/lib/use-session";

export type ObjetoReporte = {
  tipo: "publicacion" | "usuario";
  cargaId?: string | null;
  reportadoId?: string | null;
  nombre: string;
  resumen: string;
};

export function ReportDialog({
  objeto,
  onOpenChange,
}: {
  objeto: ObjetoReporte | null;
  onOpenChange: (abierto: boolean) => void;
}) {
  const sesion = useSesion();
  const [motivo, setMotivo] = useState<string>(MOTIVOS_REPORTE[0]);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!objeto) return;
    if (!sesion) {
      toast.error("Inicia sesión para enviar un reporte.");
      return;
    }
    const detalle = String(new FormData(e.currentTarget).get("detalle") ?? "");
    setEnviando(true);
    const error = await crearReporte({
      reportanteId: sesion.id,
      tipo: objeto.tipo,
      cargaId: objeto.cargaId ?? null,
      reportadoId: objeto.reportadoId ?? null,
      reportadoNombre: objeto.nombre,
      motivo,
      detalle,
    });
    setEnviando(false);
    if (error) {
      toast.error("No pudimos enviar el reporte", { description: error });
      return;
    }
    onOpenChange(false);
    setMotivo(MOTIVOS_REPORTE[0]);
    toast.success("Reporte enviado", {
      description: "El equipo de TroncalTrack lo revisará y tomará medidas si corresponde.",
    });
  };

  return (
    <Dialog open={Boolean(objeto)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reportar {objeto?.tipo === "usuario" ? "usuario" : "publicación"}</DialogTitle>
          <DialogDescription>
            {objeto?.nombre}
            {objeto?.resumen ? ` · ${objeto.resumen}` : ""}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => void enviar(e)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Motivo</Label>
            <Select value={motivo} onValueChange={setMotivo}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                {MOTIVOS_REPORTE.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="r-detalle">Cuéntanos qué ocurrió</Label>
            <Textarea
              id="r-detalle"
              name="detalle"
              placeholder="Describe la situación con el mayor detalle posible."
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={enviando} className="w-full sm:w-auto">
              {enviando ? "Enviando…" : "Enviar reporte"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
