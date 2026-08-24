import { Mail, MessageCircle, Phone } from "lucide-react";

export function TopSupportBar() {
  return (
    <div className="hidden border-b border-border bg-surface md:block">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-1.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5 text-primary" /> Soporte: +56 9 4567 8901
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MessageCircle className="h-3.5 w-3.5 text-primary" /> WhatsApp 24/7
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5 text-primary" /> soporte@troncaltrack.cl
        </span>
        <span className="ml-auto font-semibold text-foreground">
          Atención en Chile, Argentina, Perú y Bolivia
        </span>
      </div>
    </div>
  );
}
