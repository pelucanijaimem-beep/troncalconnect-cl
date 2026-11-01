import { defineConfig } from "vitest/config";

// Evita transformar las funciones del servidor en llamadas remotas en pruebas unitarias.
export default defineConfig({
  resolve: { alias: { "@": new URL("./src", import.meta.url).pathname } },
  test: { include: ["src/lib/auth.functions.test.ts", "src/lib/require-session.test.ts", "src/lib/contacto.functions.test.ts", "src/lib/rut.test.ts", "src/lib/password-recovery.test.ts", "src/lib/load-matching.test.ts"], restoreMocks: true, unstubEnvs: true },
});