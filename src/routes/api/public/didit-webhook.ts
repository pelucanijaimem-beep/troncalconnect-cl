import { createFileRoute } from "@tanstack/react-router";
import { identityHandlers } from "./identidad";

export const Route = createFileRoute("/api/public/didit-webhook")({
  server: { handlers: identityHandlers },
});