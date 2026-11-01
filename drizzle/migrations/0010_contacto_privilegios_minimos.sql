REVOKE ALL ON public.mensajes_contacto FROM anon, authenticated;
GRANT INSERT (tipo, nombre, correo, mensaje, user_id) ON public.mensajes_contacto TO anon, authenticated;
GRANT SELECT ON public.mensajes_contacto TO authenticated;
GRANT UPDATE (leido) ON public.mensajes_contacto TO authenticated;
GRANT ALL ON public.mensajes_contacto TO service_role;