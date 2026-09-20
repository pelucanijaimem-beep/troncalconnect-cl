import { useState } from "react";
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
import { eliminarMiCuenta } from "@/lib/cuenta.functions";
import { cerrarSesion } from "@/lib/use-session";

const CONFIRMACION = "ELIMINAR";

export function DeleteAccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [texto, setTexto] = useState("");
  const [borrando, setBorrando] = useState(false);

  const eliminar = async () => {
    setBorrando(true);
    try {
      await eliminarMiCuenta();
      await cerrarSesion();
      onOpenChange(false);
      toast.success("Cuenta eliminada", {
        description: "Borramos tu perfil, tus publicaciones y tus datos personales.",
      });
      if (typeof window !== "undefined") window.location.href = "/";
    } catch {
      toast.error("No pudimos eliminar la cuenta. Intenta nuevamente en unos minutos.");
    }
    setBorrando(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Eliminar mi cuenta</DialogTitle>
          <DialogDescription>
            Esta acción es definitiva: se borran tu perfil, tus cargas publicadas, tus
            postulaciones, tus favoritos y tus documentos de verificación.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="d-confirm">
            Escribe <span className="font-bold">{CONFIRMACION}</span> para confirmar
          </Label>
          <Input
            id="d-confirm"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={CONFIRMACION}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            disabled={texto.trim().toUpperCase() !== CONFIRMACION || borrando}
            onClick={() => void eliminar()}
          >
            {borrando ? "Eliminando…" : "Eliminar definitivamente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
