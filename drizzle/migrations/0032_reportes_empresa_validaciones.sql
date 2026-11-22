ALTER TABLE public.reportes
  ADD CONSTRAINT reportes_tipo_valido CHECK (tipo IN ('publicacion', 'usuario', 'empresa')),
  ADD CONSTRAINT reportes_motivo_largo CHECK (char_length(btrim(motivo)) BETWEEN 1 AND 500),
  ADD CONSTRAINT reportes_detalle_largo CHECK (char_length(detalle) <= 2000);

DROP POLICY IF EXISTS reportes_insert_own ON public.reportes;
CREATE POLICY reportes_insert_own ON public.reportes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reportante_id AND estado = 'pendiente' AND nota_admin = '');