import { Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LaunchBanner({ onDonar }: { onDonar: () => void }) {
  return (
    <div className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 px-4 py-3 sm:flex-row sm:items-center">
        <p className="flex items-center gap-2 text-sm text-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          <span>
            <strong>Cobertura regional:</strong> Chile, Argentina, Perú y Bolivia.
          </span>
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDonar}
          className="sm:ml-auto text-muted-foreground"
        >
          <Heart className="h-4 w-4" /> Apoyar el proyecto / Donaciones
        </Button>
      </div>
    </div>
  );
}
