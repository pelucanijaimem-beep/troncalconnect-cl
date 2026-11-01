export function identityStatusLabel(estado: string | null, coincide: boolean | null): string {
  if (coincide === false) return "El RUT de tu identidad no coincide con el registro. Estamos revisando tu verificación, te avisaremos pronto.";
  if (estado === "approved" && coincide === true) return "Identidad verificada con Didit";
  const labels: Record<string, string> = {
    not_started: "Identidad pendiente de iniciar",
    in_progress: "Verificación de identidad en curso",
    in_review: "Identidad en revisión",
    approved: "Identidad recibida, pendiente de revisión",
    declined: "Verificación de identidad rechazada",
    abandoned: "Verificación de identidad interrumpida",
    expired: "Sesión de identidad vencida",
    kyc_expired: "Verificación de identidad vencida",
    resubmitted: "Identidad reenviada a revisión",
    awaiting_user: "Verificación de identidad pendiente de completar",
  };
  return estado ? labels[estado] ?? "Identidad en revisión" : "Identidad pendiente de verificar";
}