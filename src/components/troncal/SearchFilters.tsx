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
      <div className="mt-4 flex flex-wrap items-center gap-2">
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
