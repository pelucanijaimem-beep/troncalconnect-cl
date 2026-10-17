import { Check, Minus } from "lucide-react";

type Fila = {
  funcion: string;
  inicial: boolean;
  transportistaPro: boolean;
  empresaPro: boolean;
  nota?: string;
};

const FILAS: Fila[] = [
  { funcion: "Búsqueda de Cargas", inicial: true, transportistaPro: true, empresaPro: true },
  { funcion: "Retornos (Backhauls)", inicial: false, transportistaPro: true, empresaPro: true },
  { funcion: "Calculadora $/km", inicial: true, transportistaPro: true, empresaPro: true },
  { funcion: "Reputación de Empresas", inicial: false, transportistaPro: true, empresaPro: true },
  {
    funcion: "Cobertura nacional",
    inicial: true,
    transportistaPro: true,
    empresaPro: true,
    nota: "Todo Chile",
  },
  {
    funcion: "Seguimiento GPS en ruta",
    inicial: false,
    transportistaPro: true,
    empresaPro: true,
  },
  {
    funcion: "Bloqueo de empresas o choferes",
    inicial: false,
    transportistaPro: false,
    empresaPro: true,
  },
];

function Celda({ activo }: { activo: boolean }) {
  return (
    <td className="border-b border-border px-4 py-3 text-center">
      {activo ? (
        <Check className="mx-auto h-4 w-4 text-primary" aria-label="Incluido" />
      ) : (
        <Minus className="mx-auto h-4 w-4 text-muted-foreground" aria-label="No incluido" />
      )}
    </td>
  );
}

export function ComparisonTable() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Tabla Comparativa
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Compara las funciones incluidas en cada plan.
        </p>

        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="bg-surface text-left">
                <th className="border-b border-border px-4 py-3 font-semibold text-foreground">
                  Función
                </th>
                <th className="border-b border-border px-4 py-3 text-center font-semibold text-foreground">
                  Inicial
                </th>
                <th className="border-b border-border px-4 py-3 text-center font-semibold text-foreground">
                  Transportista Pro
                </th>
                <th className="border-b border-border px-4 py-3 text-center font-semibold text-foreground">
                  Empresa Pro
                </th>
              </tr>
            </thead>
            <tbody>
              {FILAS.map((f) => (
                <tr key={f.funcion}>
                  <td className="border-b border-border px-4 py-3">
                    <span className="font-medium text-foreground">{f.funcion}</span>
                    {f.nota && (
                      <span className="block text-xs text-muted-foreground">{f.nota}</span>
                    )}
                  </td>
                  <Celda activo={f.inicial} />
                  <Celda activo={f.transportistaPro} />
                  <Celda activo={f.empresaPro} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
