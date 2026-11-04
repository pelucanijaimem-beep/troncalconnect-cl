import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Info, TriangleAlert } from "lucide-react";
import { consultarConsumoPublicaciones } from "@/lib/membresia.functions";
import { avisoPublicaciones } from "@/lib/publication-notice";

export function PublicationQuotaNotice({ userId, revision }: { userId: string; revision: string }) {
  const consultar = useServerFn(consultarConsumoPublicaciones);
  const { data, isError } = useQuery({ queryKey: ["aviso-cuota", userId, revision], queryFn: () => consultar(), refetchInterval: 30000, refetchOnWindowFocus: true });
  if (isError || data?.error) return <p role="status" className="mb-4 text-sm text-muted-foreground">No pudimos actualizar el aviso de publicaciones. Puedes seguir publicando.</p>;
  const aviso = avisoPublicaciones(data?.consumo ?? null);
  if (!aviso) return null;
  const Icono = aviso.tipo === "excedida" ? Info : TriangleAlert;
  return <aside role="status" aria-live="polite" className="mb-5 flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
    <Icono aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
    <div className="min-w-0 space-y-1 text-sm">
      <p className="font-semibold text-foreground">{aviso.tipo === "excedida" ? "Superaste tus publicaciones incluidas este mes" : `Te quedan ${aviso.restantes} publicaciones incluidas este mes`}</p>
      {aviso.tipo === "excedida" ? <p className="text-muted-foreground">Cada publicación adicional cuesta +{aviso.tarifaUf.toLocaleString("es-CL", { maximumFractionDigits: 4 })} UF y se facturará manualmente. Puedes seguir publicando; no hay cobros automáticos.</p> : aviso.restantes === 0 ? <p className="text-muted-foreground">La siguiente publicación será adicional y se registrará para facturación manual, sin bloquear tu publicación.</p> : null}
    </div>
  </aside>;
}