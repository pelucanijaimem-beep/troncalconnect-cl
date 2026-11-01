import { useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { useRecuperacionPassword } from "@/lib/use-session";

export function PasswordRecoveryDialog() {
  const recuperando = useRecuperacionPassword();
  const pathname = useLocation({ select: (location) => location.pathname });
  const [exito, setExito] = useState(false);
  return <Dialog open={pathname !== "/reset-password" && (recuperando || exito)} onOpenChange={(open) => { if (!open && exito) setExito(false); }}>
    <DialogContent showCloseButton={exito} onEscapeKeyDown={(e) => { if (!exito) e.preventDefault(); }} onInteractOutside={(e) => { if (!exito) e.preventDefault(); }}>
      <DialogHeader><DialogTitle>Restablecer contraseña</DialogTitle><DialogDescription>TroncalTrack</DialogDescription></DialogHeader>
      <ResetPasswordForm onSuccess={() => setExito(true)} />
    </DialogContent>
  </Dialog>;
}