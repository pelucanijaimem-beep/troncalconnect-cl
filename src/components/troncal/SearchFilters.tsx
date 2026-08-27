import { Search } from "lucide-react";
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
import { CARROCERIAS } from "@/lib/troncal-data";

export type Filtros = {
  origen: string;
  destino: string;
  carroceria: string;
  fecha: string;
  soloVerificados: boolean;
};

export function SearchFilters({
  filtros,
  ciudades,
  onChange,
  onLimpiar,
}: {
  filtros: Filtros;
  ciudades: string[];
  onChange: (f: Filtros) => void;
  onLimpiar: () => void;
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
          <Label htmlFor="fecha">Fecha</Label>
          <Input
            id="fecha"
            type="date"
            value={filtros.fecha}
            onChange={(e) => set("fecha", e.target.value)}
          />
        </div>
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
