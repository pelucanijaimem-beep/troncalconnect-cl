import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "./StarRating";
import { calificar } from "@/lib/use-calificaciones";

export type EvaluacionPendiente = {
  evaluado: string;
  ruta: string;
  papel: "Transportista" | "Generador de Carga";
};

export function RatingDialog({
  evaluacion,
  autor,
  onOpenChange,
}: {
  evaluacion: EvaluacionPendiente | null;
  autor: string;
  onOpenChange: (o: boolean) => void;
}) {
  const [estrellas, setEstrellas] = useState(5);
  const [comentario, setComentario] = useState("");

  useEffect(() => {
    if (evaluacion) {
      setEstrellas(5);
      setComentario("");
    }
  }, [evaluacion]);

  const enviar = () => {
    if (!evaluacion) return;
    calificar({
      evaluado: evaluacion.evaluado,
      autor,
      estrellas,
      comentario: comentario.trim() || "Sin comentarios.",
      ruta: evaluacion.ruta,
    });
    onOpenChange(false);
    toast.success("¡Gracias por tu evaluación!", {
      description: "Tu calificación ayuda a construir confianza en la comunidad TroncalTrack.",
    });
  };

  return (
    <Dialog open={Boolean(evaluacion)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-warning" /> Calificar servicio
          </DialogTitle>
          <DialogDescription>
            {evaluacion
              ? `Evalúa a ${evaluacion.evaluado} (${evaluacion.papel}) por el viaje ${evaluacion.ruta}.`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Calificación (1 a 5 estrellas)</Label>
            <div>
              <StarRating valor={estrellas} onChange={setEstrellas} size={28} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="comentario-eval">Comentario</Label>
            <Textarea
              id="comentario-eval"
              rows={4}
              placeholder="Puntualidad, estado de la carga, comunicación, forma de pago…"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Ahora no
          </Button>
          <Button onClick={enviar}>Enviar evaluación</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
