import { useRef, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowRight,
  Bot,
  Clock,
  Coins,
  Loader2,
  MapPin,
  Package,
  Route as RouteIcon,
  Sparkles,
  Truck,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CIUDADES_CONOCIDAS } from "@/lib/load-search-location";
import {
  cargasDelCorredor,
  estimarRuta,
  tarifaReferencial,
  type BorradorFlete,
  type EstimacionRuta,
  type TarifaReferencial,
} from "@/lib/cotizador";
import { consultarAsistenteRutas } from "@/lib/asistente-rutas.functions";

const EJEMPLOS = [
  { texto: "Ejemplo: Chillán → Santiago · Rampla Sider", origen: "Chillán", destino: "Santiago", carga: "Rampla Sider" },
  { texto: "Ejemplo: Los Ángeles → Puerto Montt · Plataforma", origen: "Los Ángeles", destino: "Puerto Montt", carga: "Plataforma" },
];

const clp = (n: number) => `$${n.toLocaleString("es-CL")}`;

type Resultado =
  | {
      tipo: "ok";
      origen: string;
      destino: string;
      carga: string;
      ruta: EstimacionRuta;
      ida: number;
      retorno: number;
      tarifa: TarifaReferencial | null;
    }
  | { tipo: "sin_datos"; origen: string; destino: string; carga: string };

type EstadoIa =
  | { tipo: "inactivo" }
  | { tipo: "cargando" }
  | { tipo: "ok"; texto: string }
  | { tipo: "no_disponible" };

