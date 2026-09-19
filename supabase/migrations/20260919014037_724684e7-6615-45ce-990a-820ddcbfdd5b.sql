DROP POLICY IF EXISTS verificaciones_select ON public.verificaciones;

CREATE POLICY verificaciones_select_own_or_admin
ON public.verificaciones
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.tiene_rol(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.verificaciones_publicas()
RETURNS TABLE (nombre text, estado text, asegurado boolean, updated_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT v.nombre, v.estado, v.asegurado, v.updated_at
  FROM public.verificaciones v
$$;

REVOKE ALL ON FUNCTION public.verificaciones_publicas() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.verificaciones_publicas() TO authenticated, service_role;