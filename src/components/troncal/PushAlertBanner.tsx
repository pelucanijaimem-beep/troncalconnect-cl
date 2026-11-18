import { useEffect, useState } from "react";
import { BellRing, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { activarAvisos, avisosActivos, type ResultadoPush } from "@/lib/push-cliente";

const CLAVE_OCULTO = "tt-avisos-telefono-oculto";

const MENSAJES: Record<Exclude<ResultadoPush, "activado">, { titulo: string; detalle: string }> = {
  "no-soportado": {
    titulo: "Este navegador no permite avisos",
    detalle: "Abre TroncalTrack en Chrome (Android) o en Safari actualizado (iPhone).",
  },
  "abrir-pestana": {
    titulo: "Abre TroncalTrack en una pestaña propia",
    detalle: "Los avisos se activan desde la página publicada o desde la app instalada en tu teléfono.",
  },
  "ios-instalar": {
    titulo: "Primero agrega TroncalTrack a tu inicio",
    detalle: "En Safari toca Compartir → «Agregar a pantalla de inicio», abre la app desde ese ícono y vuelve a activar.",
  },
  denegado: {
    titulo: "Los avisos están bloqueados",
    detalle: "Permite las notificaciones de TroncalTrack en los ajustes del navegador y vuelve a intentarlo.",
  },
  "no-configurado": {
    titulo: "Los avisos aún no están disponibles",
    detalle: "Inténtalo de nuevo en unos minutos.",
  },
  error: {
    titulo: "No pudimos activar los avisos",
    detalle: "Revisa tu conexión e inténtalo de nuevo.",
  },
};

/** Banner móvil del transportista para recibir avisos de cargas compatibles en el teléfono. */
export function PushAlertBanner({
  tieneAlertas,
  onConfigurarAlertas,
}: {
  tieneAlertas: boolean;
  onConfigurarAlertas: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [activando, setActivando] = useState(false);

  useEffect(() => {
    let vivo = true;
    if (localStorage.getItem(CLAVE_OCULTO) === "1") return;
    void avisosActivos()
      .catch(() => false)
      .then((activos) => {
        if (vivo) setVisible(!activos);
      });
    return () => {
      vivo = false;
    };
  }, []);

  if (!visible) return null;

  const ocultar = () => {
    localStorage.setItem(CLAVE_OCULTO, "1");
    setVisible(false);
  };

  const activar = async () => {
    setActivando(true);
    const resultado = await activarAvisos();
    setActivando(false);
    if (resultado === "activado") {
      setVisible(false);
      toast.success("Avisos activados en este teléfono", {
        description: tieneAlertas
          ? "Te avisaremos al instante cuando se publique una carga que calce con tus alertas."
          : "Ahora elige tus rutas y carrocerías en «Mis alertas de coincidencia».",
        ...(tieneAlertas ? {} : { action: { label: "Configurar", onClick: onConfigurarAlertas } }),
      });
      return;
    }
    const m = MENSAJES[resultado];
    toast.error(m.titulo, { description: m.detalle });
  };

  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-primary/30 bg-card p-3 shadow-card sm:hidden">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <BellRing className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">
          Activa alertas en tu teléfono para enterarte al instante de cargas de retorno en Ruta 5
        </p>
        <Button size="sm" className="mt-2" disabled={activando} onClick={() => void activar()}>
          {activando ? "Activando…" : "Activar Notificaciones"}
        </Button>
      </div>
      <button
        type="button"
        aria-label="Ocultar aviso"
        onClick={ocultar}
        className="rounded-md p-1 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
