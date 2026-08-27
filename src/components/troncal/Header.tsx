import { useState } from "react";
import { Truck, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { RoleSwitcher, type Rol } from "./RoleSwitcher";
import { CountrySelector } from "./CountrySelector";
import type { PaisCodigo } from "@/lib/troncal-data";
import type { Sesion } from "@/lib/use-session";

type Props = {
  sesion: Sesion | null;
  onSalir: () => void;
  rol: Rol;
  pais: PaisCodigo;
  onPaisChange: (p: PaisCodigo) => void;
  onRolChange: (r: Rol) => void;
  onAuth: (modo: "login" | "registro") => void;
  onPublicarCamion: () => void;
  onPublicarCarga: () => void;
};

function scrollA(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Header({
  sesion,
  onSalir,
  rol,
  pais,
  onPaisChange,
  onRolChange,
  onAuth,
  onPublicarCamion,
  onPublicarCarga,
}: Props) {
  const [paisOpen, setPaisOpen] = useState(false);
  const [paisOpenMovil, setPaisOpenMovil] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const items = (cerrarMenu: boolean, abrirPaises: () => void) => [
    { label: "Cargas", onClick: () => scrollA("cargas") },
    { label: "Publicar Camión", onClick: onPublicarCamion },
    { label: "Publicar Cargas", onClick: onPublicarCarga },
    { label: "Países", onClick: abrirPaises },
    { label: "Recursos", onClick: () => scrollA("planes") },
    { label: "Soporte", onClick: () => scrollA("soporte") },
  ].map((n) => ({
    ...n,
    onClick: () => {
      if (cerrarMenu) setMenuAbierto(false);
      n.onClick();
    },
  }));

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <a href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Truck className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-foreground">
            Troncal<span className="text-primary">Track</span>
            <span className="align-super text-[10px] text-muted-foreground">™</span>
          </span>
        </a>

        <nav className="hidden items-center gap-5 lg:flex">
          {items(false, () => setPaisOpen(true)).map((n) => (
            <button
              key={n.label}
              type="button"
              onClick={n.onClick}
              className="cursor-pointer text-sm font-semibold text-foreground transition-colors hover:text-primary"
            >
              {n.label}
            </button>
          ))}
          <Link
            to="/planes"
            className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
          >
            Planes
          </Link>
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <CountrySelector
            pais={pais}
            onChange={onPaisChange}
            className="w-48"
            open={paisOpen}
            onOpenChange={setPaisOpen}
          />
          {sesion ? (
            <>
              <span className="max-w-40 truncate text-sm font-semibold text-foreground">
                {sesion.nombre}
              </span>
              <Button variant="outline" onClick={onSalir}>
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => onAuth("login")}>
                Iniciar Sesión
              </Button>
              <Button onClick={() => onAuth("registro")}>Regístrate Gratis</Button>
            </>
          )}
        </div>

        <Sheet open={menuAbierto} onOpenChange={setMenuAbierto}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="ml-auto md:hidden" aria-label="Abrir menú">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] sm:w-80">
            <SheetHeader>
              <SheetTitle>Menú</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <nav className="grid gap-1">
                {items(true, () => setPaisOpenMovil(true)).map((n) => (
                  <button
                    key={n.label}
                    type="button"
                    onClick={
                      n.label === "Países"
                        ? () => setPaisOpenMovil(true)
                        : n.onClick
                    }
                    className="cursor-pointer rounded-md px-2 py-2 text-left text-sm font-semibold text-foreground hover:bg-surface"
                  >
                    {n.label}
                  </button>
                ))}
              </nav>
              <CountrySelector
                pais={pais}
                onChange={onPaisChange}
                className="w-full"
                open={paisOpenMovil}
                onOpenChange={setPaisOpenMovil}
              />
              <RoleSwitcher rol={rol} onChange={onRolChange} />
              {sesion ? (
                <Button variant="outline" className="w-full" onClick={onSalir}>
                  Cerrar Sesión ({sesion.nombre})
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="w-full" onClick={() => onAuth("login")}>
                    Iniciar Sesión
                  </Button>
                  <Button className="w-full" onClick={() => onAuth("registro")}>
                    Regístrate Gratis
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
