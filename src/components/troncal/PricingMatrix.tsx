import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Crown, Gift, Truck, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCuposFundador } from "@/lib/use-fundadores";
import { calcularFlota, calcularDador, formatoCLP, PLANES_GENERADORES, PLANES_TRANSPORTE } from "@/lib/pricing";

export function PricingMatrix() {
  const { quedan, total } = useCuposFundador();
  const [camiones, setCamiones] = useState(5);
  const [licencias, setLicencias] = useState(2);
  const flota = calcularFlota(camiones);
  const dador = calcularDador("corporativo_premium", licencias);
  const grupos = [{ id: "transportista", planes: PLANES_TRANSPORTE }, { id: "dador", planes: PLANES_GENERADORES }];
  return <>
    <p className="mb-5 text-lg font-bold text-primary">0% de comisión por viaje coordinado. Sin corte de cola de intermediarios.</p>
    <Tabs defaultValue="transportista">
      <TabsList className="grid h-auto w-full grid-cols-2">
        <TabsTrigger value="transportista" className="min-h-12 whitespace-normal"><Truck className="mr-2 h-4 w-4 shrink-0" />Transportistas</TabsTrigger>
        <TabsTrigger value="dador" className="min-h-12 whitespace-normal"><Building2 className="mr-2 h-4 w-4 shrink-0" />Dadores de Carga</TabsTrigger>
      </TabsList>
      {grupos.map(grupo => <TabsContent key={grupo.id} value={grupo.id} className="mt-6">
        <div className="mb-6 flex gap-3 border-y border-success/30 bg-success-soft p-4 text-foreground"><Gift className="h-5 w-5 shrink-0 text-success" /><p className="text-sm font-semibold">{grupo.id === "transportista" ? "Flotas: 4 meses gratis durante el lanzamiento. Un camión es gratis para siempre." : "Empresa Pyme y Corporativo Premium: primer mes de prueba gratis."}</p></div>
        <div className={`grid items-stretch gap-4 ${grupo.id === "transportista" ? "lg:grid-cols-3" : "md:grid-cols-2"}`}>
          {grupo.planes.map(plan => <article key={plan.id} className={`flex min-w-0 flex-col rounded-lg border bg-card p-5 shadow-card ${plan.clp === 0 ? "border-success" : "border-border"}`}>
            <h3 className="text-lg font-extrabold text-foreground">{plan.nombre}</h3>
            {plan.clp === 0 && <p className="mt-2 font-bold text-success">Gratis para siempre</p>}
            <p className="mt-4 text-3xl font-extrabold text-foreground">{formatoCLP(plan.clp)} <span className="text-sm font-normal">CLP</span></p>
            <p className="mt-1 text-sm text-muted-foreground">{grupo.id === "transportista" && plan.clp > 0 ? "por camión registrado / mes" : plan.id === "corporativo_premium" ? "por usuario activo / mes" : "/ mes"}</p>
            {plan.clp > 0 && <p className="mt-3 text-sm font-semibold text-primary">Fundador: {formatoCLP(Math.round(plan.clp * 0.8))} · −20% de por vida</p>}
            <ul className="my-5 flex-1 space-y-3">{plan.features.map(feature => <li key={feature} className="flex gap-2 text-sm text-foreground"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{feature}</span></li>)}</ul>
            <Button asChild variant={plan.clp === 0 ? "default" : "outline"} className="h-auto min-h-10 whitespace-normal py-2"><Link to="/registro">{plan.clp === 0 ? "Registrarme gratis" : "Crear cuenta"}</Link></Button>
          </article>)}
        </div>
        <div className="mt-6 grid gap-4 border-y border-border py-5 sm:grid-cols-2">
          <div><Label htmlFor={`cantidad-${grupo.id}`}>{grupo.id === "transportista" ? "Camiones registrados" : "Licencias activas · Corporativo Premium"}</Label><Input id={`cantidad-${grupo.id}`} type="number" min={1} step={1} className="mt-2 max-w-40" value={grupo.id === "transportista" ? camiones : licencias} onChange={e => grupo.id === "transportista" ? setCamiones(Number(e.target.value)) : setLicencias(Number(e.target.value))} /></div>
          <div aria-live="polite"><p className="text-sm text-muted-foreground">Tarifa mensual después de la promoción</p><p className="mt-1 text-2xl font-bold text-foreground">{grupo.id === "transportista" ? flota ? formatoCLP(flota.totalClp) : "Cantidad inválida" : dador ? formatoCLP(dador.totalClp) : "Cantidad inválida"}</p><p className="mt-1 text-sm text-primary">{grupo.id === "transportista" ? flota?.plan?.nombre : "Corporativo Premium"}</p></div>
        </div>
      </TabsContent>)}
    </Tabs>
    <div className="mt-6 flex gap-3 border-l-4 border-primary bg-primary/5 p-4"><Crown className="h-5 w-5 shrink-0 text-primary" /><div><p className="font-bold text-foreground">Empresa Fundadora · 20% de descuento de por vida</p><p className="mt-1 text-sm text-muted-foreground">Se mantiene sobre el nuevo precio de tu tramo y tus unidades reales. {quedan !== null ? `Quedan ${quedan} de ${total} cupos.` : "Consulta disponibilidad."}</p></div></div>
  </>;
}
