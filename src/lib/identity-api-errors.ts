/** Nunca conservar el cuerpo de error: puede incluir credenciales o datos personales. */
export function identityApiFailure(status: number) {
  if (status === 401) return { categoria: "credencial_rechazada", error: "Didit rechazó la autorización. Contacta al equipo de soporte." };
  if (status === 403) return { categoria: "acceso_rechazado", error: "Didit no permite iniciar esta verificación. Contacta al equipo de soporte." };
  if (status === 400 || status === 422) return { categoria: "solicitud_rechazada", error: "Didit rechazó la configuración de la verificación. Contacta al equipo de soporte." };
  if (status === 404) return { categoria: "flujo_no_disponible", error: "El flujo de verificación no está disponible. Contacta al equipo de soporte." };
  if (status === 429) return { categoria: "limite_solicitudes", error: "Didit recibió demasiadas solicitudes. Espera un momento e inténtalo nuevamente." };
  return { categoria: "error_proveedor", error: "No pudimos iniciar la verificación. Inténtalo nuevamente." };
}