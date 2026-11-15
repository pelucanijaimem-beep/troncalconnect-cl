import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoleSwitcher, type Rol } from "./RoleSwitcher";
import { completarRegistroGoogle } from "@/lib/use-session";

/**
 * Se muestra una sola vez, justo después de "Continuar con Google", cuando el
 * perfil todavía no tiene RUT (necesitaRut). Sin RUT no hay sello TroncalCheck
 * ni acceso al tablero de cargas, así que el diálogo no se puede cerrar hasta
 * completarlo: pasamos onOpenChange sin efecto, igual que el flujo de
 * recuperación de contraseña retiene su propio diálogo.
 */
export function CompletarPerfilGoogleDialog({
  open,
  rolSugerido,
  nombre,
}: {
  open: boolean;
  rolSugerido: Rol;
  nombre?: string;
}) {
  const [rol, setRol] = useState<Rol>(rolSugerido);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    const rut = String(datos.get("rut") ?? "");
    const telefono = String(datos.get("telefono") ?? "");

    setEnviando(true);
    const error = await completarRegistroGoogle({ rut, telefono, rol });
    setEnviando(false);

    if (error) {
      toast.error("No pudimos guardar tus datos", { description: error });
      return;
    }
    toast.success("¡Listo! Ya puedes ver las cargas en vivo.");
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>
            {nombre ? `¡Hola, ${nombre}!` : "¡Hola!"} Completa tu registro
          </DialogTitle>
          <DialogDescription>
            Ya iniciaste sesión con Google. Nos falta tu RUT y tu teléfono para activar la
            verificación TroncalCheck y mostrarte el tablero de cargas.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={(e) => void enviar(e)}>
          <div className="space-y-1.5">
            <Label>Tipo de cuenta</Label>
            <RoleSwitcher rol={rol} onChange={setRol} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="g-rut">RUT</Label>
            <Input id="g-rut" name="rut" placeholder="12.345.678-9" maxLength={16} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="g-tel">Teléfono</Label>
            <Input
              id="g-tel"
              name="telefono"
              type="tel"
              placeholder="+56 9 1234 5678"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={enviando}>
            <ShieldCheck className="h-4 w-4" /> {enviando ? "Guardando…" : "Continuar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
