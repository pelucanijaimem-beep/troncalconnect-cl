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

type Props = {
  rol: Rol;
  onRolChange: (r: Rol) => void;
  onAuth: (modo: "login" | "registro") => void;
};

export function Header({ rol, onRolChange, onAuth }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <a href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Truck className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-foreground">
            Troncal<span className="text-primary">Track</span>
          </span>
        </a>

        <div className="ml-auto hidden md:block">
          <RoleSwitcher rol={rol} onChange={onRolChange} />
        </div>

        <div className="ml-auto hidden items-center gap-2 md:ml-0 md:flex">
          <Button variant="ghost" onClick={() => onAuth("login")}>
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
