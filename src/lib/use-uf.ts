import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fechaChile, leerUFDelDia, UF_RESPALDO } from "./pricing";

export function useUF() {
  const [dia, setDia] = useState<string | null>(null);
  useEffect(() => {
    const actualizarDia = () => setDia(fechaChile(new Date()));
    actualizarDia();
    const reloj = window.setInterval(actualizarDia, 60_000);
    return () => window.clearInterval(reloj);
  }, []);
  const consulta = useQuery({
    queryKey: ["valor-uf", dia],
    enabled: dia !== null,
    staleTime: 60 * 60 * 1000,
    retry: 1,
    queryFn: async () => {
      const response = await fetch("https://mindicador.cl/api/uf", { signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error("UF no disponible");
      const dato = leerUFDelDia(await response.json());
      if (!dato) throw new Error("UF del día no disponible");
      return dato;
    },
  });
  return {
    valor: consulta.data?.valor ?? UF_RESPALDO,
    fecha: consulta.data?.fecha ?? null,
    respaldo: !consulta.data,
    cargando: consulta.isFetching,
  };
}