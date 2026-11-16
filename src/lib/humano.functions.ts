import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { comprobarTokenHumano } from "./humano";

export const verificarHumano = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ token: z.string().max(2000) }).parse(input))
  .handler(async ({ data }) => comprobarTokenHumano(process.env["TURNSTILE_SECRET_KEY"], data.token));
