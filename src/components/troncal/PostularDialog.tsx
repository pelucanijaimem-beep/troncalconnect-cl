import { useEffect, useState } from "react";
import { HandCoins, Send, Satellite, X } from "lucide-react";
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
import { calcularContraoferta, mensajeContraoferta } from "@/lib/contraoferta";
import { CONTRAOFERTA_VACIA, CounterOfferFields, type EstadoContraoferta } from "./CounterOfferFields";

/** Campo obligatorio: solo acepta enlaces http/https reales. */
export function linkRastreoValido(valor: string): boolean {
  const v = valor.trim();
  if (!v) return false;
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
  /** contraoferta: texto listo para el mensaje de la postulación, o null si postula a la tarifa publicada. */
  onConfirmar: (linkRastreo: string, contraoferta: string | null) => void;
}) {
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [ofertando, setOfertando] = useState(false);
  const [oferta, setOferta] = useState<EstadoContraoferta>(CONTRAOFERTA_VACIA);

  useEffect(() => {
    if (carga) {
      setLink("");
      setError("");
      setOfertando(false);
      setOferta(CONTRAOFERTA_VACIA);
    }
  }, [carga]);

  const linkValido = linkRastreoValido(link);
  const calcOferta = carga ? calcularContraoferta(carga.km, carga.valorKm, oferta.modo, Number(oferta.valor)) : null;
  const ofertaLista = !ofertando || calcOferta !== null;

  const confirmar = () => {
    if (!linkValido) {
      setError("Ingresa un enlace válido que comience con http:// o https://");
      return;
    }
    if (ofertando && !calcOferta) return;
    onConfirmar(link.trim(), ofertando && calcOferta ? mensajeContraoferta(calcOferta, oferta.nota) : null);
  };

  return (
    <Dialog open={!!carga} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
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
                Link de rastreo GPS del camión (obligatorio)
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
              {error || (link.trim() !== "" && !linkValido) ? (
                <p className="text-xs font-semibold text-destructive">
                  {error || "Ingresa un enlace válido que comience con http:// o https://"}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Pega el link de rastreo en vivo de tu camión (de tu seguro, flota o rastreador
                  GPS propio). Es obligatorio: le da transparencia y confianza a la empresa, que
                  podrá ver la ubicación del camión durante el viaje.
                </p>
              )}
            </div>

            <div className="space-y-2">
              {ofertando ? (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <p className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                      <HandCoins className="h-4 w-4 text-primary" /> Tu contraoferta
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setOfertando(false);
                        setOferta(CONTRAOFERTA_VACIA);
                      }}
                    >
                      <X className="h-4 w-4" /> Quitar
                    </Button>
                  </div>
                  <CounterOfferFields km={carga.km} valorKm={carga.valorKm} estado={oferta} onChange={setOferta} />
                </>
              ) : (
                <Button type="button" variant="outline" className="w-full" onClick={() => setOfertando(true)}>
                  <HandCoins className="h-4 w-4" /> Hacer Contraoferta
                </Button>
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
              <Button type="button" onClick={confirmar} disabled={enviando || !linkValido || !ofertaLista}>
                <Send className="h-4 w-4" />{" "}
                {enviando ? "Enviando…" : ofertando ? "Postular con contraoferta" : "Confirmar postulación"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
