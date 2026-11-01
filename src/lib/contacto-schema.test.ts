import { describe, expect, it } from "vitest";
import { contactoSchema } from "./contacto-schema";

const valido = { tipo: "soporte", nombre: "Prueba", correo: "prueba@example.com", mensaje: "1234567890" };
describe("Validación de mensajes de contacto", () => {
  it("acepta soporte y sugerencia", () => {
    expect(contactoSchema.safeParse(valido).success).toBe(true);
    expect(contactoSchema.safeParse({ ...valido, tipo: "sugerencia" }).success).toBe(true);
    expect(contactoSchema.safeParse({ ...valido, tipo: "otro" }).success).toBe(false);
  });
  it("exige nombre", () => expect(contactoSchema.safeParse({ ...valido, nombre: " " }).success).toBe(false));
  it("exige correo válido", () => expect(contactoSchema.safeParse({ ...valido, correo: "incorrecto" }).success).toBe(false));
  it("exige al menos 10 caracteres de mensaje", () => {
    expect(contactoSchema.safeParse({ ...valido, mensaje: "123456789" }).success).toBe(false);
    expect(contactoSchema.safeParse(valido).success).toBe(true);
  });
});