import { describe, expect, it } from "vitest";
import { tipoDesdeRuta, veredictoDesde } from "./prerevision-documentos";

const HOY = "2026-11-20";
const base = { coincide_tipo: true, legible: true, fecha_vigencia: "2027-05-01", motivo: null };

describe("pre-revisión de documentos con IA", () => {
  it("marca «Parece correcto» cuando coincide, es legible y está vigente", () => {
    expect(veredictoDesde(base, "licencia", HOY)).toEqual({ veredicto: "correcto", motivo: "" });
  });
  it("pide revisar si el documento no coincide con lo declarado", () => {
    const v = veredictoDesde({ ...base, coincide_tipo: false }, "licencia", HOY);
    expect(v.veredicto).toBe("revisar");
    expect(v.motivo).toContain("no parece ser licencia de conducir");
  });
  it("pide revisar si no se ve legible", () => {
    expect(veredictoDesde({ ...base, legible: false }, "soat", HOY).motivo).toContain("no se ve legible");
  });
  it("compara la vigencia contra hoy, no contra lo que diga el modelo", () => {
    expect(veredictoDesde({ ...base, fecha_vigencia: "2026-11-19" }, "revision_tecnica", HOY).motivo).toContain(
      "vigencia vencida el 19-11-2026",
    );
    expect(veredictoDesde({ ...base, fecha_vigencia: "2026-11-20" }, "revision_tecnica", HOY).veredicto).toBe("correcto");
  });
  it("pide revisar si no hay fecha de vigencia legible", () => {
    expect(veredictoDesde({ ...base, fecha_vigencia: null }, "permiso_circulacion", HOY).veredicto).toBe("revisar");
  });
  it("solo lee imágenes y PDF", () => {
    expect(tipoDesdeRuta("u/licencia-1.PDF")).toBe("application/pdf");
    expect(tipoDesdeRuta("u/licencia-1.heic")).toBeNull();
  });
});
