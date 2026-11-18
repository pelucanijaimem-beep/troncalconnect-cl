/**
 * Envío de avisos push estándar (RFC 8030/8291/8292) solo con Web Crypto:
 * cifrado aes128gcm del contenido y firma VAPID ES256.
 */
export type SuscripcionPush = { endpoint: string; p256dh: string; auth: string };

const enc = new TextEncoder();

const aB64url = (bytes: Uint8Array) => {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const deB64url = (texto: string) => {
  const relleno = "=".repeat((4 - (texto.length % 4)) % 4);
  const bin = atob((texto + relleno).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
};

const unir = (...partes: Uint8Array[]) => {
  const out = new Uint8Array(new ArrayBuffer(partes.reduce((n, p) => n + p.length, 0)));
  let i = 0;
  for (const p of partes) {
    out.set(p, i);
    i += p.length;
  }
  return out;
};

async function hmac(clave: Uint8Array, datos: Uint8Array) {
  const k = await crypto.subtle.importKey("raw", clave as BufferSource, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", k, datos as BufferSource));
}

/** Cifra el contenido para la suscripción (aes128gcm, un solo registro). */
export async function cifrarAes128gcm(
  contenido: Uint8Array,
  p256dh: string,
  authSecret: string,
  salt: Uint8Array = crypto.getRandomValues(new Uint8Array(16)),
): Promise<Uint8Array> {
  const uaPublica = deB64url(p256dh);
  const auth = deB64url(authSecret);
  if (uaPublica.length !== 65 || auth.length < 16) throw new Error("Suscripción no válida");

  const efimera = (await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, [
    "deriveBits",
  ])) as CryptoKeyPair;
  const asPublica = new Uint8Array(await crypto.subtle.exportKey("raw", efimera.publicKey));
  const uaClave = await crypto.subtle.importKey(
    "raw",
    uaPublica as BufferSource,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    [],
  );
  const secreto = new Uint8Array(
    await crypto.subtle.deriveBits({ name: "ECDH", public: uaClave }, efimera.privateKey, 256),
  );

  const prkClave = await hmac(auth, secreto);
  const ikm = await hmac(
    prkClave,
    unir(enc.encode("WebPush: info\0"), uaPublica, asPublica, new Uint8Array([1])),
  );
  const prk = await hmac(salt, ikm);
  const cek = (await hmac(prk, unir(enc.encode("Content-Encoding: aes128gcm\0"), new Uint8Array([1])))).slice(0, 16);
  const nonce = (await hmac(prk, unir(enc.encode("Content-Encoding: nonce\0"), new Uint8Array([1])))).slice(0, 12);

  const claveAes = await crypto.subtle.importKey("raw", cek as BufferSource, "AES-GCM", false, ["encrypt"]);
  const cifrado = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: nonce as BufferSource },
      claveAes,
      unir(contenido, new Uint8Array([2])) as BufferSource,
    ),
  );

  const rs = new Uint8Array([0, 0, 0x10, 0]); // 4096
  return unir(salt, rs, new Uint8Array([asPublica.length]), asPublica, cifrado);
}

/** Firma VAPID (JWT ES256) para el servicio de avisos del endpoint. */
export async function firmaVapid(endpoint: string, privadaJwk: JsonWebKey, publica: string, contacto: string) {
  const aud = new URL(endpoint).origin;
  const exp = Math.floor(Date.now() / 1000) + 12 * 60 * 60;
  const cabecera = aB64url(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const cuerpo = aB64url(enc.encode(JSON.stringify({ aud, exp, sub: contacto })));
  const clave = await crypto.subtle.importKey("jwk", privadaJwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const firma = new Uint8Array(
    await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, clave, enc.encode(`${cabecera}.${cuerpo}`)),
  );
  return `vapid t=${cabecera}.${cuerpo}.${aB64url(firma)}, k=${publica}`;
}

/** Arma la petición HTTP del aviso (sin enviarla). */
export async function peticionPush(opciones: {
  suscripcion: SuscripcionPush;
  contenido: unknown;
  privadaJwk: JsonWebKey;
  publica: string;
  contacto: string;
  ttl: number;
  urgencia?: "very-low" | "low" | "normal" | "high";
}) {
  const { suscripcion } = opciones;
  if (!/^https:\/\//.test(suscripcion.endpoint)) throw new Error("Endpoint no válido");
  const cuerpo = await cifrarAes128gcm(
    enc.encode(JSON.stringify(opciones.contenido)),
    suscripcion.p256dh,
    suscripcion.auth,
  );
  return {
    endpoint: suscripcion.endpoint,
    body: cuerpo,
    headers: {
      Authorization: await firmaVapid(suscripcion.endpoint, opciones.privadaJwk, opciones.publica, opciones.contacto),
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
      TTL: String(opciones.ttl),
      Urgency: opciones.urgencia ?? "normal",
    },
  };
}
