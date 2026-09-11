import { Search, ShieldCheck, Undo2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CARROCERIAS, ESTADOS_CAMION } from "@/lib/troncal-data";

export type Filtros = {
  origen: string;
  destino: string;
  carroceria: string;
  fecha: string;
  soloVerificados: boolean;
  /** Rango de valor por kilómetro. */
  precioMin: string;
  precioMax: string;
  /** Estado del camión: "todos" | "buscando" | "en_ruta". */
  estado: string;
  /** Región de origen ("todas" para no filtrar). */
  regionOrigen: string;
  /** Región de destino ("todas" para no filtrar). */
  regionDestino: string;
  /** Solo cargas cuyo destino es la ciudad base del camionero. */
  retorno: boolean;
};

export function SearchFilters({
  filtros,
  ciudades,
  regiones = [],
  moneda = "CLP",
  mostrarEstado = false,
  mostrarRetorno = false,
  ciudadBase = "",
  onChange,
  onLimpiar,
  onConfigurarRetorno,
}: {
  filtros: Filtros;
  ciudades: string[];
  /** Regiones disponibles para el país seleccionado. */
  regiones?: string[];
  moneda?: string;
  /** Muestra el filtro de estado del camión (vista de empresas). */
  mostrarEstado?: boolean;
  /** Muestra el filtro de viaje de retorno (vista de camioneros). */
  mostrarRetorno?: boolean;
  /** Ciudad base guardada en las alertas del camionero. */
  ciudadBase?: string;
  onChange: (f: Filtros) => void;
  onLimpiar: () => void;
  onConfigurarRetorno?: () => void;
}) {
  const set = (k: keyof Filtros, v: string) => onChange({ ...filtros, [k]: v });

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card">
      <datalist id="ciudades-sugeridas">
        {ciudades.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="origen">Origen</Label>
          <Input
            id="origen"
            list="ciudades-sugeridas"
            placeholder={`Ej: ${ciudades[0] ?? "Ciudad de origen"}`}
            value={filtros.origen}
            onChange={(e) => set("origen", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="destino">Destino</Label>
          <Input
            id="destino"
            list="ciudades-sugeridas"
            placeholder={`Ej: ${ciudades[1] ?? "Ciudad de destino"}`}
            value={filtros.destino}
            onChange={(e) => set("destino", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Tipo de Carrocería</Label>
          <Select value={filtros.carroceria} onValueChange={(v) => set("carroceria", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {CARROCERIAS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fecha">Fecha de salida</Label>
          <Input
            id="fecha"
            type="date"
            value={filtros.fecha}
            onChange={(e) => set("fecha", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="precio-min">Valor mínimo por km ({moneda})</Label>
          <Input
            id="precio-min"
            type="number"
            min={0}
            placeholder="Ej: 900"
            value={filtros.precioMin}
            onChange={(e) => set("precioMin", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="precio-max">Valor máximo por km ({moneda})</Label>
          <Input
            id="precio-max"
            type="number"
            min={0}
            placeholder="Ej: 2000"
            value={filtros.precioMax}
            onChange={(e) => set("precioMax", e.target.value)}
          />
        </div>
        {mostrarEstado && (
          <div className="space-y-1.5">
            <Label>Estado del camión</Label>
            <Select value={filtros.estado} onValueChange={(v) => set("estado", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {ESTADOS_CAMION.map((e) => (
                  <SelectItem key={e.valor} value={e.valor}>
                    {e.etiqueta}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {regiones.length > 0 && (
          <>
            <div className="space-y-1.5">
              <Label>Región de origen</Label>
              <Select
                value={filtros.regionOrigen}
                onValueChange={(v) => set("regionOrigen", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las regiones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las regiones</SelectItem>
                  {regiones.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Región de destino</Label>
              <Select
                value={filtros.regionDestino}
                onValueChange={(v) => set("regionDestino", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las regiones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las regiones</SelectItem>
                  {regiones.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
          <Switch
            checked={filtros.soloVerificados}
            onCheckedChange={(v) => onChange({ ...filtros, soloVerificados: v })}
            aria-label="Solo usuarios verificados"
          />
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
            <ShieldCheck className="h-4 w-4 text-trust" /> Solo Transportistas Verificados
          </span>
        </label>
        {mostrarRetorno && (
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
            <Switch
              checked={filtros.retorno}
              onCheckedChange={(v) => onChange({ ...filtros, retorno: v })}
              aria-label="Solo viajes de retorno"
              disabled={!ciudadBase}
            />
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
              <Undo2 className="h-4 w-4 text-primary" /> Viaje de retorno
              {ciudadBase ? (
                <span className="font-normal text-muted-foreground">a {ciudadBase}</span>
              ) : (
                <button
                  type="button"
                  onClick={onConfigurarRetorno}
                  className="cursor-pointer font-semibold text-primary underline"
                >
                  definir ciudad base
                </button>
              )}
            </span>
          </label>
        )}

        <Button className="flex-1 sm:flex-none">
          <Search className="h-4 w-4" /> Buscar
        </Button>
        <Button variant="outline" onClick={onLimpiar} className="flex-1 sm:flex-none">
          Limpiar filtros
        </Button>
      </div>
    </div>
  );
}
