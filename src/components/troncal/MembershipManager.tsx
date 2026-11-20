import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Plus, Trash2, MessageCircle, Satellite } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { consultarMembresia, gestionarMembresia, registrarGpsCamion, type Membresia } from "@/lib/membresia.functions";
import { AYUDA_GPS_CAMION, camionesSinGps, gpsValido, normalizarGps } from "@/lib/gps-camion";
import { calcularFlota, calcularDador, importePublicacionesCLP, formatoCLP, normalizarPatente, patenteValida, WHATSAPP_PLANES } from "@/lib/pricing";
import { refrescarSesion, useSesion } from "@/lib/use-session";



export function MembershipManager() {
  const sesion = useSesion();
  const consultar = useServerFn(consultarMembresia);
  const gestionar = useServerFn(gestionarMembresia);
  const [m, setM] = useState<Membresia | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [valor, setValor] = useState("");
  const [gpsNuevo, setGpsNuevo] = useState("");
  const registrarGps = useServerFn(registrarGpsCamion);
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
    if (accion === "camion" && gpsNuevo.trim() && !gpsValido(gpsNuevo)) { setError("Ingresa un ID o IMEI válido: solo letras y números, entre 4 y 40 caracteres."); return; }
    setCargando(true); setError("");
    try {
      const r = await gestionar({ data: { accion, valor: dato } });
      if (r.error) setError(r.error);
      else {
        let actual = r.membresia;
        if (accion === "camion" && gpsNuevo.trim() && actual) {
          const camion = actual.camiones_detalle.find(c => c.patente === normalizarPatente(dato));
          if (camion) {
            const g = await registrarGps({ data: { camion: camion.id, gps: gpsNuevo } });
            if (g.error) setError(`Camión agregado, pero no pudimos guardar su GPS: ${g.error}`);
            else actual = g.membresia;
          }
        }
        setM(actual); setValor(""); setGpsNuevo(""); await refrescarSesion();
      }
    } catch { setError("No pudimos guardar el cambio. Inténtalo nuevamente."); }
    finally { setCargando(false); }
  };
  const guardarGps = async (camion: string, gps: string) => {
    if (gps.trim() && !gpsValido(gps)) { setError("Ingresa un ID o IMEI válido: solo letras y números, entre 4 y 40 caracteres."); return false; }
    setCargando(true); setError("");
    try {
      const r = await registrarGps({ data: { camion, gps } });
      if (r.error) { setError(r.error); return false; }
      setM(r.membresia); return true;
    } catch { setError("No pudimos guardar el GPS del camión. Inténtalo nuevamente."); return false; }
    finally { setCargando(false); }
  };
  const tarifa = m ? (m.segmento === "transportista" ? calcularFlota(m.camiones)?.totalClp : calcularDador(m.plan, 0)?.totalClp) ?? 0 : 0;
  if (!sesion) return <p className="text-muted-foreground">Inicia sesión desde el <Link to="/" className="font-semibold text-primary underline">tablero</Link> para gestionar tu membresía.</p>;
  return <div className="space-y-6">
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {!m ? <Button disabled={cargando} onClick={() => void guardar("crear")}>Crear mi organización</Button> : <>
      <div className="border-b border-border pb-5"><h2 className="text-xl font-bold text-foreground">{m.nombre}</h2><p className="mt-1 text-sm text-muted-foreground">{m.segmento === "transportista" ? "Transportista" : "Dador de Carga"} · {m.camiones} camiones registrados · {m.licencias} usuarios registrados</p><p className="mt-3 text-3xl font-bold text-foreground">{formatoCLP(tarifa)} <span className="text-sm font-normal">CLP / mes</span></p><p className="mt-1 text-sm text-muted-foreground">Tarifa base después de promociones.</p><p className="mt-2 text-sm font-semibold text-success">{m.segmento === "transportista" && m.camiones === 1 ? "Gratis para siempre" : `Primer mes gratis desde tu registro, hasta el ${new Date(m.prueba_hasta).toLocaleDateString("es-CL")}`}</p></div>
      {m.consumo && <div className="border-b border-border pb-4"><p className="font-semibold">{m.consumo.publicadas} publicaciones este mes · {m.consumo.incluidas ?? "Ilimitadas"} incluidas</p>{m.consumo.excedentes > 0 && <p className="mt-2 text-sm">{m.consumo.excedentes} adicionales · {formatoCLP(importePublicacionesCLP(m.consumo.plan, m.consumo.importe_uf))} registrados para facturación manual. No se generan cobros automáticos.</p>}</div>}
      {m.propietario && <>
        {m.segmento === "dador" && <Tabs value={m.plan} onValueChange={v => void guardar("plan", v)}><TabsList className="h-auto w-full"><TabsTrigger disabled={cargando} className="whitespace-normal" value="generador_starter">Generador Starter</TabsTrigger><TabsTrigger disabled={cargando} className="whitespace-normal" value="generador_pro">Generador Pro</TabsTrigger></TabsList></Tabs>}
        {(m.segmento === "transportista" || m.plan !== "generador_starter") && <form className="space-y-3" onSubmit={e => { e.preventDefault(); void guardar(m.segmento === "transportista" ? "camion" : "usuario", valor); }}><Label htmlFor="unidad-membresia">{m.segmento === "transportista" ? "Patente del camión" : "Correo de una cuenta de Dador de Carga"}</Label><div className="flex flex-wrap gap-2"><Input className="min-w-0 flex-1" id="unidad-membresia" type={m.segmento === "transportista" ? "text" : "email"} required maxLength={m.segmento === "transportista" ? 10 : 254} value={valor} onChange={e => setValor(e.target.value)} />{m.segmento !== "transportista" && <Button disabled={cargando} type="submit"><Plus className="h-4 w-4" />Agregar</Button>}</div>{m.segmento === "transportista" && <><Label htmlFor="gps-membresia">ID o IMEI del rastreador GPS</Label><div className="flex flex-wrap gap-2"><Input className="min-w-0 flex-1" id="gps-membresia" inputMode="text" autoComplete="off" maxLength={60} placeholder="Ej: 358688051234567" aria-describedby="ayuda-gps-membresia" value={gpsNuevo} onChange={e => setGpsNuevo(e.target.value)} /><Button disabled={cargando} type="submit"><Plus className="h-4 w-4" />Agregar camión</Button></div><p id="ayuda-gps-membresia" className="text-xs text-muted-foreground">{AYUDA_GPS_CAMION}</p></>}</form>}
        {m.segmento === "transportista" && camionesSinGps(m.camiones_detalle).length > 0 && <aside role="status" className="flex items-start gap-3 rounded-lg border border-primary/40 bg-card p-4 text-sm"><Satellite aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><p className="text-foreground"><span className="font-semibold">{camionesSinGps(m.camiones_detalle).length === 1 ? "Un camión aún no tiene rastreador GPS registrado." : `${camionesSinGps(m.camiones_detalle).length} camiones aún no tienen rastreador GPS registrado.`}</span> Escribe el ID o IMEI de cada uno. Por ahora puedes seguir usando la plataforma con normalidad.</p></aside>}
        <ul className="divide-y divide-border">{m.camiones_detalle.map(c => <CamionFila key={c.id} camion={c} cargando={cargando} onQuitar={() => void guardar("quitar_camion", c.id)} onGuardarGps={gps => guardarGps(c.id, gps)} />)}</ul>
        {m.segmento === "dador" && <ul className="divide-y divide-border">{m.miembros_detalle.filter(u => u.activo).map((u, i) => <li className="flex items-center justify-between py-3" key={u.id}><span className="text-foreground">{u.user_id === sesion.id ? "Tu cuenta · Administrador" : `Coordinador ${i + 1}`}</span>{u.user_id !== sesion.id && <Button disabled={cargando} size="icon" variant="ghost" aria-label={`Desactivar coordinador ${i + 1}`} title="Desactivar usuario" onClick={() => void guardar("quitar_usuario", u.id)}><Trash2 className="h-4 w-4" /></Button>}</li>)}</ul>}
      </>}
      <div className="border-t border-border pt-4"><p className="text-sm text-muted-foreground">Activación manual por WhatsApp y pago por transferencia. No hay cobros automáticos habilitados ni se realizará ningún cargo desde esta pantalla.</p><Button asChild variant="outline" className="mt-3"><a href={`https://wa.me/${WHATSAPP_PLANES}?text=${encodeURIComponent("Hola, quiero consultar la activación manual de mi membresía de TroncalTrack y el pago por transferencia.")}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" />Consultar activación</a></Button></div>
    </>}
  </div>;
}

function CamionFila({ camion, cargando, onQuitar, onGuardarGps }: { camion: Membresia["camiones_detalle"][number]; cargando: boolean; onQuitar: () => void; onGuardarGps: (gps: string) => Promise<boolean> }) {
  const [gps, setGps] = useState(camion.gps_dispositivo_id ?? "");
  useEffect(() => { setGps(camion.gps_dispositivo_id ?? ""); }, [camion.gps_dispositivo_id]);
  const id = `gps-${camion.id}`;
  const cambiado = normalizarGps(gps) !== (camion.gps_dispositivo_id ?? "");
  return <li className="space-y-2 py-3">
    <div className="flex items-center justify-between gap-2"><span className="font-semibold text-foreground">{camion.patente}</span><Button disabled={cargando} variant="ghost" size="icon" aria-label={`Quitar camión ${camion.patente}`} title="Quitar camión" onClick={onQuitar}><Trash2 className="h-4 w-4" /></Button></div>
    <form className="space-y-1" onSubmit={e => { e.preventDefault(); void onGuardarGps(gps); }}>
      <Label htmlFor={id} className="text-xs">ID o IMEI del rastreador GPS</Label>
      <div className="flex flex-wrap gap-2"><Input className="min-w-0 flex-1" id={id} autoComplete="off" maxLength={60} placeholder="Sin registrar" value={gps} onChange={e => setGps(e.target.value)} /><Button disabled={cargando || !cambiado} type="submit" variant="outline">Guardar GPS</Button></div>
      {!camion.gps_dispositivo_id && <p className="text-xs font-semibold text-primary">Pendiente: registra el rastreador GPS de este camión.</p>}
    </form>
  </li>;
}
