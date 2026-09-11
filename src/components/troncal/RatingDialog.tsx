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
import { calificar, type Criterios } from "@/lib/use-calificaciones";

export type EvaluacionPendiente = {
  evaluado: string;
  evaluadoId?: string | undefined;
  cargaId?: string | undefined;
  ruta: string;
  papel: "Transportista" | "Generador de Carga";
};

const CRITERIOS_EMPRESA: { clave: keyof Criterios; label: string }[] = [
  { clave: "puntualidad_pago", label: "Puntualidad en el pago" },
  { clave: "condiciones_carga", label: "Condiciones de carga y descarga" },
];

const CRITERIOS_CAMIONERO: { clave: keyof Criterios; label: string }[] = [
  { clave: "puntualidad", label: "Puntualidad en retiro y entrega" },
  { clave: "estado_camion", label: "Estado y presentación del camión" },
];

export function RatingDialog({
  evaluacion,
  autor,
  autorId,
  onOpenChange,
}: {
  evaluacion: EvaluacionPendiente | null;
  autor: string;
  autorId: string | undefined;
  onOpenChange: (o: boolean) => void;
}) {
  const [estrellas, setEstrellas] = useState(5);
  const [criterios, setCriterios] = useState<Criterios>({});
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);

  const esEmpresa = evaluacion?.papel === "Generador de Carga";
  const lista = esEmpresa ? CRITERIOS_EMPRESA : CRITERIOS_CAMIONERO;

  useEffect(() => {
    if (evaluacion) {
      setEstrellas(5);
      setComentario("");
      setCriterios(
        evaluacion.papel === "Generador de Carga"
          ? { puntualidad_pago: 5, condiciones_carga: 5 }
          : { puntualidad: 5, estado_camion: 5 },
      );
    }
  }, [evaluacion]);

  const enviar = async () => {
    if (!evaluacion) return;
    if (!autorId) {
      toast.error("Inicia sesión para calificar.");
      return;
    }
    setEnviando(true);
    const error = await calificar({
      autorId,
      autor,
      evaluado: evaluacion.evaluado,
      evaluadoId: evaluacion.evaluadoId,
      cargaId: evaluacion.cargaId,
      tipo: esEmpresa ? "a_empresa" : "a_camionero",
      estrellas,
      criterios,
      comentario: comentario.trim() || "Sin comentarios.",
      ruta: evaluacion.ruta,
    });
    setEnviando(false);
    if (error) {
      toast.error("No pudimos guardar tu evaluación", { description: error });
      return;
    }
    onOpenChange(false);
    toast.success("¡Gracias por tu evaluación!", {
      description: "Tu calificación ayuda a construir confianza en la comunidad TroncalTrack.",
    });
  };

  return (
    <Dialog open={Boolean(evaluacion)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-warning" /> Calificar viaje finalizado
          </DialogTitle>
          <DialogDescription>
            {evaluacion
              ? `Evalúa a ${evaluacion.evaluado} (${evaluacion.papel}) por el viaje ${evaluacion.ruta}.`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Calificación general (1 a 5 estrellas)</Label>
            <div>
              <StarRating valor={estrellas} onChange={setEstrellas} size={28} />
            </div>
          </div>

          {lista.map((c) => (
            <div key={String(c.clave)} className="space-y-1.5">
              <Label>{c.label}</Label>
              <div>
                <StarRating
                  valor={criterios[c.clave] ?? 5}
                  onChange={(v) => setCriterios((p) => ({ ...p, [c.clave]: v }))}
                  size={22}
                />
              </div>
            </div>
          ))}

          <div className="space-y-1.5">
            <Label htmlFor="comentario-eval">Comentario</Label>
            <Textarea
              id="comentario-eval"
              rows={4}
              placeholder={
                esEmpresa
                  ? "Forma y plazo de pago, tiempos de espera en planta, comunicación…"
                  : "Puntualidad, cuidado de la carga, estado del equipo, comunicación…"
              }
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Ahora no
          </Button>
          <Button disabled={enviando} onClick={() => void enviar()}>
            {enviando ? "Enviando…" : "Enviar evaluación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
