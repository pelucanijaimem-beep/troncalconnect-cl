// Lógica compartida de la verificación anti-robots (sin dependencias de servidor).
export type ResultadoHumano = { ok: true } | { ok: false; error: string };

const URL_VERIFICACION = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function comprobarTokenHumano(
  secret: string | undefined,
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ResultadoHumano> {
  // Sin llave secreta configurada todavía: no bloquea el formulario.
  if (!secret) return { ok: true };
  if (!token) return { ok: false, error: "Confirma que no eres un robot." };
  try {
    const respuesta = await fetchImpl(URL_VERIFICACION, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(8000),
    });
    const resultado = (await respuesta.json()) as { success?: unknown } | null;
    if (resultado?.success === true) return { ok: true };
    return { ok: false, error: "No pudimos confirmar que no eres un robot. Inténtalo nuevamente." };
  } catch {
    return { ok: false, error: "No pudimos verificar el formulario. Inténtalo nuevamente." };
  }
}
