CREATE TABLE public.estado_acceso_ia (funcion text PRIMARY KEY, mensaje text NOT NULL, estado integer NOT NULL, actualizado_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.estado_acceso_ia TO authenticated;
GRANT ALL ON public.estado_acceso_ia TO service_role;
ALTER TABLE public.estado_acceso_ia ENABLE ROW LEVEL SECURITY;
CREATE POLICY estado_ia_lectura ON public.estado_acceso_ia FOR SELECT TO authenticated USING (true);