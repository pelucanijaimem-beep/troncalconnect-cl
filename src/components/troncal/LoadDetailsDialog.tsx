import { BadgeCheck, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { clp, type Carga } from "@/lib/troncal-data";

export function LoadDetailsDialog({
  carga,
  onOpenChange,
}: {
  carga: Carga | null;
  onOpenChange: (o: boolean) => void;
}) {
  return (
    <Dialog open={!!carga} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {carga && (
          <>
            <DialogHeader>
              <DialogTitle>
                {carga.origen} → {carga.destino} ({carga.km} km)
              </DialogTitle>
              <DialogDescription>{carga.detalle}</DialogDescription>
            </DialogHeader>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-border bg-surface p-3">
                <dt className="text-muted-foreground">Valor por kilómetro</dt>
                <dd className="text-lg font-extrabold text-primary">{clp(carga.valorKm)} / km</dd>
              </div>
              <div className="rounded-lg border border-border bg-surface p-3">
                <dt className="text-muted-foreground">Total del flete</dt>
                <dd className="text-lg font-bold text-foreground">
                  {clp(carga.km * carga.valorKm)} CLP
                </dd>
              </div>
              <div className="rounded-lg border border-border bg-surface p-3">
                <dt className="text-muted-foreground">Equipamiento</dt>
                <dd className="font-semibold text-foreground">
                  {carga.carroceria} · {carga.toneladas} Ton
                </dd>
              </div>
              <div className="rounded-lg border border-border bg-surface p-3">
                <dt className="text-muted-foreground">Fecha de carga</dt>
                <dd className="font-semibold text-foreground">
                  {new Date(carga.fecha + "T00:00:00").toLocaleDateString("es-CL")}
                </dd>
              </div>
            </dl>

            <p className="flex items-center gap-2 text-sm text-foreground">
              <span className="font-medium">{carga.empresa}</span>
              {carga.verificada && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">
                  <BadgeCheck className="h-3.5 w-3.5" /> Empresa Verificada
                </span>
              )}
            </p>

            <DialogFooter>
              <Button asChild className="w-full sm:w-auto">
                <a href={`tel:${carga.telefono.replace(/\s/g, "")}`}>
                  <Phone className="h-4 w-4" /> Llamar {carga.telefono}
                </a>
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
