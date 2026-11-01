import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { actualizarPasswordRecuperada, useRecuperacionPassword } from "@/lib/use-session";

export function ResetPasswordForm({ onSuccess }: { onSuccess?: () => void }) {
  const recuperando = useRecuperacionPassword();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);
  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const datos = new FormData(event.currentTarget);
    setEnviando(true);
    setError(null);
    const resultado = await actualizarPasswordRecuperada(String(datos.get("password") ?? ""), String(datos.get("confirmacion") ?? ""));
    setEnviando(false);
    if (resultado) { setError(resultado); return; }
    setExito(true);
    onSuccess?.();
  }
  if (exito) return <div role="status" className="space-y-4 text-center"><CheckCircle2 className="mx-auto h-10 w-10 text-success" /><p className="font-semibold">Tu contraseña se actualizó correctamente.</p><Button asChild><Link to="/">Volver a TroncalTrack</Link></Button></div>;
  return <form className="space-y-4" onSubmit={(e) => void enviar(e)}>
    <div className="space-y-1.5"><Label htmlFor="nueva-password">Nueva contraseña</Label><Input id="nueva-password" name="password" type="password" autoComplete="new-password" minLength={6} required disabled={enviando} /></div>
    <div className="space-y-1.5"><Label htmlFor="confirmar-password">Confirmar nueva contraseña</Label><Input id="confirmar-password" name="confirmacion" type="password" autoComplete="new-password" minLength={6} required disabled={enviando} /></div>
    {!recuperando && <p className="text-sm text-muted-foreground">Abre el enlace de recuperación enviado a tu correo. Si venció, solicita uno nuevo desde Iniciar sesión.</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <Button type="submit" className="w-full" disabled={enviando || !recuperando}>{enviando && <Loader2 className="h-4 w-4 animate-spin" />} Guardar nueva contraseña</Button>
  </form>;
}