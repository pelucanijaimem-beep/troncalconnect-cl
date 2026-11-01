import { useEffect, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { buscarCargasCompatibles } from "@/lib/load-matching.functions";
import type { CoincidenciaCarga } from "@/lib/load-matching";
import type { Carga } from "@/lib/troncal-data";

export function LoadMatchingDialog({ open, onOpenChange, cargas, onDetalles }: { open: boolean; onOpenChange: (open: boolean) => void; cargas: Carga[]; onDetalles: (carga: Carga) => void }) {
  const buscar = useServerFn(buscarCargasCompatibles);
  const [descripcion, setDescripcion] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultados, setResultados] = useState<CoincidenciaCarga[] | null>(null);
  useEffect(() => { if (!open) { setResultados(null); setError(null); } }, [open]);
  async function enviar(event: FormEvent) {
    event.preventDefault(); setEnviando(true); setError(null); setResultados(null);
    try {
      const resultado = await buscar({ data: { descripcion, ids: cargas.slice(0, 100).map((c) => c.id) } });
      if ("error" in resultado) setError(resultado.error);
      else setResultados(resultado.coincidencias);
    } catch { setError("No pudimos conectar con la búsqueda. Inténtalo nuevamente."); }
    finally { setEnviando(false); }
  }
  return <Dialog open={open} onOpenChange={(value) => { if (!enviando) onOpenChange(value); }}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Cargas compatibles con mi camión</DialogTitle><DialogDescription>Disponibilidad en Chile</DialogDescription></DialogHeader>
    <form onSubmit={(e) => void enviar(e)} className="space-y-3"><Label htmlFor="descripcion-camion">Mi camión y ruta disponible</Label><Textarea id="descripcion-camion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} minLength={10} maxLength={2000} required disabled={enviando} rows={4} placeholder="Tengo rampla plana de 30 toneladas. Disponible el lunes desde Los Ángeles hacia Santiago, con flexibilidad de un día." /><Button disabled={enviando || !cargas.length} type="submit">{enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} {enviando ? "Buscando coincidencias…" : "Encontrar cargas con IA"}</Button></form>
    {!cargas.length && <p className="text-sm text-muted-foreground">No hay cargas en el tablero con los filtros actuales.</p>}
    {error && <p role="alert" className="break-words text-sm text-destructive">{error}</p>}
    {resultados?.length === 0 && <p role="status" className="text-sm text-muted-foreground">No encontramos cargas compatibles vigentes. Revisa la disponibilidad o cambia los filtros del tablero.</p>}
    {resultados && resultados.length > 0 && <div className="divide-y divide-border">{resultados.map((r) => { const carga = cargas.find((c) => c.id === r.id); if (!carga) return null; return <div key={r.id} className="space-y-2 py-4"><h3 className="font-semibold text-foreground">{carga.origen} → {carga.destino}</h3><p className="text-xs text-muted-foreground">{carga.carroceria} · {carga.toneladas} t · {carga.fecha || "Fecha por confirmar"}</p><p className="text-sm text-foreground">{r.motivo}</p><Button variant="outline" size="sm" onClick={() => { onOpenChange(false); onDetalles(carga); }}>Ver carga <ArrowRight className="h-4 w-4" /></Button></div>; })}</div>}
  </DialogContent></Dialog>;
}