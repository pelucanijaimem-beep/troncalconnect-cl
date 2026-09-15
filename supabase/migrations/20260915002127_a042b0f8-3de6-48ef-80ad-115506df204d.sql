CREATE OR REPLACE FUNCTION public.tarifa_ruta(_origen text, _destino text)
RETURNS TABLE (promedio numeric, registros integer)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT round(avg(valor_km))::numeric AS promedio, count(*)::int AS registros
  FROM public.cargas
  WHERE estado = 'completada'
    AND lower(btrim(origen)) = lower(btrim(_origen))
    AND lower(btrim(destino)) = lower(btrim(_destino))
$$;

REVOKE ALL ON FUNCTION public.tarifa_ruta(text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.tarifa_ruta(text, text) TO anon, authenticated, service_role;