export function QuickQuote({
  cargas,
  conSesion,
  onPublicarFlete,
  onRegistro,
}: {
  cargas: { origen: string; destino: string; valorKm: number }[];
  conSesion: boolean;
  onPublicarFlete: (borrador: BorradorFlete) => void;
  onRegistro: (borrador: BorradorFlete) => void;
}) {
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [carga, setCarga] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [ia, setIa] = useState<EstadoIa>({ tipo: "inactivo" });
  const consultaActual = useRef(0);
  const consultarIa = useServerFn(consultarAsistenteRutas);

  const consultar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const o = origen.trim();
    const d = destino.trim();
    const c = carga.trim();
    if (!o || !d) return;
    const id = ++consultaActual.current;
    const ruta = estimarRuta(o, d);
    if (!ruta) {
      setResultado({ tipo: "sin_datos", origen: o, destino: d, carga: c });
      setIa({ tipo: "inactivo" });
      return;
    }
    const { ida, retorno } = cargasDelCorredor(cargas, o, d);
    setResultado({ tipo: "ok", origen: o, destino: d, carga: c, ruta, ida, retorno, tarifa: tarifaReferencial(cargas, o, d) });
    if (!conSesion) {
      setIa({ tipo: "inactivo" });
      return;
    }
    setIa({ tipo: "cargando" });
    consultarIa({ data: { origen: o, destino: d, carga: c } })
      .then((r) => {
        if (consultaActual.current !== id) return;
        setIa(r.respuesta ? { tipo: "ok", texto: r.respuesta } : { tipo: "no_disponible" });
      })
      .catch(() => {
        if (consultaActual.current === id) setIa({ tipo: "no_disponible" });
      });
  };

  const borrador: BorradorFlete = resultado
    ? { origen: resultado.origen, destino: resultado.destino, carga: resultado.carga }
    : { origen: origen.trim(), destino: destino.trim(), carga: carga.trim() };

  return (
    <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-border bg-card p-4 text-left shadow-card sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-foreground sm:text-xl">
        <Sparkles className="h-5 w-5 shrink-0 text-primary" /> Asistente IA de Rutas y Tarifas en Tiempo Real
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Ingresa origen, destino y carga para estimar distancia, tarifa justa ($/km) y disponibilidad en el corredor.
      </p>
      <form onSubmit={consultar} className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="qq-origen">Origen</Label>
          <Input id="qq-origen" list="qq-ciudades" placeholder="Ej. Chillán" value={origen} onChange={(e) => setOrigen(e.target.value)} maxLength={60} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="qq-destino">Destino</Label>
          <Input id="qq-destino" list="qq-ciudades" placeholder="Ej. Santiago" value={destino} onChange={(e) => setDestino(e.target.value)} maxLength={60} required />
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
        <div className="flex flex-wrap gap-2 sm:col-span-3">
          {EJEMPLOS.map((ej) => (
            <button
              key={ej.texto}
              type="button"
              onClick={() => {
                setOrigen(ej.origen);
                setDestino(ej.destino);
                setCarga(ej.carga);
              }}
              className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {ej.texto}
            </button>
          ))}
        </div>
        <Button type="submit" size="lg" className="sm:col-span-3" disabled={ia.tipo === "cargando"}>
          {ia.tipo === "cargando" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
          Consultar Asistente IA
        </Button>
      </form>

      {resultado?.tipo === "sin_datos" && (
        <div className="mt-4 rounded-xl border border-border bg-surface p-4 text-sm text-muted-foreground" role="status">
          Todavía no tenemos datos de referencia para {resultado.origen} – {resultado.destino}. Elige una ciudad de la
          lista o publica tu flete y los transportistas del sector te harán su oferta.
          <div className="mt-3">
            <Button size="sm" onClick={() => onPublicarFlete(borrador)}>
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
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Dato icono={MapPin} etiqueta="Distancia estimada" valor={`~${resultado.ruta.km.toLocaleString("es-CL")} km`} />
            <Dato icono={Clock} etiqueta="Tiempo en ruta" valor={`~${resultado.ruta.horas.toLocaleString("es-CL")} h`} />
            <Dato
              icono={RouteIcon}
              etiqueta={`Peajes troncales (${resultado.ruta.plazas})`}
              valor={`${clp(resultado.ruta.peajeMin)} – ${clp(resultado.ruta.peajeMax)}`}
            />
            <Dato
              icono={Coins}
              etiqueta="Tarifa referencial"
              valor={
                resultado.tarifa
                  ? `${clp(resultado.tarifa.valorKm)}/km`
                  : conSesion
                    ? "Aún sin tarifas publicadas"
                    : "Visible con tu cuenta"
              }
            />
            <Dato
              icono={Package}
              etiqueta="Cargas en este tramo"
              valor={conSesion ? String(resultado.ida) : "Visible con tu cuenta"}
            />
            <Dato
              icono={Truck}
              etiqueta="Cargas de retorno"
              valor={conSesion ? (resultado.retorno > 0 ? `${resultado.retorno} desde ${resultado.destino}` : "Sé el primero") : "Visible con tu cuenta"}
            />
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">
            Valores referenciales para camión de más de 2 ejes, sin pórticos urbanos ni peajes laterales. Revisa las
            tarifas vigentes antes de cerrar tu precio.
            {resultado.tarifa &&
              ` La tarifa es el promedio de ${resultado.tarifa.muestras} ${resultado.tarifa.muestras === 1 ? "carga publicada" : "cargas publicadas"} ${resultado.tarifa.alcance === "tramo" ? "en este tramo" : "en el tablero"}.`}
          </p>

          <div className="mt-4 rounded-lg border border-border bg-card p-3" aria-live="polite">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary">
              <Bot className="h-4 w-4" /> Recomendación del asistente
            </p>
            {!conSesion && (
              <div className="mt-2 text-sm text-muted-foreground">
                <p>
                  Crea tu cuenta gratis para recibir la recomendación del asistente IA con las tarifas y cargas
                  publicadas en este tramo. Guardamos los datos que ingresaste.
                </p>
                <Button size="sm" className="mt-3" onClick={() => onRegistro(borrador)}>
                  <UserPlus className="h-4 w-4" /> Crear cuenta gratis
                </Button>
              </div>
            )}
            {conSesion && ia.tipo === "cargando" && (
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" /> El asistente está analizando tu ruta…
              </p>
            )}
            {conSesion && ia.tipo === "ok" && <p className="mt-2 text-sm text-foreground">{ia.texto}</p>}
            {conSesion && ia.tipo === "no_disponible" && (
              <p className="mt-2 text-sm text-muted-foreground">
                El asistente no está disponible en este momento. Los valores de arriba siguen siendo una referencia
                válida para tu ruta.
              </p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => onPublicarFlete(borrador)}>
              <Package className="h-4 w-4" /> Publicar este flete
            </Button>
            <Button variant="outline" asChild>
              <a href="#cargas">Ver cargas y postular</a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Dato({ icono: Icono, etiqueta, valor }: { icono: typeof MapPin; etiqueta: string; valor: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-card p-3">
      <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icono className="h-3.5 w-3.5 shrink-0 text-primary" /> {etiqueta}
      </dt>
      <dd className="mt-1 text-sm font-extrabold text-foreground">{valor}</dd>
    </div>
  );
}
