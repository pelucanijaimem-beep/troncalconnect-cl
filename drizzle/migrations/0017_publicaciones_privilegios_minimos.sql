REVOKE ALL ON public.publicaciones_uso FROM anon,authenticated;
GRANT SELECT ON public.publicaciones_uso TO authenticated;
GRANT ALL ON public.publicaciones_uso TO service_role;
REVOKE ALL ON public.publicaciones_contadores FROM anon,authenticated;
GRANT ALL ON public.publicaciones_contadores TO service_role;
REVOKE ALL ON FUNCTION public.validar_limite_publicaciones() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.registrar_publicacion_uf() FROM PUBLIC,anon,authenticated;