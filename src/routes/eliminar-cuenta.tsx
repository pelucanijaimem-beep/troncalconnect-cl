import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { solicitarEliminacionCuenta } from "@/lib/cuenta.functions";

export const Route = createFileRoute("/eliminar-cuenta")({
  component: EliminarCuenta,
  head: () => ({
    meta: [
      { title: "Eliminar cuenta y datos | TroncalTrack" },
      {
        name: "description",
        content:
          "Solicita la eliminación de tu cuenta TroncalTrack y de todos tus datos personales, sin necesidad de iniciar sesión.",
      },
      { property: "og:title", content: "Eliminar cuenta y datos | TroncalTrack" },
      {
        property: "og:description",
        content:
          "Formulario para pedir la eliminación definitiva de tu cuenta y tus datos en TroncalTrack.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function EliminarCuenta() {
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    setEnviando(true);
    try {
      await solicitarEliminacionCuenta({
        data: {
          email: String(d.get("email") ?? ""),
          motivo: String(d.get("motivo") ?? ""),
        },
      });
      setListo(true);
      toast.success("Solicitud recibida");
    } catch {
      toast.error("No pudimos registrar la solicitud. Revisa el correo ingresado.");
    }
    setEnviando(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <Link to="/" className="text-sm font-semibold text-primary hover:underline">
          ← Volver al inicio
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold text-foreground">
          Eliminar mi cuenta y mis datos
        </h1>
        <p className="mt-2 text-muted-foreground">
          Puedes pedir la eliminación definitiva de tu cuenta TroncalTrack aunque no tengas acceso
          a ella. Procesamos las solicitudes dentro de 30 días corridos.
        </p>

        <div className="mt-6 rounded-xl border border-border bg-surface p-4 text-sm">
          <p className="inline-flex items-center gap-2 font-bold text-foreground">
            <ShieldAlert className="h-4 w-4 text-primary" /> Qué eliminamos
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Tu perfil: nombre, correo, teléfono y RUT.</li>
            <li>Tus cargas publicadas, postulaciones y favoritos.</li>
            <li>Tus documentos de verificación TroncalCheck y tus avisos.</li>
          </ul>
          <p className="mt-2 text-muted-foreground">
            Conservamos solo los registros que la ley chilena nos exige mantener (por ejemplo,
            respaldos contables), de forma separada y sin uso comercial.
          </p>
        </div>

        {listo ? (
          <div className="mt-6 rounded-xl border border-border bg-success-soft p-4">
            <p className="font-bold text-success">Solicitud recibida</p>
            <p className="mt-1 text-sm text-foreground">
              Registramos tu solicitud. Te escribiremos al correo indicado cuando la eliminación
              esté completada.
            </p>
          </div>
        ) : (
          <form onSubmit={(e) => void enviar(e)} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="e-email">Correo de la cuenta</Label>
              <Input id="e-email" name="email" type="email" placeholder="correo@empresa.cl" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-motivo">Motivo (opcional)</Label>
              <Textarea id="e-motivo" name="motivo" placeholder="Cuéntanos por qué te vas." />
            </div>
            <Button type="submit" disabled={enviando}>
              {enviando ? "Enviando…" : "Solicitar eliminación"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-xs text-muted-foreground">
          Si tienes sesión iniciada, también puedes eliminar tu cuenta al instante desde el menú
          “Mi Cuenta”.
        </p>
      </main>
    </div>
  );
}
