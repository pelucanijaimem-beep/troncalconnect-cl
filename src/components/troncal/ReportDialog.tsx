import { useEffect, useState, type FormEvent } from "react";
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
import { crearReporte, detalleObligatorio, motivosPara, type TipoReporte } from "@/lib/reportes";
import { useSesion } from "@/lib/use-session";

export type ObjetoReporte = {
  tipo: TipoReporte;
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
  const tipo: TipoReporte = objeto?.tipo ?? "publicacion";
  const motivos = motivosPara(tipo);
  const [motivo, setMotivo] = useState<string>(motivos[0] ?? "");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    setMotivo(motivosPara(objeto?.tipo ?? "publicacion")[0] ?? "");
  }, [objeto]);

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
    toast.success("Reporte enviado", {
      description: "El equipo de TroncalTrack lo revisará y tomará medidas si corresponde.",
    });
  };

  return (
    <Dialog open={Boolean(objeto)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {tipo === "empresa"
              ? "Reportar esta empresa"
              : `Reportar ${tipo === "usuario" ? "usuario" : "publicación"}`}
          </DialogTitle>
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
                {motivos.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="r-detalle">
              {detalleObligatorio(tipo) ? "Cuéntanos qué ocurrió" : "Comentario (opcional)"}
            </Label>
            <Textarea
              id="r-detalle"
              name="detalle"
              maxLength={500}
              placeholder="Describe la situación con el mayor detalle posible."
              required={detalleObligatorio(tipo)}
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
