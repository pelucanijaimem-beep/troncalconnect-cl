import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { FileCheck2, Flame, ShieldCheck, Trees } from "lucide-react";
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
import { VerificationChecklist } from "./VerificationChecklist";
import {
  DOC_CHILEVALORA,
  documentosRequeridos,
  enviarDocumentos,
  guardarChilevalora,
  guardarInduccionForestal,
  useMiChilevalora,
  useVerificacion,
  type Documentos,
  type RolVerificacion,
} from "@/lib/use-verificacion";

type Campo = { name: keyof Documentos; label: string; ayuda: string; requerido: boolean };

/** Formulario documental según el tipo de cuenta. */
function camposDe(rol: RolVerificacion): Campo[] {
  const empresa = rol === "empresa";
  return [
    ...(empresa
      ? []
      : [
          {
            name: "identidad" as keyof Documentos,
            label: "Cédula de Identidad del Conductor",
            ayuda: "Documento vigente por ambos lados (PDF, JPG o PNG).",
            requerido: true,
          },
        ]),
    ...documentosRequeridos(rol).map((d) => ({
      name: d.clave as keyof Documentos,
      label: d.label,
      ayuda: d.ayuda,
      requerido: true,
    })),
    {
      name: "poliza",
      label: empresa
        ? "Póliza de Seguro de Mercadería (Opcional)"
        : "Póliza de Seguro de Carga (Opcional)",
      ayuda: "Al adjuntarla obtienes la insignia especial «Asegurado».",
      requerido: false,
    },
  ];
}

export function VerificationDialog({
  open,
  onOpenChange,
  usuario,
  userId,
  rol = "camionero",
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  usuario: string;
  userId?: string | undefined;
  rol?: RolVerificacion;
}) {
  const verificacion = useVerificacion(usuario);
  const [enviando, setEnviando] = useState(false);
  const campos = camposDe(rol);
  const esCamionero = rol === "camionero";
  const chilevalora = useMiChilevalora(open && esCamionero);
  const [enviandoChv, setEnviandoChv] = useState(false);
  const [enviandoForestal, setEnviandoForestal] = useState(false);

  const enviarChilevalora = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;
    const d = new FormData(e.currentTarget);
    const numero = String(d.get("chv_numero") ?? "").trim();
    const vigencia = String(d.get("chv_vigencia") ?? "");
    const archivo = (e.currentTarget.elements.namedItem("chv_archivo") as HTMLInputElement | null)
      ?.files?.[0];
    if (!numero || !vigencia || !archivo) {
      toast.error("Completa número, vigencia y adjunta el certificado.");
      return;
    }
    setEnviandoChv(true);
    const error = await guardarChilevalora({ userId, numero, vigencia, archivo });
    setEnviandoChv(false);
    if (error) {
      toast.error("No pudimos recibir el certificado", { description: error });
      return;
    }
    toast.success("Certificado recibido", {
      description: "El equipo TroncalCheck lo revisará antes de habilitarte para sustancias peligrosas.",
    });
  };

  const enviarForestal = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;
    const d = new FormData(e.currentTarget);
    setEnviandoForestal(true);
    const error = await guardarInduccionForestal({
      userId,
      empresa: String(d.get("forestal_empresa") ?? ""),
      fecha: String(d.get("forestal_fecha") ?? ""),
    });
    setEnviandoForestal(false);
    if (error) {
      toast.error("No pudimos guardar tu declaración", { description: error });
      return;
    }
    toast.success("Inducción forestal declarada", {
      description: "Ya puedes postular a cargas forestales.",
    });
  };

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) {
      toast.error("Debes iniciar sesión para enviar tus documentos.");
      return;
    }
    const form = e.currentTarget;
    const archivos: Partial<Record<keyof Documentos, File>> = {};
    for (const campo of campos) {
      const input = form.elements.namedItem(campo.name) as HTMLInputElement | null;
      const archivo = input?.files?.[0];
      if (archivo) archivos[campo.name] = archivo;
    }
    const faltantes = campos.filter(
      (c) => c.requerido && !archivos[c.name] && !verificacion.documentos[c.name],
    );
    if (faltantes.length > 0) {
      toast.error("Faltan documentos obligatorios", {
        description: `Adjunta: ${faltantes.map((f) => f.label).join(", ")}.`,
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
          {verificacion.revisionEnCurso && (
            <p className="mt-2 text-xs text-muted-foreground">
              Estamos revisando tu verificación, te avisaremos pronto.
            </p>
          )}
          {verificacion.estado === "en_revision" && !verificacion.revisionEnCurso && (
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

        <VerificationChecklist checklist={verificacion.checklist} rol={rol} />

        <form onSubmit={enviar} className="space-y-4">
          {campos.map((c) => (
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

        {esCamionero && (
          <div className="space-y-4 border-t border-border pt-4">
            <form onSubmit={(e) => void enviarChilevalora(e)} className="space-y-3">
              <p className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                <Flame className="h-4 w-4 text-primary" /> {DOC_CHILEVALORA.label} (opcional)
              </p>
              <p className="text-xs text-muted-foreground">{DOC_CHILEVALORA.ayuda}</p>
              {chilevalora?.adjuntado && (
                <p className="inline-flex items-center gap-1 text-xs font-medium text-success">
                  <FileCheck2 className="h-3.5 w-3.5" /> Certificado adjuntado — estado:{" "}
                  {chilevalora.estado === "aprobado"
                    ? "Aprobado"
                    : chilevalora.estado === "rechazado"
                      ? "Rechazado"
                      : "Pendiente de revisión"}
                  {chilevalora.vigencia
                    ? ` · Vigente hasta ${new Date(chilevalora.vigencia + "T00:00:00").toLocaleDateString("es-CL")}`
                    : ""}
                </p>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="chv_numero">Número de certificado</Label>
                  <Input
                    id="chv_numero"
                    name="chv_numero"
                    placeholder="Ej. 12345678"
                    defaultValue={chilevalora?.numero ?? ""}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="chv_vigencia">Fecha de vigencia</Label>
                  <Input id="chv_vigencia" name="chv_vigencia" type="date" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="chv_archivo">Foto o PDF del certificado</Label>
                <Input
                  id="chv_archivo"
                  name="chv_archivo"
                  type="file"
                  accept="image/*,.pdf"
                  className="cursor-pointer"
                />
              </div>
              <Button type="submit" variant="outline" disabled={enviandoChv}>
                {enviandoChv ? "Enviando…" : "Enviar certificado a revisión"}
              </Button>
            </form>

            <form onSubmit={(e) => void enviarForestal(e)} className="space-y-3">
              <p className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                <Trees className="h-4 w-4 text-success" /> Inducción de transporte forestal
              </p>
              <p className="text-xs text-muted-foreground">
                Declara que cuentas con inducción o capacitación de transporte forestal. Es una
                declaración simple: no requiere aprobación del equipo.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="forestal_empresa">Empresa forestal (opcional)</Label>
                  <Input
                    id="forestal_empresa"
                    name="forestal_empresa"
                    placeholder="¿Dónde la recibiste?"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="forestal_fecha">Fecha de la inducción</Label>
                  <Input id="forestal_fecha" name="forestal_fecha" type="date" required />
                </div>
              </div>
              <Button type="submit" variant="outline" disabled={enviandoForestal}>
                {enviandoForestal ? "Guardando…" : "Declarar inducción forestal"}
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
