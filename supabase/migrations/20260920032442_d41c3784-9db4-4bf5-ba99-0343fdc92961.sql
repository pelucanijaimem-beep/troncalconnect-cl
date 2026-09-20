ALTER TABLE public.cargas
  ADD COLUMN IF NOT EXISTS hora_retiro text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS fecha_entrega date;

CREATE TABLE IF NOT EXISTS public.favoritos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  carga_id uuid NOT NULL REFERENCES public.cargas(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, carga_id)
);
GRANT SELECT, INSERT, DELETE ON public.favoritos TO authenticated;
GRANT ALL ON public.favoritos TO service_role;
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;
CREATE POLICY favoritos_select_own ON public.favoritos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY favoritos_insert_own ON public.favoritos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY favoritos_delete_own ON public.favoritos FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.reportes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reportante_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'publicacion',
  carga_id uuid REFERENCES public.cargas(id) ON DELETE SET NULL,
  reportado_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reportado_nombre text NOT NULL DEFAULT '',
  motivo text NOT NULL DEFAULT '',
  detalle text NOT NULL DEFAULT '',
  estado text NOT NULL DEFAULT 'pendiente',
  nota_admin text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.reportes TO authenticated;
GRANT ALL ON public.reportes TO service_role;
ALTER TABLE public.reportes ENABLE ROW LEVEL SECURITY;
CREATE POLICY reportes_insert_own ON public.reportes FOR INSERT TO authenticated WITH CHECK (auth.uid() = reportante_id);
CREATE POLICY reportes_select_own_or_admin ON public.reportes FOR SELECT TO authenticated USING (auth.uid() = reportante_id OR public.tiene_rol(auth.uid(), 'admin'::app_role));
CREATE POLICY reportes_update_admin ON public.reportes FOR UPDATE TO authenticated USING (public.tiene_rol(auth.uid(), 'admin'::app_role)) WITH CHECK (public.tiene_rol(auth.uid(), 'admin'::app_role));
CREATE TRIGGER reportes_updated_at BEFORE UPDATE ON public.reportes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.solicitudes_eliminacion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  motivo text NOT NULL DEFAULT '',
  origen text NOT NULL DEFAULT 'web',
  estado text NOT NULL DEFAULT 'pendiente',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.solicitudes_eliminacion TO authenticated;
GRANT ALL ON public.solicitudes_eliminacion TO service_role;
ALTER TABLE public.solicitudes_eliminacion ENABLE ROW LEVEL SECURITY;
CREATE POLICY solicitudes_eliminacion_admin_select ON public.solicitudes_eliminacion FOR SELECT TO authenticated USING (public.tiene_rol(auth.uid(), 'admin'::app_role));
CREATE POLICY solicitudes_eliminacion_admin_update ON public.solicitudes_eliminacion FOR UPDATE TO authenticated USING (public.tiene_rol(auth.uid(), 'admin'::app_role)) WITH CHECK (public.tiene_rol(auth.uid(), 'admin'::app_role));
CREATE TRIGGER solicitudes_eliminacion_updated_at BEFORE UPDATE ON public.solicitudes_eliminacion FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.metricas_marketplace()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resultado jsonb;
BEGIN
  IF NOT public.tiene_rol(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Acceso restringido';
  END IF;
  SELECT jsonb_build_object(
    'cargas_publicadas', (SELECT count(*) FROM public.cargas),
    'cargas_activas', (SELECT count(*) FROM public.cargas WHERE estado = 'activa'),
    'cargas_cerradas', (SELECT count(*) FROM public.cargas WHERE estado = 'completada'),
    'cargas_ultimos_30', (SELECT count(*) FROM public.cargas WHERE created_at > now() - interval '30 days'),
    'postulaciones', (SELECT count(*) FROM public.postulaciones),
    'postulaciones_ultimos_30', (SELECT count(*) FROM public.postulaciones WHERE created_at > now() - interval '30 days'),
    'usuarios', (SELECT count(*) FROM public.perfiles),
    'usuarios_bloqueados', (SELECT count(*) FROM public.perfiles WHERE bloqueado),
    'reportes_pendientes', (SELECT count(*) FROM public.reportes WHERE estado = 'pendiente'),
    'solicitudes_eliminacion', (SELECT count(*) FROM public.solicitudes_eliminacion WHERE estado = 'pendiente')
  ) INTO resultado;
  RETURN resultado;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.metricas_marketplace() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.metricas_marketplace() TO authenticated;