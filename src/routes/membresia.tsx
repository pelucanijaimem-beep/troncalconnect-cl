import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { MembershipManager } from "@/components/troncal/MembershipManager";

export const Route = createFileRoute("/membresia")({
  head: () => ({ meta: [
    { title: "Mi membresía y organización — TroncalTrack" },
    { name: "description", content: "Gestiona camiones registrados y usuarios de tu organización en TroncalTrack, sin comisiones por viaje." },
    { property: "og:title", content: "Mi membresía — TroncalTrack" },
    { property: "og:description", content: "Camiones y coordinadores de tu organización, con membresías en pesos chilenos fijos." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <main className="min-h-screen bg-background"><div className="mx-auto max-w-3xl px-4 py-10"><Link className="flex items-center gap-2 text-sm font-semibold text-primary" to="/"><ArrowLeft className="h-4 w-4" />Volver al tablero</Link><h1 className="mb-6 mt-5 text-3xl font-bold text-foreground">Mi membresía</h1><MembershipManager /></div></main>,
});