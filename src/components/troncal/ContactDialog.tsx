import { useState, type FormEvent } from "react";
import { MessageCircle, Phone } from "lucide-react";
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

export type Contacto = {
  titulo: string;
  nombre: string;
  telefono: string;
  resumen: string;
};

export function ContactDialog({
  contacto,
  onOpenChange,
}: {
  contacto: Contacto | null;
  onOpenChange: (o: boolean) => void;
}) {
  const [mensaje, setMensaje] = useState("");

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (mensaje.trim().length < 5) {
      toast.error("Escribe un mensaje", {
        description: "Cuéntale al contacto tu disponibilidad o tu propuesta.",
      });
      return;
    }
    setMensaje("");
    onOpenChange(false);
    toast.success("Mensaje enviado", {
      description: "Tu contacto recibirá el mensaje y tu teléfono para responder.",
    });
  };

  const tel = contacto?.telefono.replace(/\s/g, "") ?? "";

  return (
    <Dialog open={!!contacto} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {contacto && (
          <>
            <DialogHeader>
              <DialogTitle>{contacto.titulo}</DialogTitle>
              <DialogDescription>{contacto.resumen}</DialogDescription>
            </DialogHeader>

            <div className="rounded-lg border border-border bg-surface p-3 text-sm">
              <p className="font-semibold text-foreground">{contacto.nombre}</p>
              <p className="text-muted-foreground">{contacto.telefono}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild className="flex-1">
                <a href={`tel:${tel}`}>
                  <Phone className="h-4 w-4" /> Llamar ahora
                </a>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <a
                  href={`https://wa.me/${tel.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </Button>
            </div>

            <form onSubmit={enviar} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="ct-nombre">Tu nombre o empresa</Label>
                <Input id="ct-nombre" placeholder="Ej: Transportes Los Andes" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ct-tel">Tu teléfono de contacto</Label>
                <Input id="ct-tel" placeholder="+56 9 1234 5678" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ct-msg">Mensaje</Label>
                <Textarea
                  id="ct-msg"
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  maxLength={500}
                  placeholder="Hola, estoy disponible para este viaje…"
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full sm:w-auto">
                  Enviar mensaje
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
