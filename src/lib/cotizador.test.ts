import { describe, expect, it } from "vitest";
import { cargasDelCorredor, estimarRuta } from "./cotizador";

describe("estimarRuta", () => {
  it("estima Chillán – Santiago cerca de los 400 km por carretera", () => {
    const r = estimarRuta("Chillán", "Santiago");
    expect(r).not.toBeNull();
    expect(r!.km).toBeGreaterThanOrEqual(350);
    expect(r!.km).toBeLessThanOrEqual(450);
  });
  it("calcula peajes troncales con el rango de camión de más de 2 ejes", () => {
    const r = estimarRuta("chillan", "santiago")!;
    expect(r.peajeMin).toBe(r.plazas * 10_400);
    expect(r.peajeMax).toBe(r.plazas * 12_200);
  });
  it("no estima ciudades desconocidas ni el mismo origen y destino", () => {
    expect(estimarRuta("Ciudad Inventada", "Santiago")).toBeNull();
    expect(estimarRuta("Santiago", "santiago")).toBeNull();
  });
});

describe("cargasDelCorredor", () => {
  it("cuenta solo cargas reales del corredor y de retorno desde el destino", () => {
    const cargas = [
      { origen: "Chillán", destino: "Santiago" },
      { origen: "Santiago", destino: "Chillán" },
      { origen: "Santiago", destino: "Temuco" },
      { origen: "Talca", destino: "Santiago" },
    ];
    expect(cargasDelCorredor(cargas, "Chillan", "Santiago")).toEqual({ ida: 1, retorno: 2 });
  });
});
