import { useEffect, useState } from "react";
import { Mic, MicOff, PhoneOff, Play, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLiveVoice } from "@/hooks/use-live-voice";
import { supabase } from "@/integrations/supabase/client";
import type { Coordenadas } from "@/lib/load-search-location";
import { z } from "zod";

const resultadosSchema = z.object({
  cargas: z.array(z.object({ id: z.string().uuid() })).optional(),
  reportes: z
    .array(
      z.object({
        id: z.string(),
        tipo: z.string(),
        origen: z.string(),
        destino: z.string(),
        detalle: z.string(),
        created_at: z.string(),
      }),
    )
    .optional(),
});
type Reporte = NonNullable<z.infer<typeof resultadosSchema>["reportes"]>[number];
export function RouteVoiceAssistant({
  ids,
  ciudadBase,
  onCargas,
  open,
}: {
  ids: string[];
  ciudadBase: string;
  onCargas: (ids: string[]) => void;
  open: boolean;
}) {
  const [gps, setGps] = useState<Coordenadas | null>(null);
  const [ubicando, setUbicando] = useState(false);
  const [ubicacion, setUbicacion] = useState("");
  const [fragmentos, setFragmentos] = useState<Array<{ rol: string; texto: string }>>([]);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [buscando, setBuscando] = useState(false);
  const voice = useLiveVoice({
    getStartContext: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) throw new Error("Tu sesión venció. Vuelve a iniciar sesión.");
      return { token: data.session.access_token, ids, gps };
    },
    onEvent(event) {
      if (event.type === "app.delegation.pending") {
        setBuscando(true);
        setReportes([]);
        onCargas([]);
      }
      if (event.type === "app.route.results") {
        setBuscando(false);
        const result = resultadosSchema.safeParse(event["plan"]);
        if (result.success) {
          if (result.data.cargas) onCargas(result.data.cargas.map((c) => c.id));
          if (result.data.reportes) setReportes(result.data.reportes);
        }
      }
      if (event.type === "app.closed" || event.type === "app.error") setBuscando(false);
      if (
        (event.type === "session.input_transcript.delta" ||
          event.type === "session.output_transcript.delta") &&
        typeof event["delta"] === "string"
      ) {
        const rol = event.type === "session.input_transcript.delta" ? "Tú" : "Asistente";
        const texto = event["delta"];
        setFragmentos((prev) => {
          const ultimo = prev[prev.length - 1];
          return ultimo?.rol === rol
            ? [...prev.slice(0, -1), { rol, texto: ultimo.texto + texto }].slice(-12)
            : [...prev, { rol, texto }].slice(-12);
        });
      }
    },
  });
  const { stop } = voice;
  useEffect(() => {
    if (!open) stop();
  }, [open, stop]);
  const puedeIniciar = voice.status === "idle" || voice.status === "closed";
  async function consultarUbicacion() {
    setUbicando(true);
    const punto = await new Promise<Coordenadas | null>((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ latitud: p.coords.latitude, longitud: p.coords.longitude }),
        () => resolve(null),
        { timeout: 10000, maximumAge: 60000 },
      );
    });
    setGps(punto);
    setUbicacion(
      punto
        ? "Ubicación actual disponible · cercanía aproximada"
        : ciudadBase
          ? `Sin GPS · ciudad base: ${ciudadBase}`
          : "Sin ubicación · indica tu ciudad al asistente",
    );
    setUbicando(false);
  }
  const estados = {
    idle: "Voz disponible",
    connecting: "Conectando…",
    connected: "Conversación activa",
    stopping: "Finalizando…",
    closed: "Conversación finalizada",
  };
  return (
    <section className="space-y-3 border-y border-border py-4" aria-label="Asistente por voz">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-semibold">
          <Mic className="h-5 w-5 text-primary" /> Copiloto de ruta
        </h3>
        <p role="status" className="text-sm text-muted-foreground">
          {estados[voice.status]}
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        Cargas vigentes y reportes de camioneros. Sin vigilancia en tiempo real ni garantía de
        seguridad. Inicia la conversación con el vehículo detenido.
      </p>
      <audio
        ref={voice.audioRef}
        controls
        aria-label="Audio del asistente"
        className="h-10 w-full"
      />
      <div className="flex flex-wrap gap-2">
        {puedeIniciar ? (
          <Button
            type="button"
            disabled={ubicando}
            onClick={() => {
              setFragmentos([]);
              setReportes([]);
              voice.start();
            }}
          >
            <Mic className="h-4 w-4" /> Hablar con el asistente
          </Button>
        ) : (
          <Button
            type="button"
            variant="destructive"
            disabled={voice.status === "stopping"}
            onClick={voice.stop}
          >
            <PhoneOff className="h-4 w-4" /> Terminar
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          disabled={!puedeIniciar || ubicando}
          onClick={() => void consultarUbicacion()}
        >
          <MapPin className="h-4 w-4" /> {ubicando ? "Consultando ubicación…" : "Usar mi ubicación"}
        </Button>
        {!puedeIniciar && (
          <Button
            type="button"
            variant="outline"
            disabled={voice.status !== "connected"}
            aria-label={voice.muted ? "Activar micrófono" : "Silenciar micrófono"}
            title={voice.muted ? "Activar micrófono" : "Silenciar micrófono"}
            onClick={() => voice.setMuted(!voice.muted)}
          >
            {voice.muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        )}
        {voice.playbackBlocked && (
          <Button type="button" onClick={voice.resumePlayback}>
            <Play className="h-4 w-4" /> Reproducir voz
          </Button>
        )}
      </div>
      {(ubicacion || ciudadBase) && (
        <p className="text-xs text-muted-foreground">{ubicacion || `Ciudad base: ${ciudadBase}`}</p>
      )}
      {voice.error && (
        <p role="alert" className="break-words text-sm text-destructive">
          {voice.error}
        </p>
      )}
      {buscando && (
        <p role="status" className="text-sm text-muted-foreground">
          Consultando cargas y reportes…
        </p>
      )}
      {fragmentos.length > 0 && (
        <div className="max-h-48 space-y-2 overflow-y-auto" aria-live="polite">
          {fragmentos.map((f, i) => (
            <p key={i} className="break-words text-sm">
              <span className="font-semibold">{f.rol}: </span>
              {f.texto}
            </p>
          ))}
        </div>
      )}
      {reportes.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Reportes de la comunidad · no verificados</h4>
          {reportes.map((r) => (
            <article key={r.id} className="border-l-2 border-primary pl-3 text-sm">
              <p className="font-medium">
                {r.tipo} · {r.origen} → {r.destino}
              </p>
              <p className="break-words">{r.detalle}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleString("es-CL", { timeZone: "America/Santiago" })}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
