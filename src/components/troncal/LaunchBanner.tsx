import { MapPin } from "lucide-react";

export function LaunchBanner() {
  return (
    <div className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <p className="flex items-center gap-2 text-sm text-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          <span>
            <strong>Cobertura regional:</strong> Chile, Argentina, Perú y Bolivia.
          </span>
        </p>
      </div>
    </div>
  );
}
