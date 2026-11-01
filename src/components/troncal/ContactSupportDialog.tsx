import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useSesion } from "@/lib/use-session";
import { contactoSchema, type TipoContacto } from "@/lib/contacto-schema";
import { enviarMensajeContacto } from "@/lib/contacto.functions";

export function ContactSupportDialog({ tipoInicial, onClose }: { tipoInicial: TipoContacto; onClose: () => void }) {
  const sesion = useSesion();
  const [tipo, setTipo] = useState<TipoContacto>(tipoInicial);
  const [nombre, setNombre] = useState(sesion?.cargandoPerfil ? "" : sesion?.nombre ?? "");
  const [correo, setCorreo] = useState(sesion?.email ?? "");
  const [nombreEditado, setNombreEditado] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const enviar = useServerFn(enviarMensajeContacto);
  useEffect(() => {
    if (sesion && !sesion.cargandoPerfil && !nombreEditado) setNombre(sesion.nombre);
  }, [sesion, nombreEditado]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviando) return;
    const validado = contactoSchema.safeParse({ tipo, nombre, correo, mensaje });
    if (!validado.success) { setError(validado.error.issues[0]?.message ?? "Revisa los campos"); return; }
    setError(""); setEnviando(true);
    try {
      await enviar({ data: validado.data });
      toast.success("Gracias, recibimos tu mensaje. Te responderemos a tu correo a la brevedad.");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos enviar tu mensaje. Intenta nuevamente.");
    } finally { setEnviando(false); }
  };

  return <Dialog open onOpenChange={(open) => { if (!open && !enviando) onClose(); }}>
    <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
      <DialogHeader><DialogTitle>Contactar a TroncalTrack</DialogTitle><DialogDescription>Soporte y sugerencias</DialogDescription></DialogHeader>
      <form onSubmit={submit} noValidate className="space-y-4">
        <Tabs value={tipo} onValueChange={(v) => { if (v === "soporte" || v === "sugerencia") setTipo(v); }}>
          <TabsList className="grid w-full grid-cols-2"><TabsTrigger disabled={enviando} value="soporte">Soporte</TabsTrigger><TabsTrigger disabled={enviando} value="sugerencia">Sugerencia</TabsTrigger></TabsList>
        </Tabs>
        <div className="space-y-2"><Label htmlFor="contacto-nombre">Nombre</Label><Input id="contacto-nombre" autoComplete="name" required maxLength={100} value={nombre} disabled={enviando} onChange={(e) => { setError(""); setNombreEditado(true); setNombre(e.target.value); }} /></div>
        <div className="space-y-2"><Label htmlFor="contacto-correo">Correo</Label><Input id="contacto-correo" type="email" autoComplete="email" required maxLength={255} value={correo} disabled={enviando} onChange={(e) => { setError(""); setCorreo(e.target.value); }} /></div>
        <div className="space-y-2"><Label htmlFor="contacto-mensaje">Mensaje</Label><Textarea id="contacto-mensaje" required minLength={10} maxLength={5000} rows={5} value={mensaje} disabled={enviando} onChange={(e) => { setError(""); setMensaje(e.target.value); }} /></div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={enviando} className="w-full">{enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{enviando ? "Enviando…" : "Enviar mensaje"}</Button>
      </form>
    </DialogContent>
  </Dialog>;
}