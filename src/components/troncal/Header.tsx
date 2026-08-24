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

type Props = {
  rol: Rol;
  pais: PaisCodigo;
  onPaisChange: (p: PaisCodigo) => void;
  onRolChange: (r: Rol) => void;
  onAuth: (modo: "login" | "registro") => void;
};

const NAV = [
  { label: "Cargas", href: "#cargas" },
  { label: "Publicar Camión", href: "#publicar-camion" },
  { label: "Países", href: "#paises" },
  { label: "Recursos", href: "#planes" },
  { label: "Soporte", href: "#soporte" },
];

export function Header({ rol, pais, onPaisChange, onRolChange, onAuth }: Props) {
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
          {NAV.map((n) => (
            <a
              key={n.label}
              href={n.href}
              className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <CountrySelector pais={pais} onChange={onPaisChange} className="w-48" />
          <Button variant="outline" onClick={() => onAuth("login")}>
            Iniciar Sesión
          </Button>
          <Button onClick={() => onAuth("registro")}>Regístrate Gratis</Button>
        </div>

        <Sheet>
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
                {NAV.map((n) => (
                  <a
                    key={n.label}
                    href={n.href}
                    className="rounded-md px-2 py-2 text-sm font-semibold text-foreground hover:bg-surface"
                  >
                    {n.label}
                  </a>
                ))}
              </nav>
              <CountrySelector pais={pais} onChange={onPaisChange} className="w-full" />
              <RoleSwitcher rol={rol} onChange={onRolChange} />
              <Button variant="outline" className="w-full" onClick={() => onAuth("login")}>
                Iniciar Sesión
              </Button>
              <Button className="w-full" onClick={() => onAuth("registro")}>
                Regístrate Gratis
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
