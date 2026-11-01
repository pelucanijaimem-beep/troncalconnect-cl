import { describe, expect, it } from "vitest";
import { cargaElegible, validarCoincidencias } from "./load-matching";
const carga = { id: "c1", user_id: "empresa", solo_verificados: false, tipo_carga: "general", fecha: "2026-11-02" };
describe("compatibilidad de cargas", () => {
  it("acepta carga vigente", () => expect(cargaElegible(carga, "camionero", false, false, "2026-11-01")).toBe(true));
  it("excluye fecha pasada", () => expect(cargaElegible({ ...carga, fecha: "2026-10-31" }, "camionero", true, true, "2026-11-01")).toBe(false));
  it("respeta requisitos TroncalCheck", () => expect(cargaElegible({ ...carga, solo_verificados: true }, "camionero", false, true, "2026-11-01")).toBe(false));
  it("no revela peligrosas sin habilitación", () => expect(cargaElegible({ ...carga, tipo_carga: "peligrosa" }, "camionero", true, false, "2026-11-01")).toBe(false));
  it("excluye IDs inventados o duplicados", () => expect(validarCoincidencias([{ id: "c1", motivo: "Ruta" }, { id: "ajena", motivo: "Inventada" }, { id: "c1", motivo: "Duplicada" }], ["c1"])).toEqual([{ id: "c1", motivo: "Ruta" }]));
});