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

export function PostTruckDialog({
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
    toast.success("¡Camión publicado!", {
      description: "Tu disponibilidad ya es visible para las empresas cargadoras.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Publicar mi Camión</DialogTitle>
          <DialogDescription>
            Cuéntanos tu disponibilidad. Ej: “Tengo camión de 10 Ton Thermo disponible para ir de
            Los Ángeles a Santiago”.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={enviar} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="t-origen">Origen</Label>
              <Input id="t-origen" placeholder="Los Ángeles" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-destino">Destino</Label>
              <Input id="t-destino" placeholder="Santiago" required />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de Carrocería</Label>
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
              <Label htmlFor="t-ton">Capacidad (Toneladas)</Label>
              <Input id="t-ton" type="number" min={1} placeholder="10" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-fecha">Fecha disponible</Label>
              <Input id="t-fecha" type="date" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-tel">Teléfono de contacto</Label>
              <Input id="t-tel" type="tel" placeholder="+56 9 1234 5678" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-detalle">Comentarios</Label>
            <Textarea id="t-detalle" placeholder="Detalles del camión, retornos, restricciones…" />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full sm:w-auto">
              Publicar mi Camión
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
