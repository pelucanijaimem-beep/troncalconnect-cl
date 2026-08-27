import { useState, type FormEvent } from "react";
import { ShieldCheck } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CARROCERIAS, getPais, type Carga, type Carroceria, type PaisCodigo } from "@/lib/troncal-data";
import { nuevoId, publicarCarga } from "@/lib/use-publicaciones";
import { useSesion } from "@/lib/use-session";

export function PostLoadDialog({
  open,
  onOpenChange,
  pais = "CL",
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  pais?: PaisCodigo;
}) {
  const [carroceria, setCarroceria] = useState("");
  const moneda = getPais(pais).moneda;
  const sesion = useSesion();

  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const carga: Carga = {
      id: nuevoId("carga"),
      pais,
      origen: String(d.get("origen") ?? ""),
      destino: String(d.get("destino") ?? ""),
      km: Number(d.get("km") ?? 0),
      valorKm: Number(d.get("valorKm") ?? 0),
      carroceria: (carroceria || "Rampla Plana") as Carroceria,
      toneladas: Number(d.get("toneladas") ?? 0),
      empresa: sesion?.nombre ?? "Mi empresa",
      verificada: Boolean(sesion),
      fecha: String(d.get("fecha") ?? ""),
      detalle: String(d.get("detalle") ?? "") || "Sin comentarios adicionales.",
      telefono: String(d.get("telefono") ?? "") || sesion?.telefono || "+56 9 0000 0000",
      soloVerificados: d.get("soloVerificados") === "on",
    };
    publicarCarga(carga);
    setCarroceria("");
    onOpenChange(false);
    toast.success("¡Flete publicado!", {
      description: "Ya aparece en tu tablero y los camioneros de la zona pueden verlo.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Publicar Flete</DialogTitle>
          <DialogDescription>
            Publica tu carga y recibe contacto directo de camioneros disponibles.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={enviar} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="l-origen">Origen</Label>
              <Input id="l-origen" name="origen" placeholder="Los Ángeles" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="l-destino">Destino</Label>
              <Input id="l-destino" name="destino" placeholder="Santiago" required />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de Carrocería requerida</Label>
              <Select value={carroceria} onValueChange={setCarroceria} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  {CARROCERIAS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="l-ton">Peso (Toneladas)</Label>
              <Input id="l-ton" name="toneladas" type="number" min={1} placeholder="28" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="l-km">Distancia de la ruta (km)</Label>
              <Input id="l-km" name="km" type="number" min={1} placeholder="510" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="l-valor">Valor por Kilómetro ({moneda})</Label>
              <Input id="l-valor" name="valorKm" type="number" min={1} placeholder="1200" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="l-fecha">Fecha de carga</Label>
              <Input id="l-fecha" name="fecha" type="date" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="l-tel">Teléfono de contacto</Label>
              <Input id="l-tel" name="telefono" type="tel" placeholder="+56 9 1234 5678" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="l-detalle">Descripción de la carga</Label>
            <Textarea
              id="l-detalle"
              name="detalle"
              placeholder="Tipo de producto, horarios, requisitos…"
            />
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface p-3">
            <input
              type="checkbox"
              name="soloVerificados"
              className="mt-0.5 h-4 w-4 accent-[var(--trust)]"
            />
            <span className="text-sm">
              <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                <ShieldCheck className="h-4 w-4 text-trust" /> Exclusiva para Usuarios Verificados
              </span>
              <span className="block text-xs text-muted-foreground">
                Solo transportistas con sello TroncalCheck podrán ver y postular a esta carga.
              </span>
            </span>
          </label>
          <DialogFooter>
            <Button type="submit" className="w-full sm:w-auto">
              Publicar Flete
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
