ALTER TABLE public.perfiles ADD COLUMN plan_tier text NOT NULL DEFAULT 'inicial';

ALTER TABLE public.perfiles ADD CONSTRAINT perfiles_plan_tier_check
  CHECK (plan_tier IN ('inicial', 'transportista_pro', 'empresa_pyme', 'empresa_pro'));

-- Datos existentes: empresas con plan activo quedan en empresa_pro (único plan de empresa pagado que existía),
-- transportistas con plan activo en transportista_pro, el resto en inicial.
UPDATE public.perfiles SET plan_tier = CASE
  WHEN plan_activo AND rol = 'empresa' THEN 'empresa_pro'
  WHEN plan_activo AND rol = 'camionero' THEN 'transportista_pro'
  ELSE 'inicial'
END;

CREATE OR REPLACE FUNCTION public.cargas_publicadas_mes_actual(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT count(*)::int FROM public.cargas
  WHERE user_id = _user_id
    AND created_at >= date_trunc('month', now())
$$;

CREATE OR REPLACE FUNCTION public.limite_publicaciones_mes(_tier text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $$
  SELECT CASE _tier
    WHEN 'inicial' THEN 2
    WHEN 'empresa_pyme' THEN 15
    ELSE NULL
  END
$$;

CREATE OR REPLACE FUNCTION public.validar_limite_publicaciones()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_tier text;
  v_limite integer;
  v_usadas integer;
BEGIN
  SELECT plan_tier INTO v_tier FROM public.perfiles WHERE id = NEW.user_id;
  v_limite := public.limite_publicaciones_mes(COALESCE(v_tier, 'inicial'));
  IF v_limite IS NULL THEN
    RETURN NEW;
  END IF;
  v_usadas := public.cargas_publicadas_mes_actual(NEW.user_id);
  IF v_usadas >= v_limite THEN
    RAISE EXCEPTION 'LIMITE_PLAN:%:%', v_limite, COALESCE(v_tier, 'inicial') USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER cargas_limite_plan_trg
BEFORE INSERT ON public.cargas
FOR EACH ROW EXECUTE FUNCTION validar_limite_publicaciones();