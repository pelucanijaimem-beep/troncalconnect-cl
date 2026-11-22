import { Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  desbloquearEmpresa,
  desbloquearEmpresaCuenta,
  useTableroPrefs,
} from "@/lib/use-tablero-prefs";

/** Panel del transportista para revisar y desbloquear empresas bloqueadas. */
export function BlockedCompaniesPanel() {
  const prefs = useTableroPrefs();
  const total = prefs.bloqueos.length + prefs.bloqueadas.length;

  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-card">
      <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
        <Ban className="h-4 w-4 text-primary" /> Empresas bloqueadas ({total})
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        No verás cargas de estas empresas en tu tablero. La empresa no recibe ningún aviso.
      </p>
      {total === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No has bloqueado empresas. Puedes hacerlo desde el menú de cualquier carga.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {prefs.bloqueos.map((b) => (
            <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span className="min-w-0 truncate text-sm font-semibold text-foreground">
                {b.nombre || "Empresa"}
              </span>
              <Button size="sm" variant="outline" onClick={() => void desbloquearEmpresaCuenta(b.id)}>
                Desbloquear
              </Button>
            </li>
          ))}
          {prefs.bloqueadas.map((n) => (
            <li key={n} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span className="min-w-0 truncate text-sm font-semibold capitalize text-foreground">
                {n}
              </span>
              <Button size="sm" variant="outline" onClick={() => desbloquearEmpresa(n)}>
                Desbloquear
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
