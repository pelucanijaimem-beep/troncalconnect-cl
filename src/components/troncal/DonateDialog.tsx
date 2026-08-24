import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function DonateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" /> Apoyar el proyecto
          </DialogTitle>
          <DialogDescription>
            TroncalTrack es gratis para camioneros y empresas. Si te sirve, puedes aportar de forma
            voluntaria para mantener la plataforma en línea.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 rounded-lg border border-border bg-surface p-4 text-sm text-foreground">
          <p className="font-semibold">Transferencia electrónica</p>
          <p>Banco: BancoEstado — Cuenta Vista</p>
          <p>N° de cuenta: 00 123 456789</p>
          <p>RUT: 76.543.210-K</p>
          <p>Correo: aportes@troncaltrack.cl</p>
        </div>
        <DialogFooter>
          <Button className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
