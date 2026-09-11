import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  marcarLeida,
  marcarTodasLeidas,
  useNotificaciones,
} from "@/lib/use-notificaciones";

export function NotificationsBell({ userId }: { userId: string }) {
  const { notificaciones, sinLeer } = useNotificaciones(userId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="relative" aria-label="Ver notificaciones">
          <Bell className="h-4 w-4" />
          <span className="hidden sm:inline">Avisos</span>
          {sinLeer > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
              {sinLeer}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <p className="text-sm font-bold text-foreground">Notificaciones</p>
          {sinLeer > 0 && (
            <button
              onClick={() => void marcarTodasLeidas(userId)}
              className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Marcar todas
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notificaciones.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Aún no tienes avisos.
            </p>
          )}
          {notificaciones.map((n) => (
            <button
              key={n.id}
              onClick={() => void marcarLeida(n.id)}
              className={`block w-full cursor-pointer border-b border-border px-3 py-2 text-left last:border-b-0 hover:bg-surface ${
                n.leida ? "opacity-70" : ""
              }`}
            >
              <p className="text-sm font-semibold text-foreground">
                {!n.leida && <span className="mr-1 text-primary">•</span>}
                {n.titulo}
              </p>
              <p className="text-xs text-muted-foreground">{n.mensaje}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {new Date(n.fecha).toLocaleString("es-CL")}
              </p>
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
