import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Star, ThumbsDown, ThumbsUp } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { StarRating } from "./StarRating";
import {
  ETIQUETAS,
  MAX_COMENTARIO_CALIFICACION,
  validarCalificacion,
} from "@/lib/calificacion-viaje";
import { calificarViaje, type CalificacionPendiente } from "@/lib/use-calificaciones";

export type EvaluacionPendiente = CalificacionPendiente;

function Etiqueta({
  texto,
  activa,
  negativa,
  onClick,
}: {
  texto: string;
  activa: boolean;
  negativa: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={activa}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
        activa
          ? negativa
            ? "border-destructive bg-destructive/10 text-destructive"
            : "border-success bg-success-soft text-success"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {negativa ? <ThumbsDown className="h-3 w-3" /> : <ThumbsUp className="h-3 w-3" />}
      {texto}
    </button>
  );
}

/** "Calificar Experiencia del Viaje": solo para viajes entregados y conformes. */
export function RatingDialog({
  evaluacion,
  onOpenChange,
}: {
  evaluacion: EvaluacionPendiente | null;
  onOpenChange: (o: boolean) => void;
}) {
  const [estrellas, setEstrellas] = useState(5);
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (evaluacion) {
      setEstrellas(5);
      setEtiquetas([]);
      setComentario("");
    }
  }, [evaluacion]);

  const tipo = evaluacion?.tipo ?? "a_empresa";
  const grupos = ETIQUETAS[tipo];
  const papel = tipo === "a_empresa" ? "Empresa Generadora" : "Transportista";

  const alternar = (e: string) =>
    setEtiquetas((p) => (p.includes(e) ? p.filter((x) => x !== e) : [...p, e]));

  const enviar = async () => {
    if (!evaluacion) return;
    const invalida = validarCalificacion({ tipo, estrellas, etiquetas, comentario });
    if (invalida) {
      toast.error(invalida);
      return;
    }
    setEnviando(true);
    const error = await calificarViaje({
      cargaId: evaluacion.cargaId,
      estrellas,
      etiquetas,
      comentario,
    });
    setEnviando(false);
    if (error) {
      toast.error("No pudimos guardar tu calificación", { description: error });
      return;
    }
    onOpenChange(false);
    toast.success("¡Gracias por calificar tu viaje!", {
      description: "Tu reseña suma a la reputación verificada de la comunidad TroncalTrack.",
    });
  };

  return (
    <Dialog open={Boolean(evaluacion)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-warning" /> Calificar Experiencia del Viaje
          </DialogTitle>
          <DialogDescription>
            {evaluacion
              ? `Evalúa a ${evaluacion.contraparte} (${papel}) por el viaje ${evaluacion.ruta}. Solo puedes calificar una vez.`
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

          <div className="space-y-2">
            <Label>Lo que destacas</Label>
            <div className="flex flex-wrap gap-2">
              {grupos.positivas.map((e) => (
                <Etiqueta
                  key={e}
                  texto={e}
                  negativa={false}
                  activa={etiquetas.includes(e)}
                  onClick={() => alternar(e)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Lo que se puede mejorar</Label>
            <div className="flex flex-wrap gap-2">
              {grupos.negativas.map((e) => (
                <Etiqueta
                  key={e}
                  texto={e}
                  negativa
                  activa={etiquetas.includes(e)}
                  onClick={() => alternar(e)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="comentario-eval">Comentario breve (opcional)</Label>
            <Textarea
              id="comentario-eval"
              rows={3}
              maxLength={MAX_COMENTARIO_CALIFICACION}
              placeholder={
                tipo === "a_empresa"
                  ? "Tiempos en planta, trato, condiciones de pago…"
                  : "Puntualidad, cuidado de la carga, comunicación…"
              }
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
            <p className="text-right text-xs text-muted-foreground">
              {comentario.length}/{MAX_COMENTARIO_CALIFICACION}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Ahora no
          </Button>
          <Button disabled={enviando} onClick={() => void enviar()}>
            {enviando ? "Enviando…" : "Enviar calificación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
