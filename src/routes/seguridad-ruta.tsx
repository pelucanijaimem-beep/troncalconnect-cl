import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RouteSafetyCenter } from "@/components/troncal/RouteSafetyCenter";

export const Route = createFileRoute("/seguridad-ruta")({
  head: () => ({ meta: [
    { title: "Centro de Control y Seguridad en Ruta — TroncalTrack" },
    { name: "description", content: "Vista demostrativa de control de ruta, validación por PIN y seguridad en el transporte chileno. Sin telemetría ni alertas reales conectadas." },
    { property: "og:title", content: "Centro de Control y Seguridad en Ruta — TroncalTrack" },
    { property: "og:description", content: "Centro demostrativo de seguridad y seguimiento de cargas de TroncalTrack." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: SeguridadRutaPage,
});

function SeguridadRutaPage() {
  return <main className="min-h-screen bg-background">
    <header className="border-b border-border"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4"><Link to="/" className="flex items-center gap-2 font-extrabold"><img src="/logo-icon.png" alt="" className="size-9 object-contain" /><span>Troncal<span className="text-primary">Track</span></span></Link><Button asChild variant="ghost"><Link to="/"><ArrowLeft /> Volver al inicio</Link></Button></div></header>
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10"><p className="flex items-center gap-2 text-xs font-bold uppercase text-primary"><ShieldCheck className="size-4" /> Seguridad en Ruta · Chile</p><h1 className="mt-3 max-w-3xl text-3xl font-extrabold sm:text-4xl">Centro de Control y Seguridad en Ruta</h1><p className="mb-6 mt-3 text-sm text-muted-foreground">Santiago — Puerto Montt · Operación de muestra</p><RouteSafetyCenter /></div>
  </main>;
}