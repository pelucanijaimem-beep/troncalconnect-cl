import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Satellite } from "lucide-react";
import { Button } from "@/components/ui/button";
import { consultarMembresia } from "@/lib/membresia.functions";
import { camionesSinGps } from "@/lib/gps-camion";

/** Aviso al transportista cuando uno de sus camiones no tiene rastreador GPS registrado. No bloquea el uso. */
export function GpsPendienteBanner({ userId }: { userId: string }) {
  const consultar = useServerFn(consultarMembresia);
  const { data } = useQuery({ queryKey: ["gps-pendiente", userId], queryFn: () => consultar(), refetchOnWindowFocus: true });
  const m = data?.membresia;
  if (!m || m.segmento !== "transportista" || !m.propietario) return null;
  const pendientes = camionesSinGps(m.camiones_detalle ?? []);
  if (pendientes.length === 0) return null;
  return (
    <aside role="status" className="mb-5 flex flex-col gap-3 rounded-lg border border-primary/40 bg-card p-4 sm:flex-row sm:items-center">
      <Satellite aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-semibold text-foreground">
          {pendientes.length === 1 ? `Falta el rastreador GPS del camión ${pendientes[0]?.patente ?? ""}` : `Faltan los rastreadores GPS de ${pendientes.length} camiones`}
        </p>
        <p className="text-muted-foreground">Registra el ID o IMEI del rastreador GPS vehicular de cada camión. Por ahora puedes seguir usando la plataforma con normalidad.</p>
      </div>
      <Button asChild size="sm" className="shrink-0"><Link to="/membresia">Completar GPS</Link></Button>
    </aside>
  );
}
