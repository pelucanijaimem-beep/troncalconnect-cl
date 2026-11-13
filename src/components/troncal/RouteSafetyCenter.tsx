import { useEffect, useRef, useState } from "react";
import { Activity, ArrowRight, BadgeCheck, Check, CheckCircle2, Copy, Link2, MapPin, Navigation, Pause, Play, Radio, RefreshCw, ShieldCheck, Siren, Star, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DEMO_LINK_TTL_MS, enlaceDemoVigente, validarPinDemostracion } from "@/lib/route-safety-demo";

function hora() { return new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }

export function RouteSafetyCenter() {
  const [avance, setAvance] = useState(42);
  const [pausado, setPausado] = useState(false);
  const [senal, setSenal] = useState(5);
  const [pin, setPin] = useState("");
  const [etapa, setEtapa] = useState<"origen" | "destino">("origen");
  const [sellos, setSellos] = useState({ origen: "", destino: "" });
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [enlace, setEnlace] = useState("");
  const [compartido, setCompartido] = useState("");
  const [sos, setSos] = useState(false);
  const [alerta, setAlerta] = useState("");
  const mapa = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = mapa.current;
    if (!svg) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const actualizar = () => { if (pausado || media.matches) svg.pauseAnimations(); else svg.unpauseAnimations(); };
    actualizar();
    media.addEventListener("change", actualizar);
    return () => media.removeEventListener("change", actualizar);
  }, [pausado]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSenal(s => s >= 9 ? 1 : s + 1);
      if (!pausado && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) setAvance(a => Math.min(100, a + 0.03));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [pausado]);

  useEffect(() => {
    function abrirMuestra() {
    const token = new URLSearchParams(window.location.hash.slice(1)).get("muestra");
    if (!token) return;
    try {
      const key = `ruta-demo:${token}`;
      const raw = localStorage.getItem(key);
      const record = raw ? JSON.parse(raw) : null;
      if (!record || !enlaceDemoVigente(record.expiresAt, record.used, Date.now())) {
        setCompartido("Este enlace de muestra venció, ya fue utilizado o pertenece a otro navegador.");
        return;
      }
      localStorage.setItem(key, JSON.stringify({ ...record, used: true }));
      setCompartido("Enlace de muestra abierto. Su único uso en este navegador ya fue consumido.");
    } catch { setCompartido("No pudimos abrir el enlace de muestra."); }
    }
    abrirMuestra();
    window.addEventListener("hashchange", abrirMuestra);
    return () => window.removeEventListener("hashchange", abrirMuestra);
  }, []);

  async function copiar(texto: string) {
    try { await navigator.clipboard.writeText(texto); setAviso("Enlace copiado."); }
    catch { setAviso("No se pudo copiar automáticamente. Selecciona el enlace y cópialo."); }
  }

  async function compartir() {
    try {
      const token = crypto.randomUUID();
      localStorage.setItem(`ruta-demo:${token}`, JSON.stringify({ expiresAt: Date.now() + DEMO_LINK_TTL_MS, used: false }));
      const url = `${window.location.origin}/seguridad-ruta#muestra=${token}`;
      setEnlace(url);
      await copiar(url);
    } catch { setAviso("No pudimos generar el enlace de muestra en este navegador."); }
  }

  function validar() {
    const mensaje = validarPinDemostracion(pin, etapa, Boolean(sellos.origen));
    if (mensaje) { setError(mensaje); return; }
    setSellos(s => ({ ...s, [etapa]: hora() }));
    setError(""); setPin("");
  }

  const panel = "rounded-lg border border-border bg-card p-5 shadow-card";
  return (
    <>
      <div className="mb-6 flex gap-3 border-l-4 border-warning bg-surface px-4 py-3 text-sm">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-warning" />
        <p><strong>Demostración · Datos ficticios.</strong> Sin conexión al GPS del vehículo. Los PIN no validan cargas reales y el botón de emergencia no envía alertas.</p>
      </div>
      {compartido && <p role="status" className="mb-5 border border-border bg-surface p-3 text-sm">{compartido}</p>}
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="grid gap-6">
          <section className="overflow-hidden rounded-lg border border-border bg-card shadow-card" aria-labelledby="ruta-title">
            <div className="flex items-center justify-between gap-3 p-5">
              <div><h2 id="ruta-title" className="flex items-center gap-2 font-bold"><Navigation className="size-5 text-primary" /> Visor de ruta</h2><p className="mt-1 text-xs text-muted-foreground">Recorrido simulado · Ruta 5 Sur</p></div>
              <Button variant="outline" size="icon" onClick={() => setPausado(p => !p)} aria-label={pausado ? "Reanudar simulación" : "Pausar simulación"}>{pausado ? <Play /> : <Pause />}</Button>
            </div>
            <div className="relative bg-surface px-4" role="img" aria-label="Mapa esquemático de Santiago a Puerto Montt con camión en movimiento simulado">
              <svg ref={mapa} viewBox="0 0 560 360" className="block aspect-[14/9] w-full" fill="none">
                <path d="M80 0L115 95 65 190 110 270 75 360H0V0Z" className="fill-trust-soft" />
                <path d="M425 0L390 90 455 175 405 260 475 360H560V0Z" className="fill-muted" />
                <g className="stroke-border" strokeWidth="2"><path d="M90 60H480M90 150H480M90 240H480M90 320H480M180 0V360M350 0V360" /></g>
                <path d="M225 45C320 85 230 120 290 170S240 245 330 310" className="stroke-border" strokeWidth="12" strokeLinecap="round" />
                <path id="ruta-demo-trazado" d="M225 45C320 85 230 120 290 170S240 245 330 310" className="stroke-primary" strokeWidth="4" strokeLinecap="round" />
                <g className="fill-card stroke-primary" strokeWidth="3"><circle cx="225" cy="45" r="7" /><circle cx="330" cy="310" r="7" /></g>
                <g className="fill-muted-foreground" fontSize="12" fontFamily="inherit"><text x="115" y="48">Santiago</text><text x="325" y="135">Talca</text><text x="320" y="200">Temuco</text><text x="345" y="314">Puerto Montt</text></g>
                <g className="fill-primary"><circle r="17"><animateMotion dur="60s" repeatCount="indefinite" path="M225 45C320 85 230 120 290 170S240 245 330 310" calcMode="paced" /></circle></g>
                <g className="stroke-primary-foreground" strokeWidth="2"><path d="M-8-5H2V5H-8ZM2-2H6L9 1V5H2M-5 8H-4M5 8H6"><animateMotion dur="60s" repeatCount="indefinite" path="M225 45C320 85 230 120 290 170S240 245 330 310" calcMode="paced" /></path></g>
              </svg>
            </div>
            <div className="flex items-center gap-2 border-y border-border px-5 py-3 text-sm font-semibold"><MapPin className="size-4 text-primary" /> Santiago <ArrowRight className="size-4 text-muted-foreground" /> Puerto Montt</div>
            <div className="grid grid-cols-3 divide-x divide-border py-5 text-center">
              <div><p className="text-xs text-muted-foreground">Velocidad</p><p className="mt-1 text-xl font-extrabold">85 <span className="text-xs font-medium">km/h</span></p></div>
              <div><p className="text-xs text-muted-foreground">Avance</p><p className="mt-1 text-xl font-extrabold">{Math.floor(avance)}%</p></div>
              <div><p className="text-xs text-muted-foreground">Llegada estimada</p><p className="mt-1 text-xl font-extrabold">18:45</p></div>
            </div>
          </section>
          <section className={panel}>
            <h2 className="flex items-center gap-2 font-bold"><Radio className="size-5 text-primary" /> Enlace GPS del vehículo</h2>
            <p className="mt-3 text-sm font-semibold">Conexión directa vía API del vehículo · Sin aplicación en el teléfono</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><dt className="text-muted-foreground">Proveedor</dt><dd>Pendiente de conectar</dd><dt className="text-muted-foreground">Señal de muestra</dt><dd>Hace {senal} segundos</dd></dl>
            <p className="mt-4 text-xs text-muted-foreground">La señal y el recorrido son simulados; no se reciben datos del camión.</p>
            <Button variant="outline" className="mt-4" onClick={() => setSenal(0)}><RefreshCw /> Actualizar señal de muestra</Button>
          </section>
        </div>
        <div className="grid gap-6">
          <section className={panel}>
            <h2 className="flex items-center gap-2 font-bold"><BadgeCheck className="size-5 text-primary" /> Identidad y vehículo</h2>
            <div className="mt-4 flex items-start gap-3"><div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-surface"><Truck className="size-6 text-primary" /></div><div><p className="font-bold">Conductor de muestra</p><p className="mt-1 text-sm text-muted-foreground">Empresa transportista de ejemplo</p></div></div>
            <div className="mt-4 flex gap-2 bg-trust-soft p-3 text-sm text-trust"><ShieldCheck className="size-5 shrink-0" /><p>Identidad biométrica con Didit y documentación: <strong>estado de muestra, no verificación real</strong>.</p></div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><dt className="text-muted-foreground">Patente de muestra</dt><dd>DEMO-01</dd><dt className="text-muted-foreground">Rampla</dt><dd>Refrigerada · 28 t</dd><dt className="text-muted-foreground">Calificación de muestra</dt><dd className="flex gap-1 text-warning" aria-label="5 estrellas de muestra">{Array.from({ length: 5 }, (_, i) => <Star key={i} className="size-4 fill-current" />)}</dd></dl>
          </section>
          <section className={panel}>
            <h2 className="flex items-center gap-2 font-bold"><ShieldCheck className="size-5 text-primary" /> Validación por PIN de seguridad</h2>
            <div className="mt-4 grid grid-cols-2 gap-2" role="group" aria-label="Etapa de validación">
              {(["origen", "destino"] as const).map(e => <Button key={e} variant={etapa === e ? "default" : "outline"} className="h-auto min-h-10 whitespace-normal" aria-pressed={etapa === e} onClick={() => { setEtapa(e); setPin(""); setError(""); }}>{sellos[e] && <Check />} {e === "origen" ? "Retiro en origen" : "Entrega en destino"}</Button>)}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Token de muestra: 8492 · No autoriza retiros ni entregas reales.</p>
            {sellos[etapa] ? <p role="status" className="mt-4 flex items-center gap-2 text-sm text-success"><CheckCircle2 className="size-5" /> {etapa === "origen" ? "Retiro" : "Entrega"} de muestra validado a las {sellos[etapa]}</p> : <form className="mt-4" onSubmit={e => { e.preventDefault(); validar(); }}>
              <label htmlFor="pin-seguridad" className="text-sm font-semibold">PIN de 4 dígitos</label>
              <Input id="pin-seguridad" inputMode="numeric" autoComplete="off" maxLength={4} value={pin} onChange={e => { setPin(e.target.value.replace(/\D/g, "")); setError(""); }} placeholder="••••" aria-invalid={Boolean(error)} aria-describedby={error ? "pin-error" : undefined} className="mt-2 h-11 text-lg" />
              {error && <p id="pin-error" role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
              <Button type="submit" className="mt-3 h-auto min-h-10 w-full whitespace-normal"><ShieldCheck /> Validar {etapa === "origen" ? "retiro" : "entrega"} segura</Button>
            </form>}
          </section>
          <section className={panel}>
            <h2 className="flex items-center gap-2 font-bold"><Link2 className="size-5 text-primary" /> Compartir seguimiento</h2>
            <p className="mt-2 text-sm text-muted-foreground">Enlace de muestra: dura 15 minutos y permite una apertura solo en este navegador. El seguimiento público real está pendiente de conexión.</p>
            <Button variant="outline" className="mt-4 h-auto min-h-10 w-full whitespace-normal" onClick={compartir}><Copy /> Generar y copiar enlace de muestra</Button>
            {enlace && <><label htmlFor="enlace-muestra" className="mt-3 block text-xs text-muted-foreground">Enlace generado</label><Input id="enlace-muestra" readOnly value={enlace} className="mt-1" /></>}
            {aviso && <p role="status" className="mt-2 text-xs text-muted-foreground">{aviso}</p>}
          </section>
          <section className={panel}>
            <h2 className="flex items-center gap-2 font-bold"><Activity className="size-5 text-primary" /> Monitor de anomalías</h2>
            <p className="mt-4 flex items-start gap-2 text-sm text-success"><CheckCircle2 className="size-5 shrink-0" /> Ruta óptima de muestra · Sin desvíos ni detenciones simuladas.</p>
            <Button variant="destructive" className="mt-4 h-auto min-h-11 w-full whitespace-normal" onClick={() => setSos(true)}><Siren /> Alerta silenciosa / Emergencia en ruta</Button>
            {alerta && <p role="status" className="mt-3 text-sm font-semibold text-destructive">{alerta}</p>}
            <p className="mt-3 text-xs text-muted-foreground">Simulación sin envío. Ante una emergencia real, contacta directamente a los servicios de emergencia.</p>
          </section>
        </div>
      </div>
      <Dialog open={sos} onOpenChange={setSos}><DialogContent><DialogHeader><DialogTitle>¿Confirmar alerta de muestra?</DialogTitle><DialogDescription>Esta acción solo registra una confirmación en esta pantalla. No avisa a la empresa, no contacta servicios de emergencia y no transmite tu ubicación.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setSos(false)}>Cancelar</Button><Button variant="destructive" onClick={() => { setAlerta(`Alerta de muestra registrada a las ${hora()}. No se envió ninguna notificación.`); setSos(false); }}><Siren /> Confirmar simulación</Button></DialogFooter></DialogContent></Dialog>
    </>
  );
}