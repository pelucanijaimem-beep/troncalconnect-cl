CREATE TABLE IF NOT EXISTS public.alertas_ruta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'Otro peligro',
  origen text NOT NULL DEFAULT '',
  destino text NOT NULL DEFAULT '',
  detalle text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.alertas_ruta TO authenticated;
GRANT ALL ON public.alertas_ruta TO service_role;

ALTER TABLE public.alertas_ruta ENABLE ROW LEVEL SECURITY;

CREATE POLICY alertas_ruta_select ON public.alertas_ruta
  FOR SELECT TO authenticated USING (true);

CREATE POLICY alertas_ruta_insert_own ON public.alertas_ruta
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);