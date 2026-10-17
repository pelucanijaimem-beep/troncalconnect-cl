import { useEffect, useState } from "react";
import { Send, Satellite } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Carga } from "@/lib/troncal-data";

/** Acepta solo enlaces http/https; vacío también es válido (campo opcional). */
export function linkRastreoValido(valor: string): boolean {
  const v = valor.trim();
  if (!v) return true;
  try {
    const url = new URL(v);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function PostularDialog({
  carga,
  enviando,
  onOpenChange,
  onConfirmar,
}: {
  carga: Carga | null;
  enviando: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirmar: (linkRastreo: string) => void;
}) {
  const [link, setLink] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (carga) {
      setLink("");
      setError("");
    }
  }, [carga]);

  const confirmar = () => {
    if (!linkRastreoValido(link)) {
      setError("Ingresa un enlace válido que comience con http:// o https://");
      return;
    }
    onConfirmar(link.trim());
  };

  return (
    <Dialog open={!!carga} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {carga && (
          <>
            <DialogHeader>
              <DialogTitle>
                Postular a {carga.origen} → {carga.destino}
              </DialogTitle>
              <DialogDescription>
                La empresa recibirá tu postulación con tus datos de contacto y tu sello
                TroncalCheck.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-1.5">
              <Label htmlFor="link-rastreo" className="inline-flex items-center gap-1">
                <Satellite className="h-4 w-4 text-primary" />
                Link de rastreo GPS del camión (opcional)
              </Label>
              <Input
                id="link-rastreo"
                type="url"
                inputMode="url"
                placeholder="https://…"
                value={link}
                onChange={(e) => {
                  setLink(e.target.value);
                  setError("");
                }}
              />
              {error ? (
                <p className="text-xs font-semibold text-destructive">{error}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Si tu camión tiene GPS con link de rastreo en vivo (de tu seguro, flota, o un
                  rastreador GPS propio), pégalo aquí para que la empresa pueda ver la ubicación
                  del camión durante el viaje.
                </p>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={enviando}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={confirmar} disabled={enviando}>
                <Send className="h-4 w-4" /> {enviando ? "Enviando…" : "Confirmar postulación"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
