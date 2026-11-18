import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MAX_MENSAJE_CONTRAOFERTA,
  calcularContraoferta,
  textoDiferencia,
  type ModoContraoferta,
} from "@/lib/contraoferta";
import { money } from "@/lib/troncal-data";

export type EstadoContraoferta = { modo: ModoContraoferta; valor: string; nota: string };
export const CONTRAOFERTA_VACIA: EstadoContraoferta = { modo: "km", valor: "", nota: "" };

/** Rate proposal inside the application dialog: $/km or total CLP plus an optional short note. */
export function CounterOfferFields({
  km,
  valorKm,
  estado,
  onChange,
}: {
  km: number;
  valorKm: number;
  estado: EstadoContraoferta;
  onChange: (e: EstadoContraoferta) => void;
}) {
  const numero = Number(estado.valor);
  const calc = calcularContraoferta(km, valorKm, estado.modo, numero);
  const opciones: { valor: ModoContraoferta; label: string }[] = [
    { valor: "km", label: "Por $/km" },
    { valor: "total", label: "Monto total" },
  ];

  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface p-3">
      <p className="text-xs text-muted-foreground">
        Tarifa publicada: <strong className="text-foreground">{money(valorKm)} / km</strong> · Total{" "}
        <strong className="text-foreground">{money(km * valorKm)}</strong> ({km} km)
      </p>
      <div role="radiogroup" aria-label="Tipo de contraoferta" className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
        {opciones.map((o) => (
          <button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={estado.modo === o.valor}
            onClick={() => onChange({ ...estado, modo: o.valor, valor: "" })}
            className={`rounded-md px-2 py-1.5 text-sm font-semibold transition-colors ${
              estado.modo === o.valor ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="contraoferta-valor">
          {estado.modo === "km" ? "Tu tarifa por km (CLP)" : "Tu monto total (CLP)"}
        </Label>
        <Input
          id="contraoferta-valor"
          inputMode="numeric"
          autoComplete="off"
          placeholder={estado.modo === "km" ? String(Math.round(valorKm)) : String(Math.round(km * valorKm))}
          value={estado.valor ? Number(estado.valor).toLocaleString("es-CL") : ""}
          onChange={(e) => onChange({ ...estado, valor: e.target.value.replace(/\D/g, "").slice(0, 10) })}
        />
        {calc ? (
          <p className="text-xs font-semibold text-foreground">
            {estado.modo === "km"
              ? `Total propuesto: ${money(calc.totalPropuesto)}`
              : `Equivale a ${money(calc.valorKmPropuesto)} / km`}{" "}
            · {textoDiferencia(calc.diferencia, calc.porcentaje)}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Ingresa un monto mayor a cero.</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="contraoferta-nota">Mensaje breve (opcional)</Label>
        <Input
          id="contraoferta-nota"
          maxLength={MAX_MENSAJE_CONTRAOFERTA}
          placeholder="Ej: Disponible para cargar hoy a las 15:00"
          value={estado.nota}
          onChange={(e) => onChange({ ...estado, nota: e.target.value })}
        />
        <p className="text-right text-[11px] text-muted-foreground">
          {estado.nota.length}/{MAX_MENSAJE_CONTRAOFERTA}
        </p>
      </div>
    </div>
  );
}
