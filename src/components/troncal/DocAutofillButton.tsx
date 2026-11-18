import { useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, ScanText } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { leerVencimientosDocumento } from "@/lib/lectura-vencimientos.functions";
import { MAX_BYTES_LECTURA, TIPOS_LECTURA, type LecturaDocumento, type TipoLectura } from "@/lib/lectura-vencimientos";
import { DOCUMENTOS_VENCIMIENTO } from "@/lib/use-vencimientos";

const LADO_MAXIMO = 1800;

function leerBase64(archivo: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(String(lector.result).split(",")[1] ?? "");
    lector.onerror = () => reject(lector.error);
    lector.readAsDataURL(archivo);
  });
}

/** Phone photos are large: shrink them to a legible JPEG before sending. */
async function prepararImagen(archivo: File): Promise<{ base64: string; tipo: TipoLectura }> {
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.round(bitmap.width * escala);
  lienzo.height = Math.round(bitmap.height * escala);
  lienzo.getContext("2d")?.drawImage(bitmap, 0, 0, lienzo.width, lienzo.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) => lienzo.toBlob(r, "image/jpeg", 0.85));
  if (!blob) throw new Error("imagen");
  return { base64: await leerBase64(blob), tipo: "image/jpeg" };
}

/** Reads a document photo/PDF and hands the found values to the form; nothing is saved here. */
export function DocAutofillButton({ onAplicar }: { onAplicar: (lectura: LecturaDocumento) => void }) {
  const entrada = useRef<HTMLInputElement>(null);
  const [leyendo, setLeyendo] = useState(false);
  const leer = useServerFn(leerVencimientosDocumento);

  const procesar = async (archivo: File) => {
    const esPdf = archivo.type === "application/pdf";
    if (!esPdf && !archivo.type.startsWith("image/")) {
      toast.error("Formato no compatible", { description: "Sube una foto (JPG, PNG) o un PDF del documento." });
      return;
    }
    if (esPdf && archivo.size > MAX_BYTES_LECTURA) {
      toast.error("El PDF es demasiado grande", { description: "Sube un archivo de hasta 4 MB o una foto del documento." });
      return;
    }
    setLeyendo(true);
    try {
      const preparado = esPdf
        ? { base64: await leerBase64(archivo), tipo: "application/pdf" as const }
        : await prepararImagen(archivo);
      if (!(TIPOS_LECTURA as readonly string[]).includes(preparado.tipo)) throw new Error("tipo");
      const r = await leer({ data: { nombre: archivo.name.slice(0, 120) || "documento", ...preparado } });
      if (!r.ok) {
        toast.error(
          r.motivo === "pausa" ? "La lectura automática no está disponible por ahora" : "No pudimos leer el documento",
          { description: "Puedes ingresar las fechas manualmente." },
        );
        return;
      }
      const encontrados = DOCUMENTOS_VENCIMIENTO.filter((d) => r.lectura[d.clave]).map((d) => d.label);
      if (r.lectura.patente) encontrados.push("Patente");
      if (encontrados.length === 0) {
        toast.message("No encontramos fechas de vencimiento legibles", {
          description: "Prueba con una foto más nítida o ingresa las fechas manualmente.",
        });
        return;
      }
      onAplicar(r.lectura);
      toast.success(`Completamos: ${encontrados.join(", ")}`, {
        description: "Revisa que coincidan con tu documento y presiona Guardar vencimientos.",
      });
    } catch {
      toast.error("No pudimos leer el documento", { description: "Revisa tu conexión o ingresa las fechas manualmente." });
    } finally {
      setLeyendo(false);
    }
  };

  return (
    <>
      <input
        ref={entrada}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        aria-label="Documento para autocompletar vencimientos"
        onChange={(e) => {
          const archivo = e.target.files?.[0];
          e.target.value = "";
          if (archivo) void procesar(archivo);
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full sm:w-auto"
        disabled={leyendo}
        onClick={() => entrada.current?.click()}
      >
        {leyendo ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanText className="h-4 w-4" />}
        {leyendo ? "Leyendo documento…" : "Autocompletar con documento (IA)"}
      </Button>
    </>
  );
}
