import { p256 } from "@noble/curves/nist.js";

const b64url = (bytes: Uint8Array) => {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

export type ClavesVapid = { publica: string; privadaJwk: JsonWebKey };

/**
 * Claves de firma de los avisos push, derivadas de la semilla secreta del
 * servidor. La clave pública se entrega al navegador; la privada nunca sale de acá.
 */
export async function clavesVapid(semilla: string): Promise<ClavesVapid> {
  if (!semilla || semilla.length < 32) throw new Error("Falta la semilla de avisos");
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`troncaltrack-avisos:${semilla}`),
  );
  const d = new Uint8Array(digest);
  if (!p256.utils.isValidSecretKey(d)) throw new Error("Semilla de avisos no válida");
  const pub = p256.getPublicKey(d, false);
  return {
    publica: b64url(pub),
    privadaJwk: {
      kty: "EC",
      crv: "P-256",
      d: b64url(d),
      x: b64url(pub.slice(1, 33)),
      y: b64url(pub.slice(33, 65)),
    },
  };
}
