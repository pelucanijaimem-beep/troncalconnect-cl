-- Guarda el certificado ChileValora del propio usuario fusionando con lo existente,
-- sin exponer ni sobrescribir las rutas de los demás documentos.
CREATE OR REPLACE FUNCTION public.guardar_chilevalora(p_numero text, p_vigencia date, p_ruta text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nombre text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'no autenticado';
  END IF;
  SELECT nombre INTO v_nombre FROM public.perfiles WHERE id = auth.uid();
  INSERT INTO public.verificaciones (user_id, nombre, estado, asegurado, documentos, nota_admin, checklist, requiere_revision_manual, chilevalora_numero, chilevalora_vigencia)
  VALUES (
    auth.uid(),
    COALESCE(v_nombre, ''),
    'pendiente',
    false,
    jsonb_build_object('chilevalora_peligrosas', p_ruta),
    '',
    jsonb_build_object('chilevalora_peligrosas', jsonb_build_object('estado', 'pendiente', 'motivo', '')),
    false,
    p_numero,
    p_vigencia
  )
  ON CONFLICT (user_id) DO UPDATE SET
    documentos = public.verificaciones.documentos || jsonb_build_object('chilevalora_peligrosas', p_ruta),
    checklist = public.verificaciones.checklist || jsonb_build_object('chilevalora_peligrosas', jsonb_build_object('estado', 'pendiente', 'motivo', '')),
    chilevalora_numero = p_numero,
    chilevalora_vigencia = p_vigencia,
    updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.guardar_chilevalora(text, date, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.guardar_chilevalora(text, date, text) TO authenticated;