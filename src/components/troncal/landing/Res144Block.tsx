import { Link } from "@tanstack/react-router";
import { FileCheck2, IdCard, Truck, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const DATOS = [
  { icono: IdCard, texto: "RUT del transportista" },
  { icono: UserCheck, texto: "Nombre y cédula del chofer verificado" },
  { icono: Truck, texto: "Patente del vehículo" },
];

export function Res144Block() {
  return (
    <section className="border-b border-border bg-surface" aria-labelledby="res-144">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:py-14">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
            <FileCheck2 className="h-4 w-4" /> Para empresas cargadoras
          </p>
          <h2 id="res-144" className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Guía de Despacho y Resolución 144 del SII: llega con los datos listos
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Desde el 1 de mayo de 2027, la Resolución Exenta SII N° 144 exige que la guía de despacho identifique al
            chofer, al transportista y la patente del vehículo. Con TroncalTrack sabes antes del retiro quién lleva tu
            carga, con sus datos revisados por TroncalCheck.
          </p>
          <Button variant="outline" className="mt-5" asChild>
            <Link to="/guias/resolucion-144-sii-guia-despacho">Leer la guía completa</Link>
          </Button>
        </div>
        <ul className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-card">
          {DATOS.map((d) => (
            <li key={d.texto} className="flex items-center gap-3 text-sm font-semibold text-foreground">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <d.icono className="h-4 w-4 text-primary" />
              </span>
              {d.texto}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
