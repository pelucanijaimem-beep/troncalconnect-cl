export function esEnlaceRecuperacion(hash: string, search: string) {
  return new URLSearchParams(hash.replace(/^#/, "")).get("type") === "recovery" ||
    new URLSearchParams(search.replace(/^\?/, "")).get("type") === "recovery";
}

export function validarNuevaPassword(password: string, confirmacion: string) {
  if (password.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
  if (password !== confirmacion) return "Las contraseñas no coinciden.";
  return null;
}