import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoleSwitcher, type Rol } from "@/components/troncal/RoleSwitcher";
import { registrarUsuario } from "@/lib/use-session";

export const Route = createFileRoute("/registro")({
  head: () => ({
    meta: [
      { title: "Crear cuenta — TroncalTrack" },
      {
        name: "description",
        content:
          "Regístrate gratis en TroncalTrack y accede a la bolsa de cargas y camiones en Sudamérica.",
      },
      { property: "og:title", content: "Crear cuenta — TroncalTrack" },
      {
        property: "og:description",
        content:
          "Regístrate gratis en TroncalTrack y accede a la bolsa de cargas y camiones en Sudamérica.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RegistroPage,
});

function RegistroPage() {
  const navigate = useNavigate();
  const [rol, setRol] = useState<Rol>("camionero");
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    const nombre = String(datos.get("nombre") ?? "");
    const email = String(datos.get("email") ?? "");
    const telefono = String(datos.get("telefono") ?? "");
    const rut = String(datos.get("rut") ?? "");
    const password = String(datos.get("password") ?? "");

    if (!nombre || !email || !password) {
      toast.error("Completa los campos obligatorios");
      return;
    }

    setEnviando(true);
    const error = await registrarUsuario({ nombre, email, password, rol, telefono, rut });
    setEnviando(false);

    if (error) {
      toast.error("No pudimos crear tu cuenta", { description: error });
      return;
    }

    toast.success("¡Cuenta creada! Ya puedes ver las cargas en vivo.", {
      description: "Te redirigimos a tu tablero privado.",
    });

    navigate({ to: "/" });
  };


  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Crear cuenta en TroncalTrack
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Regístrate gratis y empieza a publicar o buscar cargas en minutos.
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={(e) => void enviar(e)}>
          <div className="space-y-1.5">
            <Label>Tipo de cuenta</Label>
            <RoleSwitcher rol={rol} onChange={setRol} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nombre">
              {rol === "camionero" ? "Nombre completo" : "Razón social"}
            </Label>
            <Input
              id="nombre"
              name="nombre"
              placeholder={rol === "camionero" ? "Juan Pérez" : "Forestal Biobío SpA"}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rut">RUT</Label>
            <Input id="rut" name="rut" placeholder="12.345.678-9" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tucorreo@ejemplo.cl"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              name="telefono"
              type="tel"
              placeholder="+56 9 1234 5678"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pass">Contraseña</Label>
            <Input
              id="pass"
              name="password"
              type="password"
              minLength={6}
              placeholder="••••••••"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={enviando}
            className="w-full cursor-pointer transition-all hover:brightness-110"
          >
            Registrarme gratis
          </Button>

        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/"
            className="font-semibold text-primary hover:underline"
            onClick={() => {
              // Al volver al inicio, el header puede abrir login si se desea.
            }}
          >
            Volver al inicio
          </Link>
        </p>
      </div>
    </main>
  );
}
