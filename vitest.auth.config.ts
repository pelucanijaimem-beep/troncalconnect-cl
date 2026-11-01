import { defineConfig } from "vitest/config";

// Evita transformar las funciones del servidor en llamadas remotas en pruebas unitarias.
export default defineConfig({
  resolve: { alias: { "@": new URL("./src", import.meta.url).pathname } },
  test: { include: ["src/lib/auth.functions.test.ts", "src/lib/rut.test.ts"], restoreMocks: true, unstubEnvs: true },
});