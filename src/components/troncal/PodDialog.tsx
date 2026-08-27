import { useState, type ChangeEvent } from "react";
import { Camera, FileCheck2, Upload } from "lucide-react";
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
import { guardarPod } from "@/lib/use-tablero-prefs";
import type { Carga } from "@/lib/troncal-data";

/** Adjunta o fotografía la Guía de Despacho (POD) firmada para liberar el pago. */
export function PodDialog({
  carga,
  onOpenChange,
  onConfirmado,
}: {
  carga: Carga | null;
  onOpenChange: (o: boolean) => void;
  onConfirmado: (c: Carga) => void;
}) {
  const [imagen, setImagen] = useState("");
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [observacion, setObservacion] = useState("");

  const leer = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error("La imagen es muy pesada", { description: "Adjunta una foto de menos de 4 MB." });
      return;
    }
    const lector = new FileReader();
    lector.onload = () => {
      setImagen(String(lector.result ?? ""));
      setNombreArchivo(file.name);
    };
    lector.readAsDataURL(file);
  };

  const confirmar = () => {
    if (!carga) return;
    if (!imagen) {
      toast.error("Adjunta la Guía de Despacho firmada para continuar.");
      return;
    }
    guardarPod(carga.id, {
      imagen,
      nombreArchivo,
      observacion,
      fecha: new Date().toISOString(),
    });
    setImagen("");
    setNombreArchivo("");
    setObservacion("");
    onConfirmado(carga);
    toast.success("Guía de Despacho recibida", {
      description: "La carga quedó marcada como Entregada y se solicitó la liberación del pago.",
    });
  };

  return (
    <Dialog open={!!carga} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {carga && (
          <>
            <DialogHeader>
              <DialogTitle>Guía de Despacho firmada (POD)</DialogTitle>
              <DialogDescription>
                {carga.origen} → {carga.destino}. Adjunta o toma una foto de la guía firmada por el
                receptor para marcar la carga como entregada y solicitar el pago.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-surface p-4 text-center text-sm font-semibold text-foreground hover:border-primary">
                  <Camera className="h-6 w-6 text-primary" /> Tomar foto
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="sr-only"
                    onChange={leer}
                  />
                </label>
                <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-surface p-4 text-center text-sm font-semibold text-foreground hover:border-primary">
                  <Upload className="h-6 w-6 text-primary" /> Adjuntar archivo
                  <input type="file" accept="image/*" className="sr-only" onChange={leer} />
                </label>
              </div>

              {imagen && (
                <div className="rounded-xl border border-border bg-surface p-3">
                  <p className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-success">
                    <FileCheck2 className="h-4 w-4" /> {nombreArchivo || "Documento adjunto"}
                  </p>
                  <img
                    src={imagen}
                    alt="Guía de despacho firmada"
                    className="max-h-56 w-full rounded-lg object-contain"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="pod-obs">Observaciones de la entrega (opcional)</Label>
                <Textarea
                  id="pod-obs"
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  placeholder="Recibido conforme, sin daños…"
                />
              </div>
            </div>

            <DialogFooter>
              <Button className="w-full sm:w-auto" onClick={confirmar}>
                <FileCheck2 className="h-4 w-4" /> Marcar Entregada y solicitar pago
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
