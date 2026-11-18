import { useEffect, useState, type FormEvent } from "react";
import { KeyRound, MapPin, PackageCheck } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { limpiarCodigo, validarEntrega, type ErroresEntrega } from "@/lib/entrega-codigo";
import { formatearRut } from "@/lib/rut";
import { confirmarEntregaCodigo } from "@/lib/use-entrega-codigo";
import type { Carga } from "@/lib/troncal-data";

/**
 * "Confirmar Entrega en Destino": el transportista ingresa el código que le da
 * el receptor y el nombre y RUT de quien recibe. No se sube ninguna foto.
 */
export function EntregaCodigoDialog({
  carga,
  onOpenChange,
  onConfirmado,
}: {
  carga: Carga | null;
  onOpenChange: (o: boolean) => void;
  onConfirmado: (c: Carga) => void;
}) {
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [rut, setRut] = useState("");
  const [errores, setErrores] = useState<ErroresEntrega>({});
  const [errorServidor, setErrorServidor] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!carga) return;
    setCodigo("");
    setNombre("");
    setRut("");
    setErrores({});
    setErrorServidor("");
  }, [carga]);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!carga || enviando) return;
    const encontrados = validarEntrega({ codigo, nombre, rut });
    setErrores(encontrados);
    setErrorServidor("");
    if (Object.keys(encontrados).length) return;
    setEnviando(true);
    const r = await confirmarEntregaCodigo({ cargaId: carga.id, codigo, nombre, rut });
    setEnviando(false);
    if (!r.ok) {
      if (r.error === "codigo_incorrecto" || r.error === "bloqueado") {
        setErrores({ codigo: r.mensaje });
      } else {
        setErrorServidor(r.mensaje);
      }
      return;
    }
    toast.success("Entregado y Conforme", {
      description: "Guardamos el receptor, la fecha y la hora de la entrega. Ya puedes calificar a la empresa.",
    });
    onConfirmado(carga);
  };

  const claseError = "text-xs font-semibold text-destructive";

  return (
    <Dialog open={!!carga} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        {carga && (
          <form onSubmit={(e) => void enviar(e)} noValidate>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PackageCheck className="h-5 w-5 text-primary" /> Confirmar Entrega en Destino
              </DialogTitle>
              <DialogDescription>
                {carga.origen} → {carga.destino}. Pide al receptor el código de 6 dígitos que le
                envió la empresa de carga.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="entrega-codigo">Código de verificación</Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="entrega-codigo"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    value={codigo}
                    onChange={(e) => setCodigo(limpiarCodigo(e.target.value))}
                    aria-invalid={!!errores.codigo}
                    aria-describedby={errores.codigo ? "entrega-codigo-error" : undefined}
                    className="pl-9 font-mono text-lg tracking-[0.4em]"
                  />
                </div>
                {errores.codigo && (
                  <p id="entrega-codigo-error" role="alert" className={claseError}>
                    {errores.codigo}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="entrega-nombre">Nombre de quien recibe (persona o empresa)</Label>
                <Input
                  id="entrega-nombre"
                  autoComplete="off"
                  maxLength={120}
                  placeholder="Ej: Bodega Central Ltda."
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  aria-invalid={!!errores.nombre}
                />
                {errores.nombre && (
                  <p role="alert" className={claseError}>
                    {errores.nombre}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="entrega-rut">RUT de quien recibe</Label>
                <Input
                  id="entrega-rut"
                  autoComplete="off"
                  maxLength={12}
                  placeholder="12.345.678-9"
                  value={rut}
                  onChange={(e) => setRut(e.target.value)}
                  onBlur={() => rut.trim() && setRut(formatearRut(rut))}
                  aria-invalid={!!errores.rut}
                />
                {errores.rut && (
                  <p role="alert" className={claseError}>
                    {errores.rut}
                  </p>
                )}
              </div>

              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Al confirmar se registra la fecha, la hora y tu ubicación GPS actual (si das permiso).
              </p>

              {errorServidor && (
                <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-2 text-sm font-semibold text-destructive">
                  {errorServidor}
                </p>
              )}
            </div>

            <DialogFooter className="mt-5">
              <Button type="submit" className="w-full sm:w-auto" disabled={enviando}>
                <PackageCheck className="h-4 w-4" />
                {enviando ? "Confirmando…" : "Confirmar entrega"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
