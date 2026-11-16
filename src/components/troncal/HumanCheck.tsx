import { useEffect, useRef } from "react";

const SITE_KEY = import.meta.env["VITE_TURNSTILE_SITE_KEY"] as string | undefined;

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
    };
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

/**
 * Casilla de verificación humana. Si todavía no hay llave pública configurada,
 * no se muestra ni bloquea el formulario: entrega un token vacío de inmediato.
 */
export function HumanCheck({ onToken }: { onToken: (token: string) => void }) {
  const contenedor = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    onToken("");
    if (!SITE_KEY) return;
    let activo = true;
    const cargar = () => {
      if (!activo || !contenedor.current || !window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(contenedor.current, {
        sitekey: SITE_KEY,
        language: "es",
        callback: (token: string) => onToken(token),
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
      });
    };
    if (window.turnstile) {
      cargar();
    } else {
      let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
      if (!script) {
        script = document.createElement("script");
        script.src = SCRIPT_SRC;
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", cargar);
    }
    return () => {
      activo = false;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [onToken]);

  if (!SITE_KEY) return null;
  return <div ref={contenedor} className="flex min-h-[65px] justify-center" />;
}
