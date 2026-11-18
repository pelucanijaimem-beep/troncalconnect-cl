import { describe, expect, it } from "vitest";
import { ETIQUETAS, textoReputacion, validarCalificacion } from "./calificacion-viaje";

describe("calificación post-viaje", () => {
  it("muestra el promedio y la cantidad de viajes calificados", () => {
    expect(textoReputacion(4.9, 14)).toBe("★ 4.9 (14 viajes)");
    expect(textoReputacion(5, 1)).toBe("★ 5.0 (1 viaje)");
  });

  it("muestra Nuevo en TroncalTrack sin calificaciones", () => {
    expect(textoReputacion(0, 0)).toBe("Nuevo en TroncalTrack");
  });

  it("el transportista solo usa etiquetas para la empresa", () => {
    expect(ETIQUETAS.a_empresa.positivas).toEqual([
      "Carga rápida en planta",
      "Trato respetuoso",
      "Datos exactos",
      "Pago puntual",
    ]);
    expect(ETIQUETAS.a_empresa.negativas).toEqual([
      "Demora excesiva en carga/descarga",
      "Cambio de condiciones",
      "Atraso en pago",
    ]);
    const base = { tipo: "a_empresa" as const, estrellas: 4, comentario: "" };
    expect(validarCalificacion({ ...base, etiquetas: ["Pago puntual"] })).toBeNull();
    expect(validarCalificacion({ ...base, etiquetas: ["Carga impecable"] })).not.toBeNull();
  });

  it("la empresa solo usa etiquetas para el transportista", () => {
    expect(ETIQUETAS.a_camionero.positivas).toEqual([
      "Puntual en carga y descarga",
      "Carga impecable",
      "GPS activo todo el viaje",
      "Excelente comunicación",
    ]);
    expect(ETIQUETAS.a_camionero.negativas).toEqual([
      "Atraso en presentación",
      "Falta de EPP/documentos",
      "Poca comunicación",
    ]);
    const base = { tipo: "a_camionero" as const, estrellas: 5, comentario: "" };
    expect(validarCalificacion({ ...base, etiquetas: ["Poca comunicación"] })).toBeNull();
    expect(validarCalificacion({ ...base, etiquetas: ["Pago puntual"] })).not.toBeNull();
  });

  it("exige de 1 a 5 estrellas y comentario opcional de hasta 280 caracteres", () => {
    const base = { tipo: "a_empresa" as const, etiquetas: [] };
    expect(validarCalificacion({ ...base, estrellas: 0, comentario: "" })).not.toBeNull();
    expect(validarCalificacion({ ...base, estrellas: 6, comentario: "" })).not.toBeNull();
    expect(validarCalificacion({ ...base, estrellas: 1, comentario: "" })).toBeNull();
    expect(validarCalificacion({ ...base, estrellas: 3, comentario: "a".repeat(281) })).not.toBeNull();
  });
});
