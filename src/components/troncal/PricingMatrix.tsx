import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Crown, Gift, Truck, Building2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCuposFundador } from "@/lib/use-fundadores";
import { calcularFlota, calcularDador, formatoCLP, PLANES_GENERADORES, PLANES_TRANSPORTE, WHATSAPP_PLANES, precioFundador } from "@/lib/pricing";



export function PricingMatrix() {
  const { quedan, total } = useCuposFundador();
  const [camiones, setCamiones] = useState(5);
  const [publicaciones, setPublicaciones] = useState(16);
  const flota = calcularFlota(camiones);
  const dador = calcularDador("generador_starter", publicaciones);
  const grupos = [{ id: "transportista", planes: PLANES_TRANSPORTE }, { id: "dador", planes: PLANES_GENERADORES }];
  return <>
    <p className="mb-5 text-lg font-bold text-primary">0% de comisión por viaje coordinado. Sin corte de cola de intermediarios.</p>
    <p className="mb-5 text-sm text-muted-foreground">Activación manual por WhatsApp y pago por transferencia. No hay cobros automáticos habilitados.</p>
    <p className="mb-5 text-xs text-muted-foreground">Precios en pesos chilenos (CLP). TroncalTrack se reserva el derecho de ajustar sus tarifas conforme a sus políticas internas de precios, informando oportunamente a los usuarios.</p>
    <Tabs defaultValue="transportista">
      <TabsList className="grid h-auto w-full grid-cols-2">
        <TabsTrigger value="transportista" className="min-h-12 whitespace-normal"><Truck className="mr-2 h-4 w-4 shrink-0" />Transportistas</TabsTrigger>
        <TabsTrigger value="dador" className="min-h-12 whitespace-normal"><Building2 className="mr-2 h-4 w-4 shrink-0" />Dadores de Carga</TabsTrigger>
      </TabsList>
      {grupos.map(grupo => <TabsContent key={grupo.id} value={grupo.id} className="mt-6">
        <div className="mb-6 flex gap-3 border-y border-success/30 bg-success-soft p-4 text-foreground"><Gift className="h-5 w-5 shrink-0 text-success" /><p className="text-sm font-semibold">{grupo.id === "transportista" ? "Flotas: 4 meses gratis durante el lanzamiento. Un camión es gratis para siempre." : "Generadores: primer mes gratis en la membresía base. Los adicionales se registran para facturación manual."}</p></div>
        <div className={`grid items-stretch gap-4 ${grupo.id === "transportista" ? "lg:grid-cols-3" : "lg:grid-cols-3"}`}>
          {grupo.planes.map(plan => <article key={plan.id} className={`flex min-w-0 flex-col rounded-lg border bg-card p-5 shadow-card ${plan.clp === 0 ? "border-success" : "border-border"}`}>
            <h3 className="text-lg font-extrabold text-foreground">{plan.nombre}</h3>
            {plan.clp === 0 && <p className="mt-2 font-bold text-success">Gratis para siempre</p>}
            <p className="mt-4 text-3xl font-extrabold text-foreground">{plan.desde ? "Desde " : ""}{formatoCLP(plan.clp)} <span className="text-sm font-normal">CLP</span></p>
            <p className="mt-1 text-sm text-muted-foreground">{grupo.id === "transportista" && plan.clp > 0 ? "por camión registrado / mes" : "/ mes"}</p>
            {plan.clp > 0 && <p className="mt-3 text-sm font-semibold text-primary">Fundador: {formatoCLP(precioFundador(plan.clp))} · −20% de por vida</p>}
            <ul className="my-5 flex-1 space-y-3">{plan.features.map(feature => <li key={feature} className="flex gap-2 text-sm text-foreground"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{feature}</span></li>)}</ul>
            <Button asChild variant={plan.clp === 0 ? "default" : "outline"} className="h-auto min-h-10 whitespace-normal py-2">{plan.clp === 0 ? <Link to="/registro">Registrarme gratis</Link> : <a href={`https://wa.me/${WHATSAPP_PLANES}?text=${encodeURIComponent(`Hola, quiero activar manualmente el plan ${plan.nombre} de TroncalTrack y consultar el pago por transferencia.`)}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4 shrink-0" />Activar por WhatsApp</a>}</Button>
          </article>)}
        </div>
        <div className="mt-6 grid gap-4 border-y border-border py-5 sm:grid-cols-2">
          <div><Label htmlFor={`cantidad-${grupo.id}`}>{grupo.id === "transportista" ? "Camiones registrados" : "Publicaciones mensuales · Starter"}</Label><Input id={`cantidad-${grupo.id}`} type="number" min={1} step={1} className="mt-2 max-w-40" value={grupo.id === "transportista" ? camiones : publicaciones} onChange={e => grupo.id === "transportista" ? setCamiones(Number(e.target.value)) : setPublicaciones(Number(e.target.value))} /></div>
          <div aria-live="polite"><p className="text-sm text-muted-foreground">Tarifa mensual después de la promoción</p><p className="mt-1 text-2xl font-bold text-foreground">{grupo.id === "transportista" ? flota ? formatoCLP(flota.totalClp) : "Cantidad inválida" : dador ? formatoCLP(dador.totalClp) : "Cantidad inválida"}</p><p className="mt-1 text-sm text-primary">{grupo.id === "transportista" ? flota?.plan?.nombre : `Starter · ${dador?.excedentes ?? 0} adicionales`}</p></div>
        </div>
      </TabsContent>)}
    </Tabs>
    <div className="mt-6 flex gap-3 border-l-4 border-primary bg-primary/5 p-4"><Crown className="h-5 w-5 shrink-0 text-primary" /><div><p className="font-bold text-foreground">Empresa Fundadora · 20% de descuento de por vida</p><p className="mt-1 text-sm text-muted-foreground">Se mantiene sobre el nuevo precio de tu tramo y tus unidades reales. {quedan !== null ? `Quedan ${quedan} de ${total} cupos.` : "Consulta disponibilidad."}</p></div></div>
  </>;
}
