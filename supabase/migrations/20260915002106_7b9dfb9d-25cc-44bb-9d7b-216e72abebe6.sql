ALTER TABLE public.cargas
  ADD COLUMN IF NOT EXISTS tipo_publicador text NOT NULL DEFAULT 'generador';

ALTER TABLE public.cargas
  DROP CONSTRAINT IF EXISTS cargas_tipo_publicador_check;
ALTER TABLE public.cargas
  ADD CONSTRAINT cargas_tipo_publicador_check CHECK (tipo_publicador IN ('generador','intermediario'));

ALTER TABLE public.perfiles
  ADD COLUMN IF NOT EXISTS fundador boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS fundador_numero integer,
  ADD COLUMN IF NOT EXISTS tipo_publicador text NOT NULL DEFAULT 'generador';

CREATE OR REPLACE FUNCTION public.cupos_fundador()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT GREATEST(0, 20 - (SELECT count(*)::int FROM public.perfiles WHERE fundador))
$$;

REVOKE ALL ON FUNCTION public.cupos_fundador() FROM public;
GRANT EXECUTE ON FUNCTION public.cupos_fundador() TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.reservar_cupo_fundador()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _actual integer;
  _tomados integer;
BEGIN
  IF _uid IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT fundador_numero INTO _actual FROM public.perfiles WHERE id = _uid;
  IF _actual IS NOT NULL THEN
    RETURN _actual;
  END IF;

  SELECT count(*)::int INTO _tomados FROM public.perfiles WHERE fundador;
  IF _tomados >= 20 THEN
    RETURN NULL;
  END IF;

  UPDATE public.perfiles
    SET fundador = true, fundador_numero = _tomados + 1
    WHERE id = _uid;

  RETURN _tomados + 1;
END;
$$;

REVOKE ALL ON FUNCTION public.reservar_cupo_fundador() FROM public;
GRANT EXECUTE ON FUNCTION public.reservar_cupo_fundador() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.tarifa_ruta(_origen text, _destino text)
RETURNS TABLE (promedio numeric, registros integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
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