import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { FileCheck2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VerificationBadge, VerificationDisclaimer } from "./VerificationBadge";
import { enviarDocumentos, useVerificacion, type Documentos } from "@/lib/use-verificacion";

const CAMPOS: { name: keyof Documentos; label: string; ayuda: string; requerido: boolean }[] = [
  {
    name: "identidad",
    label: "RUT Empresa o Cédula de Identidad del Conductor",
    ayuda: "Documento vigente por ambos lados (PDF, JPG o PNG).",
    requerido: true,
  },
  {
    name: "licencia",
    label: "Licencia de Conducir (Clase A4 / A5)",
    ayuda: "Debe estar vigente y legible.",
    requerido: true,
  },
  {
    name: "padron",
    label: "Padrón / Certificado de Anotaciones Vigentes (Patente)",
    ayuda: "Del camión y de la rampla, si corresponde.",
    requerido: true,
  },
  {
    name: "poliza",
    label: "Póliza de Seguro de Carga (Opcional)",
    ayuda: "Al adjuntarla obtienes la insignia especial «Asegurado».",
    requerido: false,
  },
];

export function VerificationDialog({
  open,
  onOpenChange,
  usuario,
  userId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  usuario: string;
  userId?: string | undefined;
}) {
  const verificacion = useVerificacion(usuario);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) {
      toast.error("Debes iniciar sesión para enviar tus documentos.");
      return;
    }
    const form = e.currentTarget;
    const archivos: Partial<Record<keyof Documentos, File>> = {};
    for (const campo of CAMPOS) {
      const input = form.elements.namedItem(campo.name) as HTMLInputElement | null;
      const archivo = input?.files?.[0];
      if (archivo) archivos[campo.name] = archivo;
    }
    if (!archivos.identidad || !archivos.licencia || !archivos.padron) {
      toast.error("Faltan documentos obligatorios", {
        description: "Adjunta identidad, licencia y padrón para iniciar la validación.",
      });
      return;
    }
    setEnviando(true);
    const error = await enviarDocumentos({ userId, nombre: usuario, archivos });
    setEnviando(false);
    if (error) {
      toast.error("No pudimos recibir tus documentos", { description: error });
      return;
    }
    toast.success("Documentos recibidos", {
      description:
        "Tus documentos han sido recibidos. Nuestro equipo validará la información en un plazo máximo de 24 horas hábiles.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-trust" /> Verificación de Identidad
          </DialogTitle>
          <DialogDescription>
            TroncalCheck valida tus documentos para prevenir fraudes, suplantación y robo de carga.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Estado actual
          </p>
          <VerificationBadge estado={verificacion.estado} asegurado={verificacion.asegurado} />
          {verificacion.estado === "en_revision" && (
            <p className="mt-2 text-xs text-muted-foreground">
              Tus documentos han sido recibidos. Nuestro equipo validará la información en un plazo
              máximo de 24 horas hábiles.
            </p>
          )}
          {verificacion.estado === "rechazado" && verificacion.nota && (
            <p className="mt-2 text-xs font-medium text-destructive">
              Motivo: {verificacion.nota}
            </p>
          )}
        </div>

        <form onSubmit={enviar} className="space-y-4">
          {CAMPOS.map((c) => (
            <div key={c.name} className="space-y-1.5">
              <Label htmlFor={`doc-${c.name}`}>{c.label}</Label>
              <Input
                id={`doc-${c.name}`}
                name={c.name}
                type="file"
                accept="image/*,.pdf"
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">{c.ayuda}</p>
              {verificacion.documentos[c.name] && (
                <p className="inline-flex items-center gap-1 text-xs font-medium text-success">
                  <FileCheck2 className="h-3.5 w-3.5" /> Documento adjuntado
                </p>
              )}
            </div>
          ))}

          <VerificationDisclaimer />

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
            <Button type="submit" disabled={enviando}>
              {enviando ? "Enviando documentos…" : "Enviar a Verificación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
