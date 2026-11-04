import { useEffect, useRef, useState } from "react";
import { ArrowLeft, BellOff, MessagesSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { enviarMensaje, useChat, useConversaciones } from "@/lib/use-mensajes";
import { MAX_MENSAJE, totalSinLeer, type Conversacion } from "@/lib/mensajes";

const hora = (f: string) =>
  new Date(f).toLocaleString("es-CL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

/** Botón "Mensajes" con contador y bandeja de chats por carga. */
export function MessagesInbox({
  userId,
  abrirCarga,
  onCerrarCarga,
}: {
  userId: string;
  /** Si se indica, abre directamente la conversación de esa carga. */
  abrirCarga?: string | null;
  onCerrarCarga?: () => void;
}) {
  const { conversaciones } = useConversaciones(userId);
  const [open, setOpen] = useState(false);
  const [activa, setActiva] = useState<Conversacion | null>(null);
  const sinLeer = totalSinLeer(conversaciones);
  const filtradas = abrirCarga ? conversaciones.filter((c) => c.carga_id === abrirCarga) : conversaciones;

  useEffect(() => {
    if (!abrirCarga) return;
    setOpen(true);
    const delaCarga = conversaciones.filter((c) => c.carga_id === abrirCarga);
    if (delaCarga.length === 1) setActiva(delaCarga[0]!);
  }, [abrirCarga, conversaciones]);

  const cerrar = (o: boolean) => {
    setOpen(o);
    if (!o) {
      setActiva(null);
      onCerrarCarga?.();
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" className="relative" aria-label="Ver mensajes" onClick={() => setOpen(true)}>
        <MessagesSquare className="h-4 w-4" />
        <span className="hidden sm:inline">Mensajes</span>
        {sinLeer > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
            {sinLeer}
          </span>
        )}
      </Button>
      <Dialog open={open} onOpenChange={cerrar}>
        <DialogContent className="z-[1100] flex max-h-[90dvh] flex-col sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activa && (
                <button aria-label="Volver" onClick={() => setActiva(null)} className="cursor-pointer">
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              {activa ? activa.contraparte : "Mensajes"}
            </DialogTitle>
            <DialogDescription>
              {activa
                ? activa.ruta
                : "Conversaciones por carga, sin compartir números de teléfono."}
            </DialogDescription>
          </DialogHeader>
          {activa ? (
            <Chat conv={activa} userId={userId} />
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto">
              {filtradas.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {abrirCarga
                    ? "Aún no hay transportistas postulados a esta carga para conversar."
                    : "Aún no tienes conversaciones. Se habilitan al postular o recibir postulaciones."}
                </p>
              )}
              {filtradas.map((c) => (
                <button
                  key={`${c.carga_id}-${c.transportista_id}`}
                  onClick={() => setActiva(c)}
                  className="block w-full cursor-pointer border-b border-border px-2 py-3 text-left last:border-b-0 hover:bg-surface"
                >
                  <p className="flex items-center justify-between gap-2 text-sm font-semibold text-foreground">
                    <span className="truncate">{c.contraparte}</span>
                    {c.sin_leer > 0 && (
                      <span className="rounded-full bg-primary px-2 text-[11px] font-bold text-primary-foreground">
                        {c.sin_leer}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{c.ruta}</p>
                  {c.ultimo_texto && <p className="truncate text-xs text-muted-foreground">{c.ultimo_texto}</p>}
                </button>
              ))}
              <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <BellOff className="h-3.5 w-3.5" /> Avisos en el navegador con la app cerrada: Próximamente
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Chat({ conv, userId }: { conv: Conversacion; userId: string }) {
  const mensajes = useChat(conv.carga_id, conv.transportista_id);
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const fin = useRef<HTMLDivElement>(null);
  useEffect(() => fin.current?.scrollIntoView({ block: "end" }), [mensajes.length]);

  const enviar = async () => {
    setEnviando(true);
    const err = await enviarMensaje(conv.carga_id, conv.transportista_id, userId, texto);
    setEnviando(false);
    setError(err);
    if (!err) setTexto("");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="min-h-48 flex-1 space-y-2 overflow-y-auto rounded-lg bg-surface p-2">
        {mensajes.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">Escribe el primer mensaje.</p>
        )}
        {mensajes.map((m) => {
          const mio = m.autor_id === userId;
          return (
            <div key={m.id} className={`flex ${mio ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${mio ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border"}`}>
                <p className="text-[11px] font-semibold opacity-80">{mio ? "Tú" : conv.contraparte}</p>
                <p className="whitespace-pre-wrap break-words">{m.texto}</p>
                <p className="mt-1 text-right text-[10px] opacity-70">{hora(m.created_at)}</p>
              </div>
            </div>
          );
        })}
        <div ref={fin} />
      </div>
      <Textarea
        value={texto}
        maxLength={MAX_MENSAJE}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Escribe tu mensaje…"
        rows={2}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!enviando) void enviar();
          }
        }}
      />
      {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
      <Button onClick={() => void enviar()} disabled={enviando || !texto.trim()}>
        <Send className="h-4 w-4" /> Enviar
      </Button>
    </div>
  );
}
