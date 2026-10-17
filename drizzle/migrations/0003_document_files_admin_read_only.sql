ALTER POLICY documentos_select_own_or_admin ON storage.objects USING (bucket_id = 'documentos' AND public.tiene_rol(auth.uid(), 'admin'::public.app_role));

CREATE OR REPLACE FUNCTION public.mi_verificacion_resumen()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'nombre', v.nombre,
    'estado', v.estado,
    'asegurado', v.asegurado,
    'checklist', v.checklist,
    'updated_at', v.updated_at,
    'nota_admin', v.nota_admin,
    'documentos', COALESCE((SELECT jsonb_object_agg(d.key, true) FROM jsonb_each(v.documentos) d WHERE jsonb_typeof(d.value) = 'string' AND d.value <> '""'::jsonb), '{}'::jsonb)
  ) FROM public.verificaciones v WHERE v.user_id = auth.uid();
$$;
REVOKE ALL ON FUNCTION public.mi_verificacion_resumen() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mi_verificacion_resumen() TO authenticated, service_role;