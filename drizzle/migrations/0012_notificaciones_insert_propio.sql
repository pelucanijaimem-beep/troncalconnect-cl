DROP POLICY IF EXISTS "notificaciones_insert_auth" ON public.notificaciones;
CREATE POLICY "notificaciones_insert_propio" ON public.notificaciones
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);