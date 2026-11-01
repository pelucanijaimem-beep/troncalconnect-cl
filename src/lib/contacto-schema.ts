import { z } from "zod";

export const contactoSchema = z.object({
  tipo: z.enum(["soporte", "sugerencia"]),
  nombre: z.string().trim().min(1, "Ingresa tu nombre").max(100, "El nombre admite hasta 100 caracteres"),
  correo: z.string().trim().email("Ingresa un correo válido").max(255, "El correo es demasiado largo"),
  mensaje: z.string().trim().min(10, "Escribe un mensaje de al menos 10 caracteres").max(5000, "El mensaje admite hasta 5.000 caracteres"),
});
export type TipoContacto = z.infer<typeof contactoSchema>["tipo"];