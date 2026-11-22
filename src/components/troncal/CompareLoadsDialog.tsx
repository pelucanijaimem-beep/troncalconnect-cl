import { useEffect, useState } from "react";
import { ArrowRight, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { costoCombustible, money, type Carga } from "@/lib/troncal-data";
import { margenOperativo, peajesEstimados } from "@/lib/rentabilidad";
import { MAX_COMPARAR, alternarSeleccion } from "@/lib/comparar-cargas";
import { alternarFavorito } from "@/lib/use-tablero-prefs";

const fechaCorta = (f: string) =>
  f ? new Date(f + "T00:00:00").toLocaleDateString("es-CL") : "Sin fecha";

/** Total, diésel, peajes (Ruta 5 en Chile) y margen estimado de una carga. */
function numeros(c: Carga) {
  const total = c.km * c.valorKm;
  const { costo } = costoCombustible(c.km, c.pais);
  const peajes = c.pais === "CL" ? peajesEstimados(c.km, c.carroceria).total : 0;
  return { total, costo, margen: margenOperativo(total, costo, peajes, c.km).neto };
}

/** Cargas guardadas: lista completa y comparación lado a lado de 2 o 3 cargas. */
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
  const [seleccion, setSeleccion] = useState<string[]>([]);

  // Si una carga deja de estar guardada, sale también de la comparación.
  useEffect(() => {
    setSeleccion((s) => s.filter((id) => cargas.some((c) => c.id === id)));
  }, [cargas]);

  const comparadas = seleccion
    .map((id) => cargas.find((c) => c.id === id))
    .filter((c): c is Carga => Boolean(c));
  const lleno = seleccion.length >= MAX_COMPARAR;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Mis cargas guardadas</DialogTitle>
          <DialogDescription>
            Marca 2 o 3 cargas para compararlas lado a lado por ruta, precio, margen estimado, tipo
            de camión y fecha antes de postular.
          </DialogDescription>
        </DialogHeader>

        {cargas.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-surface p-6 text-center text-sm text-muted-foreground">
            Aún no guardas cargas. Usa la estrella <Star className="inline h-4 w-4" /> en el tablero
            para agregarlas y compararlas aquí.
          </p>
        ) : (
          <>
            {comparadas.length >= 2 ? (
              <section aria-label="Comparación lado a lado">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Comparación lado a lado
                </h3>
                <div
                  className={`grid gap-3 ${comparadas.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
                >
                  {comparadas.map((c) => {
                    const n = numeros(c);
                    return (
                      <article
                        key={c.id}
                        className="flex flex-col rounded-xl border border-border bg-surface p-3"
                      >
                        <p className="flex flex-wrap items-center gap-1 font-bold text-foreground">
                          {c.origen} <ArrowRight className="h-4 w-4 text-primary" /> {c.destino}
                        </p>
                        <p className="text-xs text-muted-foreground">{c.km} km</p>
                        <dl className="mt-3 space-y-2 text-sm">
                          <div>
                            <dt className="text-xs text-muted-foreground">Precio</dt>
                            <dd className="font-bold text-primary">
                              {money(n.total, c.pais)}{" "}
                              <span className="text-xs font-semibold text-muted-foreground">
                                ({money(c.valorKm, c.pais)}/km)
                              </span>
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted-foreground">Margen estimado</dt>
                            <dd className="font-semibold text-foreground">{money(n.margen, c.pais)}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted-foreground">Tipo de camión</dt>
                            <dd className="font-semibold text-foreground">
                              {c.carroceria} · {c.toneladas} Ton
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted-foreground">Fecha de retiro</dt>
                            <dd className="font-semibold text-foreground">{fechaCorta(c.fecha)}</dd>
                          </div>
                        </dl>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3 w-full"
                          onClick={() => onDetalles(c)}
                        >
                          Ver detalles
                        </Button>
                      </article>
                    );
                  })}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Margen estimado: total menos diésel y peajes estimados. Es referencial.
                </p>
              </section>
            ) : (
              <p className="rounded-lg bg-surface p-3 text-xs text-muted-foreground">
                Marca la casilla «Comparar» de 2 o 3 cargas para verlas lado a lado.
              </p>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                    <th className="py-2 pr-3">Comparar</th>
                    <th className="py-2 pr-3">Ruta</th>
                    <th className="py-2 pr-3">Equipo</th>
                    <th className="py-2 pr-3">Fecha</th>
                    <th className="py-2 pr-3">Total</th>
                    <th className="py-2 pr-3">Diésel estimado</th>
                    <th className="py-2 pr-3">Margen estimado</th>
                    <th className="py-2 pr-3">Pago</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {cargas.map((c) => {
                    const n = numeros(c);
                    const marcada = seleccion.includes(c.id);
                    return (
                      <tr key={c.id} className="border-b border-border last:border-0">
                        <td className="py-3 pr-3">
                          <Checkbox
                            checked={marcada}
                            disabled={!marcada && lleno}
                            aria-label={`Comparar ${c.origen} a ${c.destino}`}
                            onCheckedChange={() => setSeleccion((s) => alternarSeleccion(s, c.id))}
                          />
                        </td>
                        <td className="py-3 pr-3 font-semibold text-foreground">
                          {c.origen} → {c.destino}
                          <span className="block text-xs font-normal text-muted-foreground">
                            {c.km} km · {money(c.valorKm, c.pais)}/km
                          </span>
                        </td>
                        <td className="py-3 pr-3 text-muted-foreground">
                          {c.carroceria} · {c.toneladas} Ton
                        </td>
                        <td className="py-3 pr-3 text-muted-foreground">{fechaCorta(c.fecha)}</td>
                        <td className="py-3 pr-3 font-semibold text-foreground">
                          {money(n.total, c.pais)}
                        </td>
                        <td className="py-3 pr-3 text-muted-foreground">{money(n.costo, c.pais)}</td>
                        <td className="py-3 pr-3 font-semibold text-foreground">
                          {money(n.margen, c.pais)}
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
                              aria-label="Quitar de guardadas"
                              onClick={() => void alternarFavorito(c.id)}
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
