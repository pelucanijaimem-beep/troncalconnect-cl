import { Building2, Check, Crown, Gift, MessageCircle, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCuposFundador } from "@/lib/use-fundadores";
import { useUF } from "@/lib/use-uf";
import { convertirUF, enlacePlan, formatoCLP, formatoUF, MESES_LANZAMIENTO, PLANES_GENERADORES, PLANES_TRANSPORTE, precioFundador } from "@/lib/pricing";

export function PricingMatrix() {
  const uf = useUF();
  const { quedan, total } = useCuposFundador();
  const grupos = [
    { nombre: "Generadores de Carga", descripcion: "Empresas que publican fletes", icono: Building2, planes: PLANES_GENERADORES },
    { nombre: "Empresas de Transporte", descripcion: "Dueños de camiones y flotas", icono: Truck, planes: PLANES_TRANSPORTE },
  ];

  return (
    <>
      <div className="flex items-start gap-3 border-y border-success/30 bg-success-soft px-4 py-5 text-foreground">
        <Gift className="mt-0.5 h-6 w-6 shrink-0 text-success" />
        <div>
          <p className="text-base font-extrabold">Lanzamiento: flotas gratis durante los primeros {MESES_LANZAMIENTO} meses</p>
          <p className="mt-1 text-sm">Flota Pyme, Mediana y Enterprise: 0 UF durante el período de lanzamiento. Las tarifas de abajo son las normales después de la promoción. Camión Independiente es gratis siempre.</p>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-3 border-l-4 border-primary bg-primary/5 px-4 py-4">
        <Crown className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="font-extrabold text-foreground">Empresa Fundadora: 20% de descuento de por vida</p>
          <p className="mt-1 text-sm text-muted-foreground">Sobre el precio normal de tu tramo real, tanto en Generadores como en Flotas. Si tu operación cambia de tamaño, el descuento se mantiene sobre el tramo que corresponda.</p>
          <p className="mt-1 text-sm font-semibold text-primary">
            {quedan !== null ? quedan > 0 ? `Quedan ${quedan} de ${total} cupos.` : "Cupos agotados; el beneficio se mantiene para empresas fundadoras." : "Consulta disponibilidad de cupos por WhatsApp."}
          </p>
        </div>
      </div>

      <p className="mt-5 text-xs text-muted-foreground" aria-live="polite">
        {uf.respaldo
          ? `${uf.cargando ? "Consultando UF del día. " : "UF del día no disponible. "}Conversión referencial de respaldo: 1 UF = ${uf.valor.toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CLP.`
          : `UF del día (${uf.fecha?.split("-").reverse().join("/")}): ${uf.valor.toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CLP.`}
        {" "}Equivalentes aproximados en pesos chilenos, redondeados al peso.
      </p>

      <div className="mt-7 grid items-start gap-8 lg:grid-cols-2">
        {grupos.map((grupo, indice) => (
          <div key={grupo.nombre} className="min-w-0">
            <div className="mb-5 flex items-center gap-3 border-b border-border pb-4">
              <grupo.icono className="h-7 w-7 shrink-0 text-primary" />
              <div>
                <h3 className="text-xl font-extrabold text-foreground">{grupo.nombre}</h3>
                <p className="text-sm text-muted-foreground">{grupo.descripcion}</p>
              </div>
            </div>
            <div className="space-y-4">
              {grupo.planes.map(plan => {
                const transporte = indice === 1;
                const gratis = plan.uf === 0;
                const desde = "desde" in plan && plan.desde;
                const porCamion = transporte && !gratis;
                const destacado = plan.id === "generador-pro";
                const periodo = porCamion ? "por camión activo / mes" : "/ mes";
                return (
                  <article key={plan.id} className={`min-w-0 rounded-lg border bg-card p-5 shadow-card ${destacado ? "border-primary" : "border-border"}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-lg font-extrabold text-foreground">{plan.nombre}</h4>
                      {gratis && <span className="text-xs font-bold text-success">Gratis permanente</span>}
                      {porCamion && <span className="text-xs font-bold text-success">Gratis en lanzamiento</span>}
                    </div>
                    <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <p className="text-2xl font-extrabold text-foreground">{desde ? "Desde " : ""}{formatoUF(plan.uf)} UF</p>
                      <span className="text-sm text-muted-foreground">{periodo}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{desde ? "Desde " : "≈ "}{formatoCLP(convertirUF(plan.uf, uf.valor))} CLP {periodo}</p>
                    {!gratis && (
                      <p className="mt-3 flex items-start gap-1.5 text-sm font-semibold text-primary">
                        <Crown className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>Fundador: {desde ? "desde " : ""}{formatoUF(precioFundador(plan.uf))} UF {periodo} (≈ {formatoCLP(convertirUF(precioFundador(plan.uf), uf.valor))} CLP). −20% de por vida.</span>
                      </p>
                    )}
                    <ul className="mt-4 space-y-2">
                      {plan.features.map(feature => <li key={feature} className="flex items-start gap-2 text-sm text-foreground"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{feature}</span></li>)}
                    </ul>
                    {gratis ? (
                      <Button asChild variant="outline" className="mt-5 w-full"><a href="/registro">Registrarme gratis</a></Button>
                    ) : (
                      <Button asChild variant={destacado ? "default" : "outline"} className="mt-5 h-auto min-h-10 w-full whitespace-normal py-2">
                        <a href={enlacePlan(plan.nombre, plan.uf, desde, porCamion)} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4 shrink-0" />{desde || plan.id === "flota-enterprise" ? "Cotizar por WhatsApp" : "Activar por WhatsApp"}</a>
                      </Button>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <h3 className="text-lg font-extrabold text-foreground">Pagas por camiones activos, no por tu flota declarada</h3>
        <p className="mt-2 text-sm text-muted-foreground">Un camión cuenta para el cobro solo cuando tiene su propio chofer con cuenta registrada y actividad durante ese mes: 1 chofer por camión. El tramo se determina por el número de camiones activos. La activación y gestión de cuentas de flota se coordina manualmente por WhatsApp.</p>
        <p className="mt-3 text-sm font-semibold text-foreground">Ejemplo: 500 camiones en tu empresa y 200 activos → 200 × 0,08 = 16 UF/mes (≈ {formatoCLP(convertirUF(16, uf.valor))} CLP). Con cupo Fundador: 12,8 UF/mes (≈ {formatoCLP(convertirUF(12.8, uf.valor))} CLP).</p>
        <p className="mt-2 text-sm text-muted-foreground">Una empresa fundadora con 5 camiones activos paga 1 UF/mes en lugar de 1,25 UF. Durante el lanzamiento, ambos ejemplos de flotas pagan 0 UF.</p>
      </div>
    </>
  );
}