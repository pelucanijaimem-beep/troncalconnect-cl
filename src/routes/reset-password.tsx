import { createFileRoute, Link } from "@tanstack/react-router";
import { ResetPasswordForm } from "@/components/troncal/ResetPasswordForm";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Restablecer contraseña | TroncalTrack" },
    { name: "description", content: "Crea una nueva contraseña para tu cuenta de TroncalTrack con tu enlace de recuperación." },
    { property: "og:title", content: "Restablecer contraseña | TroncalTrack" },
    { property: "og:description", content: "Recupera el acceso a tu cuenta de TroncalTrack de forma segura." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <main className="min-h-screen bg-background px-4 py-16"><div className="mx-auto max-w-md space-y-8"><Link to="/" className="text-2xl font-extrabold text-primary">TroncalTrack</Link><h1 className="text-2xl font-bold text-foreground">Restablecer contraseña</h1><ResetPasswordForm /></div></main>,
});