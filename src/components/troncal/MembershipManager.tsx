import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Plus, Trash2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { consultarMembresia, gestionarMembresia, type Membresia } from "@/lib/membresia.functions";
import { formatoCLP, patenteValida, WHATSAPP_PLANES } from "@/lib/pricing";
import { refrescarSesion, useSesion } from "@/lib/use-session";

export function MembershipManager() {
  const sesion = useSesion();
  const consultar = useServerFn(consultarMembresia);
  const gestionar = useServerFn(gestionarMembresia);
  const [m, setM] = useState<Membresia | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [valor, setValor] = useState("");
  useEffect(() => {
    if (!sesion) return;
    let vigente = true;
    setCargando(true);
    consultar().then(r => { if (vigente) { setM(r.membresia); setError(r.error ?? ""); } })
      .catch(() => { if (vigente) setError("No pudimos consultar tu membresía."); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [sesion?.id, consultar]);
  const guardar = async (accion: "crear" | "camion" | "quitar_camion" | "plan" | "usuario" | "quitar_usuario", dato = "") => {
    if (accion === "camion" && !patenteValida(dato)) { setError("Ingresa una patente chilena válida."); return; }
    setCargando(true); setError("");
    try {
      const r = await gestionar({ data: { accion, valor: dato } });
      if (r.error) setError(r.error);
      else { setM(r.membresia); setValor(""); await refrescarSesion(); }
    } catch { setError("No pudimos guardar el cambio. Inténtalo nuevamente."); }
    finally { setCargando(false); }
  };
  if (!sesion) return <p className="text-muted-foreground">Inicia sesión desde el <Link to="/" className="font-semibold text-primary underline">tablero</Link> para gestionar tu membresía.</p>;
  return <div className="space-y-6">
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {!m ? <Button disabled={cargando} onClick={() => void guardar("crear")}>Crear mi organización</Button> : <>
      <div className="border-b border-border pb-5"><h2 className="text-xl font-bold text-foreground">{m.nombre}</h2><p className="mt-1 text-sm text-muted-foreground">{m.segmento === "transportista" ? "Transportista" : "Dador de Carga"} · {m.camiones} camiones registrados · {m.licencias} licencias activas</p><p className="mt-3 text-3xl font-bold text-foreground">{formatoCLP(m.total_fundador_clp)} <span className="text-sm font-normal">CLP / mes</span></p><p className="mt-1 text-sm text-muted-foreground">Tarifa normal después de promociones.{m.fundador ? " Incluye descuento Fundador del 20%." : ""}</p><p className="mt-2 text-sm font-semibold text-success">{m.segmento === "transportista" ? m.camiones === 1 ? "Gratis para siempre" : "Flotas gratis durante el lanzamiento" : `Primer mes gratis hasta ${new Date(m.prueba_hasta).toLocaleDateString("es-CL")}`}</p></div>
      {m.propietario && <>
        {m.segmento === "dador" && <Tabs value={m.plan} onValueChange={v => void guardar("plan", v)}><TabsList className="h-auto w-full"><TabsTrigger disabled={cargando} className="whitespace-normal" value="empresa_pyme">Empresa Pyme</TabsTrigger><TabsTrigger disabled={cargando} className="whitespace-normal" value="corporativo_premium">Corporativo Premium</TabsTrigger></TabsList></Tabs>}
        {(m.segmento === "transportista" || m.plan === "corporativo_premium") && <form className="space-y-3" onSubmit={e => { e.preventDefault(); void guardar(m.segmento === "transportista" ? "camion" : "usuario", valor); }}><Label htmlFor="unidad-membresia">{m.segmento === "transportista" ? "Patente del camión" : "Correo de una cuenta de Dador de Carga"}</Label><div className="flex flex-wrap gap-2"><Input className="min-w-0 flex-1" id="unidad-membresia" type={m.segmento === "transportista" ? "text" : "email"} required maxLength={m.segmento === "transportista" ? 10 : 254} value={valor} onChange={e => setValor(e.target.value)} /><Button disabled={cargando} type="submit"><Plus className="h-4 w-4" />Agregar</Button></div></form>}
        <ul className="divide-y divide-border">{m.camiones_detalle.map(c => <li className="flex items-center justify-between py-3" key={c.id}><span className="font-semibold text-foreground">{c.patente}</span><Button disabled={cargando} variant="ghost" size="icon" aria-label={`Quitar camión ${c.patente}`} title="Quitar camión" onClick={() => void guardar("quitar_camion", c.id)}><Trash2 className="h-4 w-4" /></Button></li>)}</ul>
        {m.segmento === "dador" && <ul className="divide-y divide-border">{m.miembros_detalle.filter(u => u.activo).map((u, i) => <li className="flex items-center justify-between py-3" key={u.id}><span className="text-foreground">{u.user_id === sesion.id ? "Tu cuenta · Administrador" : `Coordinador ${i + 1}`}</span>{u.user_id !== sesion.id && <Button disabled={cargando} size="icon" variant="ghost" aria-label={`Desactivar coordinador ${i + 1}`} title="Desactivar licencia" onClick={() => void guardar("quitar_usuario", u.id)}><Trash2 className="h-4 w-4" /></Button>}</li>)}</ul>}
      </>}
      <div className="border-t border-border pt-4"><p className="text-sm text-muted-foreground">Activación manual por WhatsApp y pago por transferencia. No hay cobros automáticos habilitados ni se realizará ningún cargo desde esta pantalla.</p><Button asChild variant="outline" className="mt-3"><a href={`https://wa.me/${WHATSAPP_PLANES}?text=${encodeURIComponent("Hola, quiero consultar la activación manual de mi membresía de TroncalTrack y el pago por transferencia.")}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" />Consultar activación</a></Button></div>
    </>}
  </div>;
}