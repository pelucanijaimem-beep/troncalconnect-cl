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
import {
  aprobarVerificacion,
  enviarDocumentos,
  useVerificacion,
  type Documentos,
} from "@/lib/use-verificacion";

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
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  usuario: string;
}) {
  const verificacion = useVerificacion(usuario);
  const [enviando, setEnviando] = useState(false);

  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const docs: Documentos = {};
    for (const campo of CAMPOS) {
      const input = form.elements.namedItem(campo.name) as HTMLInputElement | null;
      const archivo = input?.files?.[0];
      if (archivo) docs[campo.name] = archivo.name;
    }
    if (!docs.identidad || !docs.licencia || !docs.padron) {
      toast.error("Faltan documentos obligatorios", {
        description: "Adjunta identidad, licencia y padrón para iniciar la validación.",
      });
      return;
    }
    setEnviando(true);
    enviarDocumentos(usuario, docs);
    toast.info("Documentos recibidos", {
      description: "Nuestro equipo TroncalCheck está validando tu documentación.",
    });
    window.setTimeout(() => {
      aprobarVerificacion(usuario);
      setEnviando(false);
      toast.success("¡Perfil Verificado — TroncalCheck!", {
        description: "Tu sello de confianza ya aparece junto a tu nombre en el tablero.",
      });
    }, 2500);
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
          <VerificationBadge
            estado={verificacion.estado}
            asegurado={verificacion.asegurado}
          />
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
                  <FileCheck2 className="h-3.5 w-3.5" /> Adjunto:{" "}
                  {verificacion.documentos[c.name]}
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
              {enviando ? "Validando documentos…" : "Enviar a Verificación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
