import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAISES, getPais, type PaisCodigo } from "@/lib/troncal-data";

export function CountrySelector({
  pais,
  onChange,
  className,
  open,
  onOpenChange,
}: {
  pais: PaisCodigo;
  onChange: (p: PaisCodigo) => void;
  className?: string;
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
}) {
  const actual = getPais(pais);
  return (
    <Select
      value={pais}
      onValueChange={(v) => onChange(v as PaisCodigo)}
      {...(open === undefined ? {} : { open })}
      {...(onOpenChange ? { onOpenChange } : {})}
    >
      <SelectTrigger className={className} aria-label="Seleccionar país y moneda">
        <SelectValue>
          <span className="flex items-center gap-2">
            <span aria-hidden>{actual.bandera}</span>
            <span className="truncate font-medium">{actual.nombre}</span>
            <span className="text-muted-foreground">({actual.moneda})</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {PAISES.map((p) => (
          <SelectItem key={p.codigo} value={p.codigo}>
            <span className="flex items-center gap-2">
              <span aria-hidden>{p.bandera}</span>
              <span>{p.nombre}</span>
              <span className="text-muted-foreground">({p.moneda})</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
