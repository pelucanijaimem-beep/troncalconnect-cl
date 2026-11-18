import { supabase } from "@/integrations/supabase/client";
import { clavePublicaPush } from "./push.functions";

/** Resultado de intentar activar los avisos en este teléfono o navegador. */
export type ResultadoPush =
  | "activado"
  | "no-soportado"
  | "abrir-pestana"
  | "ios-instalar"
  | "denegado"
  | "no-configurado"
  | "error";

const RUTA_SW = "/push-sw.js";

const esIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const esInstalada = () =>
  window.matchMedia?.("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

const soporta = () =>
  "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

function claveABytes(base64url: string): Uint8Array<ArrayBuffer> {
  const relleno = "=".repeat((4 - (base64url.length % 4)) % 4);
  const bin = atob((base64url + relleno).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

const mismaClave = (a: ArrayBuffer | null | undefined, b: Uint8Array) => {
  if (!a) return false;
  const x = new Uint8Array(a);
  return x.length === b.length && x.every((v, i) => v === b[i]);
};

/** true si este dispositivo ya tiene los avisos activos (solo navegador). */
export async function avisosActivos(): Promise<boolean> {
  if (!soporta() || Notification.permission !== "granted") return false;
  const reg = await navigator.serviceWorker.getRegistration(RUTA_SW);
  return Boolean(await reg?.pushManager.getSubscription());
}

/** Pide permiso, suscribe el dispositivo y lo asocia a la cuenta. Llamar desde un clic. */
export async function activarAvisos(): Promise<ResultadoPush> {
  if (!soporta()) return esIOS() && !esInstalada() ? "ios-instalar" : "no-soportado";
  if (window.top !== window.self) return "abrir-pestana";
  if (Notification.permission === "denied") return "denegado";

  const permiso =
    Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  if (permiso !== "granted") return "denegado";

  try {
    const { clave } = await clavePublicaPush();
    if (!clave) return "no-configurado";
    const bytes = claveABytes(clave);

    const reg = await navigator.serviceWorker.register(RUTA_SW, { scope: "/" });
    await navigator.serviceWorker.ready;

    let sub = await reg.pushManager.getSubscription();
    if (sub && !mismaClave(sub.options.applicationServerKey, bytes)) {
      await sub.unsubscribe();
      sub = null;
    }
    sub ??= await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: bytes });

    const json = sub.toJSON();
    const { error } = await supabase.rpc("registrar_suscripcion_push", {
      p_endpoint: json.endpoint ?? "",
      p_p256dh: json.keys?.["p256dh"] ?? "",
      p_auth: json.keys?.["auth"] ?? "",
      p_user_agent: navigator.userAgent,
    });
    if (error) {
      console.error("[push] etapa=registro categoria=base");
      return "error";
    }
    return "activado";
  } catch {
    console.error("[push] etapa=suscripcion categoria=navegador");
    return "error";
  }
}
