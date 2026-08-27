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
import {
  CARROCERIAS,
  ESTADOS_CAMION,
  type Camion,
  type Carroceria,
  type EstadoCamion,
  type PaisCodigo,
} from "@/lib/troncal-data";
import { nuevoId, publicarCamion } from "@/lib/use-publicaciones";
import { useSesion } from "@/lib/use-session";

export function PostTruckDialog({
  open,
  onOpenChange,
  pais = "CL",
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  pais?: PaisCodigo;
}) {
  const [carroceria, setCarroceria] = useState("");
  const [estado, setEstado] = useState<EstadoCamion>("buscando");
  const sesion = useSesion();

  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const camion: Camion = {
      id: nuevoId("camion"),
      pais,
      conductor: sesion?.nombre ?? "Camionero independiente",
      origen: String(d.get("origen") ?? ""),
      destino: String(d.get("destino") ?? ""),
      carroceria: (carroceria || "Rampla Plana") as Carroceria,
      toneladas: Number(d.get("toneladas") ?? 0),
      fecha: String(d.get("fecha") ?? ""),
      verificado: Boolean(sesion),
      telefono: String(d.get("telefono") ?? ""),
      detalle: String(d.get("detalle") ?? "") || "Disponibilidad confirmada.",
      estado,
    };
    publicarCamion(camion);
    setCarroceria("");
    setEstado("buscando");
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
              <Input id="t-origen" name="origen" placeholder="Los Ángeles" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-destino">Destino</Label>
              <Input id="t-destino" name="destino" placeholder="Santiago" required />
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
              <Input id="t-ton" name="toneladas" type="number" min={1} placeholder="10" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-fecha">Fecha disponible</Label>
              <Input id="t-fecha" name="fecha" type="date" required />
            </div>
            <div className="space-y-1.5">
              <Label>Estado actual</Label>
              <Select value={estado} onValueChange={(v) => setEstado(v as EstadoCamion)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_CAMION.map((e) => (
                    <SelectItem key={e.valor} value={e.valor}>
                      {e.etiqueta}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-tel">Teléfono de contacto</Label>
              <Input id="t-tel" name="telefono" type="tel" placeholder="+56 9 1234 5678" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-detalle">Comentarios</Label>
            <Textarea
              id="t-detalle"
              name="detalle"
              placeholder="Detalles del camión, retornos, restricciones…"
            />
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
