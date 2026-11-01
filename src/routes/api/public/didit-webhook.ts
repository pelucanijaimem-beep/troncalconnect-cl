import { createFileRoute } from "@tanstack/react-router";
import { Route as IdentityRoute } from "./identidad";

export const Route = createFileRoute("/api/public/didit-webhook")({
  server: IdentityRoute.options.server,
});