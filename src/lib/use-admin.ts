import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Indica si el usuario autenticado tiene el rol de administrador. */
export function useEsAdmin(userId: string | undefined | null) {
  const [esAdmin, setEsAdmin] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vivo = true;
    if (!userId) {
      setEsAdmin(false);
      setCargando(false);
      return;
    }
    setCargando(true);
    void supabase
      .rpc("tiene_rol", { _user_id: userId, _role: "admin" })
      .then(({ data }) => {
        if (!vivo) return;
        setEsAdmin(Boolean(data));
        setCargando(false);
      });
    return () => {
      vivo = false;
    };
  }, [userId]);

  return { esAdmin, cargando };
}
