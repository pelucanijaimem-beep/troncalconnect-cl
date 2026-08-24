import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleSwitcher, type Rol } from "./RoleSwitcher";
import { iniciarSesion } from "@/lib/use-session";

type Vista = "login" | "registro" | "recuperar";

export function AuthDialog({
  open,
  modo,
  rol,
  onOpenChange,
}: {
  open: boolean;
  modo: "login" | "registro";
  rol: Rol;
  onOpenChange: (o: boolean) => void;
}) {
  const [vista, setVista] = useState<Vista>(modo);
  const [rolCuenta, setRolCuenta] = useState<Rol>(rol);

  useEffect(() => {
    if (open) {
      setVista(modo);
      setRolCuenta(rol);
    }
  }, [open, modo, rol]);

  const enviar = (e: FormEvent, mensaje: string) => {
    e.preventDefault();
    onOpenChange(false);
    toast.success(mensaje);
  };

  const autenticar = (e: FormEvent<HTMLFormElement>, tipo: "login" | "registro") => {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    const email = String(datos.get("email") ?? "");
    const nombre = String(datos.get("nombre") ?? "") || email.split("@")[0] || "Usuario";
    const telefono = String(datos.get("telefono") ?? "");
    iniciarSesion({
      nombre,
      email,
      rol: tipo === "registro" ? rolCuenta : rol,
      ...(telefono ? { telefono } : {}),
    });
    onOpenChange(false);
    toast.success(
      tipo === "registro" ? "¡Cuenta creada! Ya puedes ver las cargas en vivo." : "Sesión iniciada.",
      { description: "Tu tablero privado está activo." },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        {vista === "recuperar" ? (
          <>
            <DialogHeader>
              <DialogTitle>Recuperar contraseña</DialogTitle>
              <DialogDescription>
                Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
              </DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(e) => enviar(e, "Te enviamos un correo para restablecer tu contraseña.")}
            >
              <div className="space-y-1.5">
                <Label htmlFor="r-email">Correo electrónico</Label>
                <Input id="r-email" type="email" placeholder="tucorreo@ejemplo.cl" required />
              </div>
              <Button type="submit" className="w-full">
                Enviar enlace de recuperación
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setVista("login")}
              >
                Volver a Iniciar Sesión
              </Button>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Bienvenido a TroncalTrack</DialogTitle>
              <DialogDescription>
                Crear tu cuenta es gratis durante nuestro lanzamiento regional.
              </DialogDescription>
            </DialogHeader>

            <Tabs value={vista} onValueChange={(v) => setVista(v as Vista)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="registro">Registrarme</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-4">
                <form className="space-y-4" onSubmit={(e) => autenticar(e, "login")}>
                  <div className="space-y-1.5">
                    <Label htmlFor="l-email">Correo electrónico</Label>
                    <Input id="l-email" name="email" type="email" placeholder="tucorreo@ejemplo.cl" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="l-pass">Contraseña</Label>
                    <Input id="l-pass" type="password" placeholder="••••••••" required />
                  </div>
                  <button
                    type="button"
                    onClick={() => setVista("recuperar")}
                    className="cursor-pointer text-sm font-medium text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                  <Button type="submit" className="w-full">
                    Iniciar Sesión
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="registro" className="mt-4">
                <form className="space-y-4" onSubmit={(e) => autenticar(e, "registro")}>
                  <div className="space-y-1.5">
                    <Label>Tipo de cuenta</Label>
                    <RoleSwitcher rol={rolCuenta} onChange={setRolCuenta} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="s-nombre">
                      {rolCuenta === "camionero" ? "Nombre completo" : "Razón social"}
                    </Label>
                    <Input
                      id="s-nombre"
                      name="nombre"
                      placeholder={rolCuenta === "camionero" ? "Juan Pérez" : "Forestal Biobío SpA"}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="s-rut">RUT</Label>
                    <Input id="s-rut" placeholder="12.345.678-9" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="s-email">Correo electrónico</Label>
                    <Input id="s-email" name="email" type="email" placeholder="tucorreo@ejemplo.cl" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="s-tel">Teléfono</Label>
                    <Input id="s-tel" name="telefono" type="tel" placeholder="+56 9 1234 5678" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="s-pass">Contraseña</Label>
                    <Input id="s-pass" type="password" placeholder="••••••••" required />
                  </div>
                  <Button type="submit" className="w-full">
                    Regístrate Gratis
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
