CREATE TABLE public.empresas_bloqueadas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transportista_id uuid NOT NULL,
  empresa_id uuid NOT NULL,
  empresa_nombre text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (transportista_id, empresa_id),
  CONSTRAINT empresas_bloqueadas_no_propia CHECK (transportista_id <> empresa_id),
  CONSTRAINT empresas_bloqueadas_nombre_largo CHECK (char_length(empresa_nombre) <= 120)
);

GRANT SELECT, INSERT, DELETE ON public.empresas_bloqueadas TO authenticated;
GRANT ALL ON public.empresas_bloqueadas TO service_role;

ALTER TABLE public.empresas_bloqueadas ENABLE ROW LEVEL SECURITY;

CREATE POLICY empresas_bloqueadas_select_own ON public.empresas_bloqueadas
  FOR SELECT TO authenticated USING (auth.uid() = transportista_id);
CREATE POLICY empresas_bloqueadas_insert_own ON public.empresas_bloqueadas
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = transportista_id);
CREATE POLICY empresas_bloqueadas_delete_own ON public.empresas_bloqueadas
  FOR DELETE TO authenticated USING (auth.uid() = transportista_id);