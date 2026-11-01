import { useCallback, useEffect, useState } from "react";
import { Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Mensaje = Database["public"]["Tables"]["mensajes_contacto"]["Row"];
export function AdminContactMessages() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [filtro, setFiltro] = useState("todos");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [actualizando, setActualizando] = useState<string | null>(null);
  const recargar = useCallback(async () => {
    setCargando(true);
    try {
      const { data, error } = await supabase.from("mensajes_contacto").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setMensajes(data ?? []); setError("");
    } catch { setError("No pudimos cargar los mensajes. Intenta nuevamente."); }
    finally { setCargando(false); }
  }, []);
  useEffect(() => { void recargar(); }, [recargar]);
  const marcar = async (id: string) => {
    setActualizando(id);
    try {
      const { data, error } = await supabase.from("mensajes_contacto").update({ leido: true }).eq("id", id).select("id").single();
      if (error || !data) throw error;
      setMensajes((prev) => prev.map((m) => m.id === id ? { ...m, leido: true } : m));
      toast.success("Mensaje marcado como leído");
    } catch { toast.error("No pudimos marcar el mensaje como leído."); }
    finally { setActualizando(null); }
  };
  const visibles = mensajes.filter((m) => filtro === "todos" || m.tipo === filtro);
  return <section className="border-t border-border py-6">
    <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-extrabold">Mensajes de soporte y sugerencias</h2><Button variant="outline" size="icon" aria-label="Actualizar mensajes" title="Actualizar mensajes" disabled={cargando} onClick={() => void recargar()}><RefreshCw className="h-4 w-4" /></Button></div>
    <Tabs value={filtro} onValueChange={setFiltro}><TabsList className="grid w-full grid-cols-3 sm:w-auto"><TabsTrigger value="todos">Todos</TabsTrigger><TabsTrigger value="soporte">Soporte</TabsTrigger><TabsTrigger value="sugerencia">Sugerencia</TabsTrigger></TabsList></Tabs>
    {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
    {cargando ? <p className="mt-4 text-sm text-muted-foreground">Cargando mensajes…</p> : !error && visibles.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">No hay mensajes.</p> : <div className="mt-4 divide-y divide-border">{visibles.map((m) => <article key={m.id} className="space-y-3 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="break-words font-bold">{m.nombre}</p><p className="break-all text-sm text-muted-foreground">{m.correo}</p><p className="text-xs text-muted-foreground">{m.tipo === "soporte" ? "Soporte" : "Sugerencia"} · {new Date(m.created_at).toLocaleString("es-CL", { timeZone: "America/Santiago" })}</p></div>{m.leido ? <span className="flex items-center gap-1 text-sm text-success"><Check className="h-4 w-4" />Leído</span> : <Button variant="outline" size="sm" disabled={actualizando === m.id} onClick={() => void marcar(m.id)}><Check className="h-4 w-4" />Marcar como leído</Button>}</div>
      <p className="whitespace-pre-wrap break-words text-sm">{m.mensaje}</p>
    </article>)}</div>}
  </section>;
}