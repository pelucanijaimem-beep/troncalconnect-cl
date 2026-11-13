export const DEMO_PIN = "8492";
export const DEMO_LINK_TTL_MS = 15 * 60 * 1000;

export function validarPinDemostracion(pin: string, etapa: "origen" | "destino", origenValidado: boolean) {
  if (!/^\d{4}$/.test(pin)) return "Ingresa un PIN de 4 dígitos.";
  if (etapa === "destino" && !origenValidado) return "Primero valida el retiro en origen.";
  if (pin !== DEMO_PIN) return "El PIN no coincide. Revisa los 4 dígitos.";
  return null;
}

export function enlaceDemoVigente(expiresAt: number, consumido: boolean, now: number) {
  return Number.isFinite(expiresAt) && expiresAt > now && !consumido;
}