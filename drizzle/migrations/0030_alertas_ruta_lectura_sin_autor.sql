DROP POLICY IF EXISTS alertas_ruta_select ON public.alertas_ruta;

CREATE POLICY alertas_ruta_select_propias_o_admin ON public.alertas_ruta
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.tiene_rol(auth.uid(), 'admin'::public.app_role));

CREATE OR REPLACE FUNCTION public.reportes_ruta_recientes(
  p_ciudades text[],
  p_exacta boolean DEFAULT false,
  p_dias integer DEFAULT 45,
  p_limite integer DEFAULT 10
)
RETURNS TABLE(id uuid, tipo text, origen text, destino text, detalle text, created_at timestamptz)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_ciudades text[];
  v_patrones text[];
  v_dias integer := LEAST(GREATEST(COALESCE(p_dias, 45), 1), 45);
  v_limite integer := LEAST(GREATEST(COALESCE(p_limite, 10), 1), 100);
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No autorizado' USING ERRCODE = '42501';
  END IF;
  IF EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = v_uid AND p.bloqueado) THEN
    RETURN;
  END IF;

  SELECT array_agg(left(btrim(c), 80))
    INTO v_ciudades
    FROM (SELECT unnest(COALESCE(p_ciudades, '{}'::text[])) AS c LIMIT 4) s
   WHERE btrim(c) <> '';
  IF v_ciudades IS NULL OR array_length(v_ciudades, 1) IS NULL THEN
    RETURN;
  END IF;

  IF p_exacta THEN
    RETURN QUERY
      SELECT a.id, a.tipo, a.origen, a.destino, a.detalle, a.created_at
        FROM public.alertas_ruta a
       WHERE a.created_at >= now() - make_interval(days => v_dias)
         AND (a.origen = ANY(v_ciudades) OR a.destino = ANY(v_ciudades))
       ORDER BY a.created_at DESC
       LIMIT v_limite;
  ELSE
    SELECT array_agg('%' || replace(replace(replace(c, '\', '\\'), '%', '\%'), '_', '\_') || '%')
      INTO v_patrones
      FROM unnest(v_ciudades) AS c;
    RETURN QUERY
      SELECT a.id, a.tipo, a.origen, a.destino, a.detalle, a.created_at
        FROM public.alertas_ruta a
       WHERE a.created_at >= now() - make_interval(days => v_dias)
         AND (a.origen ILIKE ANY(v_patrones) OR a.destino ILIKE ANY(v_patrones))
       ORDER BY a.created_at DESC
       LIMIT v_limite;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.reportes_ruta_recientes(text[], boolean, integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reportes_ruta_recientes(text[], boolean, integer, integer) TO authenticated, service_role;