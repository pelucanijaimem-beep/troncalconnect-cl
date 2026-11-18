import { describe, expect, it } from "vitest";
import { coincideAlerta, formatoPesos, textoPushCarga } from "./push-carga";

describe("aviso push de carga nueva", () => {
  it("arma título y cuerpo con ruta, carrocería, tarifa por km y total", () => {
    const t = textoPushCarga({
      id: "abc",
      origen: "Chillán",
      destino: "Santiago",
      carroceria: "Rampla Plana",
      valorKm: 1250,
      km: 510,
    });
    expect(t.titulo).toBe("Nueva carga disponible: Chillán → Santiago");
    expect(t.cuerpo).toBe("Rampla Plana · $1.250/km · Total $637.500");
  });

  it("al tocar el aviso abre el detalle de esa carga", () => {
    const t = textoPushCarga({ id: "c-42", origen: "A", destino: "B", carroceria: "Tolva", valorKm: 1, km: 1 });
    expect(t.url).toBe("/carga/c-42");
  });

  it("formatea pesos chilenos sin decimales", () => {
    expect(formatoPesos(999)).toBe("$999");
    expect(formatoPesos(1234567.6)).toBe("$1.234.568");
  });

  it("cruza origen, destino y carrocería con las alertas", () => {
    const carga = { origen: "Los Ángeles", destino: "Santiago", carroceria: "Rampla Plana" };
    expect(coincideAlerta({ origenes: ["los ángeles"], destinos: [], carrocerias: ["Rampla Plana"] }, carga)).toBe(true);
    expect(coincideAlerta({ origenes: [], destinos: ["Puerto Montt"], carrocerias: [] }, carga)).toBe(false);
    expect(coincideAlerta({ origenes: [], destinos: [], carrocerias: ["Tolva"] }, carga)).toBe(false);
  });

  it("no avisa a quien no configuró ninguna preferencia", () => {
    expect(
      coincideAlerta({ origenes: [], destinos: [], carrocerias: [] }, { origen: "A", destino: "B", carroceria: "C" }),
    ).toBe(false);
  });
});
