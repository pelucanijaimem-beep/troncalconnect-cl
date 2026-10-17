CREATE OR REPLACE FUNCTION public.rut_chileno_valido(p_rut text)
RETURNS boolean LANGUAGE plpgsql IMMUTABLE SET search_path = public
AS $$
DECLARE
  limpio text;
  cuerpo text;
  suma integer := 0;
  factor integer := 2;
  resto integer;
  esperado text;
  i integer;
BEGIN
  IF p_rut IS NULL OR p_rut !~ '^[0-9.kK[:space:]-]+$' THEN RETURN false; END IF;
  limpio := public.normalizar_rut(p_rut);
  IF limpio IS NULL OR limpio !~ '^[0-9]{7,8}[0-9k]$' THEN RETURN false; END IF;
  cuerpo := left(limpio, length(limpio) - 1);
  IF cuerpo::bigint = 0 THEN RETURN false; END IF;
  FOR i IN REVERSE length(cuerpo)..1 LOOP
    suma := suma + substring(cuerpo from i for 1)::integer * factor;
    factor := CASE WHEN factor = 7 THEN 2 ELSE factor + 1 END;
  END LOOP;
  resto := 11 - (suma % 11);
  esperado := CASE WHEN resto = 11 THEN '0' WHEN resto = 10 THEN 'k' ELSE resto::text END;
  RETURN right(limpio, 1) = esperado;
END;
$$;
REVOKE ALL ON FUNCTION public.rut_chileno_valido(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rut_chileno_valido(text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.validar_rut_perfil()
RETURNS trigger LANGUAGE plpgsql SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.rut IS DISTINCT FROM OLD.rut THEN
    IF NOT public.rut_chileno_valido(NEW.rut) THEN
      RAISE EXCEPTION 'El RUT ingresado no es válido. Revísalo e inténtalo de nuevo.' USING ERRCODE = '22023';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.validar_rut_perfil() FROM PUBLIC;
CREATE TRIGGER validar_rut_perfil_trg
BEFORE INSERT OR UPDATE OF rut ON public.perfiles
FOR EACH ROW EXECUTE FUNCTION public.validar_rut_perfil();