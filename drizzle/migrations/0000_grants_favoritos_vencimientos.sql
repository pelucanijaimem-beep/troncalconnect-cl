GRANT SELECT, INSERT, DELETE ON public.favoritos TO authenticated;
GRANT ALL ON public.favoritos TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vencimientos_documentales TO authenticated;
GRANT ALL ON public.vencimientos_documentales TO service_role;