import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CalendarClock, CheckCircle2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DOCUMENTOS_VENCIMIENTO,
  estadoVencimiento,
  resumenVencimientos,
  useVencimientos,
  type Vencimientos,
} from "@/lib/use-vencimientos";
import { revisarVencimientos } from "@/lib/vencimientos.functions";

const COLOR = {
  vencido: "text-destructive",
  por_vencer: "text-warning",
  vigente: "text-success",
  sin_fecha: "text-muted-foreground",
} as const;

const FONDO = {
  vencido: "border-destructive/40 bg-destructive/10",
  por_vencer: "border-warning/40 bg-warning/10",
  vigente: "border-border bg-card",
  sin_fecha: "border-dashed border-border bg-card",
} as const;

/** Vencimientos documentales del transportista y su vehículo (ingreso manual). */
export function DocExpiryPanel({ userId }: { userId?: string }) {
  const { datos, guardar } = useVencimientos(userId);
  const [form, setForm] = useState<Vencimientos>(datos);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => setForm(datos), [datos]);

  // Avisos automáticos a 30, 15 y 7 días del vencimiento.
  useEffect(() => {
    if (!userId) return;
    void revisarVencimientos({ data: undefined }).catch(() => {
      /* el aviso es complementario y no bloquea el panel */
    });
  }, [userId, datos]);

  const { vencidos, porVencer } = resumenVencimientos(datos);

  const onGuardar = async () => {
    setGuardando(true);
    const error = await guardar(form);
    setGuardando(false);
    if (error) {
      toast.error("No pudimos guardar tus vencimientos", { description: error });
      return;
    }
    toast.success("Vencimientos guardados", {
      description: "Te avisaremos cuando falten 30, 15 y 7 días para cada vencimiento.",
    });
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-foreground">
          <CalendarClock className="h-4 w-4 text-primary" /> Vencimientos de documentos
        </h3>
        {vencidos > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">
            <AlertTriangle className="h-3.5 w-3.5" /> {vencidos} documento(s) vencido(s)
          </span>
        ) : porVencer > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-3 py-1 text-xs font-bold text-warning">
            <AlertTriangle className="h-3.5 w-3.5" /> {porVencer} por vencer
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">
            <CheckCircle2 className="h-3.5 w-3.5" /> Documentos al día
          </span>
        )}
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        Ingresa manualmente la fecha de vencimiento de cada documento. Te avisamos cuando falten
        30, 15 y 7 días, y marcamos en rojo lo que ya venció.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="v-patente">Patente del vehículo (opcional)</Label>
          <Input
            id="v-patente"
            value={form.patente}
            onChange={(e) => setForm({ ...form, patente: e.target.value.toUpperCase() })}
            placeholder="ABCD12"
            className="mt-1"
          />
        </div>

        {DOCUMENTOS_VENCIMIENTO.map((d) => {
          const est = estadoVencimiento(form[d.clave]);
          return (
            <div key={d.clave} className={`rounded-lg border p-3 ${FONDO[est.estado]}`}>
              <Label htmlFor={`v-${d.clave}`} className="text-sm font-semibold">
                {d.label}
                {d.opcional && (
                  <span className="ml-1 text-xs font-normal text-muted-foreground">(si aplica)</span>
                )}
              </Label>
              <Input
                id={`v-${d.clave}`}
                type="date"
                value={form[d.clave]}
                onChange={(e) => setForm({ ...form, [d.clave]: e.target.value })}
                className="mt-1"
              />
              <p className={`mt-1 text-xs font-bold ${COLOR[est.estado]}`}>{est.texto}</p>
              <p className="text-xs text-muted-foreground">{d.ayuda}</p>
            </div>
          );
        })}
      </div>

      <Button className="mt-4" onClick={() => void onGuardar()} disabled={guardando}>
        <Save className="h-4 w-4" /> {guardando ? "Guardando…" : "Guardar vencimientos"}
      </Button>
    </div>
  );
}
