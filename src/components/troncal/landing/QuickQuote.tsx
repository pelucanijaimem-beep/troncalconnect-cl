import { useState, type FormEvent } from "react";
import { ArrowRight, Clock, MapPin, Package, Route as RouteIcon, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CIUDADES_CONOCIDAS } from "@/lib/load-search-location";
import { cargasDelCorredor, estimarRuta, type EstimacionRuta } from "@/lib/cotizador";

const clp = (n: number) => `$${n.toLocaleString("es-CL")}`;

type Resultado =
  | { tipo: "ok"; origen: string; destino: string; carga: string; ruta: EstimacionRuta; ida: number; retorno: number }
  | { tipo: "sin_datos"; origen: string; destino: string };

export function QuickQuote({
  cargas,
  onPublicarFlete,
}: {
  cargas: { origen: string; destino: string }[];
  onPublicarFlete: () => void;
}) {
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [carga, setCarga] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const consultar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const o = origen.trim();
    const d = destino.trim();
    if (!o || !d) return;
    const ruta = estimarRuta(o, d);
    if (!ruta) {
      setResultado({ tipo: "sin_datos", origen: o, destino: d });
      return;
    }
    const { ida, retorno } = cargasDelCorredor(cargas, o, d);
    setResultado({ tipo: "ok", origen: o, destino: d, carga: carga.trim(), ruta, ida, retorno });
  };

  return (
    <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-border bg-card p-4 text-left shadow-card sm:p-6">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
        <Sparkles className="h-4 w-4" /> Cotiza tu ruta en segundos
      </p>
      <form onSubmit={consultar} className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="qq-origen">Origen</Label>
          <Input id="qq-origen" list="qq-ciudades" placeholder="Ej. Chillán" value={origen} onChange={(e) => setOrigen(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="qq-destino">Destino</Label>
          <Input id="qq-destino" list="qq-ciudades" placeholder="Ej. Santiago" value={destino} onChange={(e) => setDestino(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="qq-carga">Qué transportas</Label>
          <Input id="qq-carga" placeholder="Ej. 10 pallets de fruta" value={carga} onChange={(e) => setCarga(e.target.value)} maxLength={80} />
        </div>
        <datalist id="qq-ciudades">
          {CIUDADES_CONOCIDAS.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <Button type="submit" size="lg" className="sm:col-span-3">
          <RouteIcon className="h-4 w-4" /> Ver disponibilidad en Ruta 5
        </Button>
      </form>

      {resultado?.tipo === "sin_datos" && (
        <div className="mt-4 rounded-xl border border-border bg-surface p-4 text-sm text-muted-foreground" role="status">
          Todavía no tenemos datos de referencia para {resultado.origen} – {resultado.destino}. Publica tu flete y los
          transportistas del sector te harán su oferta.
          <div className="mt-3">
            <Button size="sm" onClick={onPublicarFlete}>
              Publicar mi flete <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {resultado?.tipo === "ok" && (
        <div className="mt-4 rounded-xl border border-border bg-surface p-4" role="status">
          <p className="text-sm font-bold text-foreground">
            {resultado.origen} → {resultado.destino}
            {resultado.carga && <span className="font-medium text-muted-foreground"> · {resultado.carga}</span>}
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Dato icono={MapPin} etiqueta="Distancia estimada" valor={`~${resultado.ruta.km.toLocaleString("es-CL")} km`} />
            <Dato icono={Clock} etiqueta="Tiempo en ruta" valor={`~${resultado.ruta.horas.toLocaleString("es-CL")} h`} />
            <Dato
              icono={RouteIcon}
              etiqueta={`Peajes troncales (${resultado.ruta.plazas})`}
              valor={`${clp(resultado.ruta.peajeMin)} – ${clp(resultado.ruta.peajeMax)}`}
            />
            <Dato
              icono={Truck}
              etiqueta="Cargas de retorno publicadas"
              valor={resultado.retorno > 0 ? `${resultado.retorno} desde ${resultado.destino}` : "Sé el primero"}
            />
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">
            Valores referenciales para camión de más de 2 ejes, sin pórticos urbanos ni peajes laterales. Revisa las
            tarifas vigentes antes de cerrar tu precio.
            {resultado.ida > 0 && ` Hoy hay ${resultado.ida} ${resultado.ida === 1 ? "carga publicada" : "cargas publicadas"} en este mismo tramo.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={onPublicarFlete}>
              <Package className="h-4 w-4" /> Publicar este flete
            </Button>
            <Button variant="outline" asChild>
              <a href="#cargas">Ver cargas en el tablero</a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Dato({ icono: Icono, etiqueta, valor }: { icono: typeof MapPin; etiqueta: string; valor: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icono className="h-3.5 w-3.5 text-primary" /> {etiqueta}
      </dt>
      <dd className="mt-1 text-sm font-extrabold text-foreground">{valor}</dd>
    </div>
  );
}
