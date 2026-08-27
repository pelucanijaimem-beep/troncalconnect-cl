import { Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { costoCombustible, money, type Carga } from "@/lib/troncal-data";
import { alternarFavorito } from "@/lib/use-tablero-prefs";

/** Administrador de cargas guardadas: compara favoritos antes de contactar. */
export function CompareLoadsDialog({
  open,
  onOpenChange,
  cargas,
  onDetalles,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  cargas: Carga[];
  onDetalles: (c: Carga) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Mis cargas guardadas</DialogTitle>
          <DialogDescription>
            Compara tus fletes favoritos por valor, distancia, combustible estimado y condiciones de
            pago antes de contactar al cliente.
          </DialogDescription>
        </DialogHeader>

        {cargas.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-surface p-6 text-center text-sm text-muted-foreground">
            Aún no guardas cargas. Usa la estrella <Star className="inline h-4 w-4" /> en el tablero
            para agregarlas y compararlas aquí.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                  <th className="py-2 pr-3">Ruta</th>
                  <th className="py-2 pr-3">Equipo</th>
                  <th className="py-2 pr-3">$/km</th>
                  <th className="py-2 pr-3">Total</th>
                  <th className="py-2 pr-3">Diésel estimado</th>
                  <th className="py-2 pr-3">Margen estimado</th>
                  <th className="py-2 pr-3">Pago</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {cargas.map((c) => {
                  const total = c.km * c.valorKm;
                  const { costo } = costoCombustible(c.km, c.pais);
                  return (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="py-3 pr-3 font-semibold text-foreground">
                        {c.origen} → {c.destino}
                        <span className="block text-xs font-normal text-muted-foreground">
                          {c.km} km
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-muted-foreground">
                        {c.carroceria} · {c.toneladas} Ton
                      </td>
                      <td className="py-3 pr-3 font-bold text-primary">
                        {money(c.valorKm, c.pais)}
                      </td>
                      <td className="py-3 pr-3 font-semibold text-foreground">
                        {money(total, c.pais)}
                      </td>
                      <td className="py-3 pr-3 text-muted-foreground">{money(costo, c.pais)}</td>
                      <td className="py-3 pr-3 font-semibold text-success">
                        {money(total - costo, c.pais)}
                      </td>
                      <td className="py-3 pr-3 text-muted-foreground">
                        {c.diasPago ?? "Pago a 30 días"}
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => onDetalles(c)}>
                            Ver
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-label="Quitar de favoritos"
                            onClick={() => alternarFavorito(c.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
