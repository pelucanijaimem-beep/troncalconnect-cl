import { coincideAlerta, textoPushCarga } from "./push-carga";
import { clavesVapid } from "./vapid.server";
import { peticionPush } from "./web-push.server";

const CONTACTO = "https://troncaltrack.com";
const VIGENCIA_COLA_MS = 60 * 60 * 1000;
const LOTE = 20;

/**
 * Envía los avisos de una carga recién publicada. Solo procede si el par
 * carga + token existe en la cola privada, está vigente y no fue usado.
 */
export async function procesarPushNuevaCarga(
  cargaId: string,
  token: string,
): Promise<{ aceptado: boolean; enviados: number }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: reclamada, error: errorCola } = await supabaseAdmin
    .from("cola_push_cargas")
    .update({ procesada_at: new Date().toISOString() })
    .eq("carga_id", cargaId)
    .eq("token", token)
    .is("procesada_at", null)
    .gt("created_at", new Date(Date.now() - VIGENCIA_COLA_MS).toISOString())
    .select("carga_id");
  if (errorCola) {
    console.error("[push] etapa=cola categoria=lectura");
    return { aceptado: false, enviados: 0 };
  }
  if (!reclamada?.length) return { aceptado: false, enviados: 0 };

  const { data: carga } = await supabaseAdmin
    .from("cargas")
    .select("id, user_id, origen, destino, tipo_camion, valor_km, km, visibilidad, estado, solo_verificados")
    .eq("id", cargaId)
    .maybeSingle();
  if (!carga || carga.visibilidad !== "publica" || carga.estado !== "activa") {
    return { aceptado: true, enviados: 0 };
  }

  const { data: prefs } = await supabaseAdmin
    .from("preferencias_alertas")
    .select("user_id, origenes, destinos, carrocerias")
    .eq("activo", true);
  const candidatos = (prefs ?? [])
    .filter((p) => p.user_id !== carga.user_id)
    .filter((p) =>
      coincideAlerta(
        { origenes: p.origenes ?? [], destinos: p.destinos ?? [], carrocerias: p.carrocerias ?? [] },
        { origen: carga.origen, destino: carga.destino, carroceria: carga.tipo_camion },
      ),
    )
    .map((p) => p.user_id);
  if (candidatos.length === 0) return { aceptado: true, enviados: 0 };

  const { data: perfiles } = await supabaseAdmin
    .from("perfiles")
    .select("id, bloqueado, verificado")
    .in("id", candidatos);
  const habilitados = (perfiles ?? [])
    .filter((p) => !p.bloqueado && (!carga.solo_verificados || p.verificado))
    .map((p) => p.id);
  if (habilitados.length === 0) return { aceptado: true, enviados: 0 };

  const { data: suscripciones } = await supabaseAdmin
    .from("suscripciones_push")
    .select("id, endpoint, p256dh, auth")
    .in("user_id", habilitados);
  if (!suscripciones?.length) return { aceptado: true, enviados: 0 };

  let claves;
  try {
    claves = await clavesVapid(process.env["VAPID_SEMILLA"] ?? "");
  } catch {
    console.error("[push] etapa=claves categoria=configuracion");
    return { aceptado: true, enviados: 0 };
  }

  const aviso = textoPushCarga({
    id: carga.id,
    origen: carga.origen,
    destino: carga.destino,
    carroceria: carga.tipo_camion,
    valorKm: Number(carga.valor_km),
    km: Number(carga.km),
  });

  let enviados = 0;
  const vencidas: string[] = [];
  for (let i = 0; i < suscripciones.length; i += LOTE) {
    const lote = suscripciones.slice(i, i + LOTE);
    const resultados = await Promise.allSettled(
      lote.map(async (s) => {
        const req = await peticionPush({
          suscripcion: { endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth },
          contenido: aviso,
          privadaJwk: claves.privadaJwk,
          publica: claves.publica,
          contacto: CONTACTO,
          ttl: 6 * 60 * 60,
          urgencia: "high",
        });
        const res = await fetch(req.endpoint, {
          method: "POST",
          headers: req.headers,
          body: req.body as BodyInit,
        });
        return { id: s.id, status: res.status };
      }),
    );
    for (const r of resultados) {
      if (r.status !== "fulfilled") {
        console.error("[push] etapa=envio categoria=red");
        continue;
      }
      if (r.value.status >= 200 && r.value.status < 300) enviados += 1;
      else if (r.value.status === 404 || r.value.status === 410) vencidas.push(r.value.id);
      else console.error(`[push] etapa=envio status=${r.value.status}`);
    }
  }

  if (vencidas.length) await supabaseAdmin.from("suscripciones_push").delete().in("id", vencidas);
  await supabaseAdmin.from("cola_push_cargas").update({ enviados }).eq("carga_id", carga.id);
  return { aceptado: true, enviados };
}
