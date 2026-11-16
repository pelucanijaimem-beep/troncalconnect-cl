import { BadgeCheck, CheckCircle2, Fingerprint, MapPin, Navigation, ShieldCheck, Truck } from "lucide-react";

const FICHA = [
  { icono: Fingerprint, texto: "Identidad biométrica verificada" },
  { icono: BadgeCheck, texto: "Cédula de identidad revisada" },
  { icono: CheckCircle2, texto: "Licencia profesional A3 / A4 / A5 al día" },
  { icono: Truck, texto: "Patente del camión registrada" },
];

export function SafetyProof() {
  return (
    <section className="border-b border-border bg-background" aria-labelledby="seguridad-real">
      <div className="mx-auto max-w-6xl px-4 py-12 lg:py-16">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Seguridad real</p>
        <h2 id="seguridad-real" className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Sabes quién llega a tu portón y dónde va tu carga
        </h2>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <article className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                <ShieldCheck className="h-5 w-5 text-primary" /> Conductor y camión verificados
              </h3>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">Ejemplo</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              TroncalCheck revisa los documentos y Didit confirma con biometría que el chofer es quien dice ser, antes
              de que abras el portón.
            </p>
            <div className="mt-4 rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-extrabold text-primary">JP</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">Juan Pérez · Transportista</p>
                  <p className="text-xs text-muted-foreground">Camión 3 ejes · Rampla Sider</p>
                </div>
                <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-bold text-success">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verificado
                </span>
              </div>
              <ul className="mt-4 space-y-2">
                {FICHA.map((f) => (
                  <li key={f.texto} className="flex items-center gap-2 text-sm text-foreground">
                    <f.icono className="h-4 w-4 shrink-0 text-success" /> {f.texto}
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                <Navigation className="h-5 w-5 text-primary" /> Trazabilidad y GPS en ruta
              </h3>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">Ejemplo</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Cada postulación incluye el link de rastreo GPS del camión y el chofer puede compartir su ubicación
              durante el viaje. Solo la empresa de esa carga la ve.
            </p>
            <div className="mt-4 rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>Chillán</span>
                <span>Santiago</span>
              </div>
              <div className="relative mt-2 h-2 rounded-full bg-muted" aria-hidden="true">
                <div className="absolute inset-y-0 left-0 w-[58%] rounded-full bg-primary" />
                <span className="absolute top-1/2 left-[58%] flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-card bg-primary shadow-card">
                  <Truck className="h-3 w-3 text-primary-foreground" />
                </span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Punto actual</dt>
                  <dd className="flex items-center gap-1 font-bold text-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> Ruta 5, km 250 (Talca)
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Estado del viaje</dt>
                  <dd className="font-bold text-success">En ruta · a tiempo</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Última señal</dt>
                  <dd className="font-bold text-foreground">Hace 1 min</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Llegada estimada</dt>
                  <dd className="font-bold text-foreground">16:40 h</dd>
                </div>
              </dl>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
