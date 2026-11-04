import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Search, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { buscarCargasCompatibles } from "@/lib/load-matching.functions";
import type { CoincidenciaCarga } from "@/lib/load-matching";
import type { Carga } from "@/lib/troncal-data";
import { usaMiUbicacion, type Coordenadas } from "@/lib/load-search-location";

export function LoadMatchingDialog({ open, onOpenChange, cargas, renderCarga, ciudadBase }: { open: boolean; onOpenChange: (open: boolean) => void; cargas: Carga[]; renderCarga: (carga: Carga) => ReactNode; ciudadBase: string }) {
  const buscar = useServerFn(buscarCargasCompatibles);
  const [descripcion, setDescripcion] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultados, setResultados] = useState<CoincidenciaCarga[] | null>(null);
  const [ubicacionTexto, setUbicacionTexto] = useState("");
  useEffect(() => { if (!open) { setResultados(null); setError(null); } }, [open]);
  async function enviar(event: FormEvent) {
    event.preventDefault(); setEnviando(true); setError(null); setResultados(null); setUbicacionTexto("");
    try {
      let ubicacion: Coordenadas | null = null;
      if (usaMiUbicacion(descripcion)) {
        setUbicacionTexto("Consultando permiso de ubicación…");
        ubicacion = await new Promise<Coordenadas | null>((resolve) => {
          if (!navigator.geolocation) { resolve(null); return; }
          navigator.geolocation.getCurrentPosition(pos => resolve({ latitud: pos.coords.latitude, longitud: pos.coords.longitude }), () => resolve(null), { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false });
        });
        setUbicacionTexto(ubicacion ? "Ubicación del navegador · radio aproximado de 100 km" : ciudadBase ? `Ciudad base: ${ciudadBase} · ubicación del navegador no disponible` : "Ubicación no disponible; indica una ciudad en tu pregunta.");
      }
      const resultado = await buscar({ data: { descripcion, ids: cargas.map((c) => c.id), pregunta: true, ubicacion } });
      if ("error" in resultado) setError(resultado.error);
      else setResultados(resultado.coincidencias);
    } catch { setError("No pudimos conectar con la búsqueda. Inténtalo nuevamente."); }
    finally { setEnviando(false); }
  }
  return <Dialog open={open} onOpenChange={(value) => { if (!enviando) onOpenChange(value); }}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle className="flex items-center gap-2"><Search className="h-5 w-5 text-primary" /> Asistente de cargas</DialogTitle><DialogDescription>Cargas disponibles en Chile</DialogDescription></DialogHeader>
    <form onSubmit={(e) => void enviar(e)} className="space-y-3"><Label htmlFor="descripcion-camion">Tu pregunta o disponibilidad</Label><Textarea id="descripcion-camion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} minLength={3} maxLength={2000} required disabled={enviando} rows={3} placeholder="¿Hay cargas cerca de Concepción esta semana?" /><div className="flex flex-wrap items-center gap-2"><Button disabled={enviando || !cargas.length || descripcion.trim().length < 3} type="submit">{enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} {enviando ? "Buscando coincidencias…" : "Buscar cargas"}</Button><Button type="button" variant="outline" disabled aria-label="Escuchar respuesta — Próximamente"><Volume2 className="h-4 w-4" /> Escuchar respuesta · Próximamente</Button></div></form>
    {ubicacionTexto && <p role="status" className="text-sm text-muted-foreground">{ubicacionTexto}</p>}
    {!cargas.length && <p className="text-sm text-muted-foreground">No hay cargas disponibles actualmente.</p>}
    {error && <p role="alert" className="break-words text-sm text-destructive">{error}</p>}
    {resultados?.length === 0 && <p role="status" className="text-sm text-muted-foreground">No encontramos cargas vigentes para tu pregunta. Prueba otra ciudad o fecha.</p>}
    {resultados && resultados.length > 0 && <div className="space-y-4" aria-live="polite">{resultados.map((r) => { const carga = cargas.find((c) => c.id === r.id); if (!carga) return null; return <div key={r.id} className="space-y-2"><p className="text-sm text-muted-foreground">{r.motivo}</p>{renderCarga(carga)}</div>; })}</div>}
  </DialogContent></Dialog>;
}