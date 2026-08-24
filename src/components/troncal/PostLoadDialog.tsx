import { useState, type FormEvent } from "react";
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
import { CARROCERIAS } from "@/lib/troncal-data";

export function PostLoadDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [carroceria, setCarroceria] = useState("");

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    onOpenChange(false);
    toast.success("¡Flete publicado!", {
      description: "Los camioneros de la zona ya pueden ver tu carga.",
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
              <Input id="l-origen" placeholder="Los Ángeles" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="l-destino">Destino</Label>
              <Input id="l-destino" placeholder="Santiago" required />
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
              <Input id="l-ton" type="number" min={1} placeholder="28" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="l-valor">Valor por Kilómetro (CLP)</Label>
              <Input id="l-valor" type="number" min={1} placeholder="1200" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="l-fecha">Fecha de carga</Label>
              <Input id="l-fecha" type="date" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="l-detalle">Descripción de la carga</Label>
            <Textarea id="l-detalle" placeholder="Tipo de producto, horarios, requisitos…" />
          </div>
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
