import { createServerFn } from "@tanstack/react-start";

/** Clave pública de los avisos push (no es secreta: el navegador la necesita para suscribirse). */
export const clavePublicaPush = createServerFn({ method: "GET" }).handler(async () => {
  const { clavesVapid } = await import("./vapid.server");
  const semilla = process.env["VAPID_SEMILLA"] ?? "";
  try {
    const { publica } = await clavesVapid(semilla);
    return { clave: publica };
  } catch {
    console.error("[push] etapa=clave categoria=configuracion");
    return { clave: null };
  }
});
