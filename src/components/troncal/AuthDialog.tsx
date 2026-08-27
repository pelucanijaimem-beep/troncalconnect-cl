import { useEffect, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  iniciarSesionEmail,
  recuperarPassword,
  registrarUsuario,
} from "@/lib/use-session";

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
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (open) {
      setVista(modo);
      setRolCuenta(rol);
    }
  }, [open, modo, rol]);

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    setEnviando(true);
    const error = await recuperarPassword(email);
    setEnviando(false);
    if (error) {
      toast.error("No pudimos enviar el correo", { description: error });
      return;
    }
    onOpenChange(false);
    toast.success("Te enviamos un correo para restablecer tu contraseña.");
  };

  const autenticar = async (e: FormEvent<HTMLFormElement>, tipo: "login" | "registro") => {
    e.preventDefault();
    if (tipo === "registro" && !aceptaTerminos) {
      toast.error("Debes aceptar los términos y condiciones", {
        description: "Marca la casilla para continuar.",
      });
      return;
    }
    const datos = new FormData(e.currentTarget);
    const email = String(datos.get("email") ?? "");
    const password = String(datos.get("password") ?? "");
    const nombre = String(datos.get("nombre") ?? "") || email.split("@")[0] || "Usuario";
    const telefono = String(datos.get("telefono") ?? "");
    const rut = String(datos.get("rut") ?? "");

    setEnviando(true);
    const error =
      tipo === "registro"
        ? await registrarUsuario({ nombre, email, password, rol: rolCuenta, telefono, rut })
        : await iniciarSesionEmail(email, password);
    setEnviando(false);

    if (error) {
      toast.error(tipo === "registro" ? "No pudimos crear tu cuenta" : "No pudimos iniciar sesión", {
        description: error,
      });
      return;
    }

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
            <form className="space-y-4" onSubmit={(e) => void enviar(e)}>
              <div className="space-y-1.5">
                <Label htmlFor="r-email">Correo electrónico</Label>
                <Input
                  id="r-email"
                  name="email"
                  type="email"
                  placeholder="tucorreo@ejemplo.cl"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={enviando}>
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
                Ingresa a tu cuenta o regístrate para acceder al tablero de cargas en vivo.
              </DialogDescription>
            </DialogHeader>

            <Tabs value={vista} onValueChange={(v) => setVista(v as Vista)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="registro">Registrarme</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-4">
                <form className="space-y-4" onSubmit={(e) => void autenticar(e, "login")}>
                  <div className="space-y-1.5">
                    <Label htmlFor="l-email">Correo electrónico</Label>
                    <Input id="l-email" name="email" type="email" placeholder="tucorreo@ejemplo.cl" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="l-pass">Contraseña</Label>
                    <Input id="l-pass" name="password" type="password" placeholder="••••••••" required />
                  </div>
                  <button
                    type="button"
                    onClick={() => setVista("recuperar")}
                    className="cursor-pointer text-sm font-medium text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                  <Button type="submit" className="w-full" disabled={enviando}>
                    Iniciar Sesión
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="registro" className="mt-4">
                <form className="space-y-4" onSubmit={(e) => void autenticar(e, "registro")}>
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
                    <Input id="s-rut" name="rut" placeholder="12.345.678-9" required />
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
                    <Input
                      id="s-pass"
                      name="password"
                      type="password"
                      minLength={6}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={enviando}>
                    Regístrate
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
