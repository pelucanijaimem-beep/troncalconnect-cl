-- 1. Calificaciones cruzadas
CREATE TABLE public.calificaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carga_id uuid REFERENCES public.cargas(id) ON DELETE SET NULL,
  autor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  autor_nombre text NOT NULL DEFAULT '',
  evaluado_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  evaluado_nombre text NOT NULL DEFAULT '',
  tipo text NOT NULL DEFAULT 'a_camionero',
  estrellas integer NOT NULL DEFAULT 5,
  criterios jsonb NOT NULL DEFAULT '{}'::jsonb,
  comentario text NOT NULL DEFAULT '',
  ruta text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.calificaciones TO authenticated;
GRANT ALL ON public.calificaciones TO service_role;
ALTER TABLE public.calificaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "calificaciones_select" ON public.calificaciones
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "calificaciones_insert_own" ON public.calificaciones
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = autor_id);
CREATE POLICY "calificaciones_update_own" ON public.calificaciones
  FOR UPDATE TO authenticated USING (auth.uid() = autor_id) WITH CHECK (auth.uid() = autor_id);
CREATE POLICY "calificaciones_delete_own_or_admin" ON public.calificaciones
  FOR DELETE TO authenticated USING (auth.uid() = autor_id OR public.tiene_rol(auth.uid(), 'admin'));

CREATE TRIGGER calificaciones_updated_at BEFORE UPDATE ON public.calificaciones
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX calificaciones_evaluado_idx ON public.calificaciones (lower(evaluado_nombre));

-- 2. Preferencias de alertas de coincidencia
CREATE TABLE public.preferencias_alertas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL DEFAULT '',
  nombre text NOT NULL DEFAULT '',
  origenes text[] NOT NULL DEFAULT '{}',
  destinos text[] NOT NULL DEFAULT '{}',
  carrocerias text[] NOT NULL DEFAULT '{}',
  ciudad_base text NOT NULL DEFAULT '',
  alertas_email boolean NOT NULL DEFAULT true,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.preferencias_alertas TO authenticated;
GRANT ALL ON public.preferencias_alertas TO service_role;
ALTER TABLE public.preferencias_alertas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prefs_select_own" ON public.preferencias_alertas
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.tiene_rol(auth.uid(), 'admin'));
CREATE POLICY "prefs_insert_own" ON public.preferencias_alertas
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "prefs_update_own" ON public.preferencias_alertas
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "prefs_delete_own" ON public.preferencias_alertas
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER preferencias_alertas_updated_at BEFORE UPDATE ON public.preferencias_alertas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Notificaciones en la aplicación
CREATE TABLE public.notificaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'general',
  titulo text NOT NULL DEFAULT '',
  mensaje text NOT NULL DEFAULT '',
  datos jsonb NOT NULL DEFAULT '{}'::jsonb,
  leida boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notificaciones TO authenticated;
GRANT ALL ON public.notificaciones TO service_role;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notificaciones_select_own" ON public.notificaciones
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notificaciones_insert_auth" ON public.notificaciones
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "notificaciones_update_own" ON public.notificaciones
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notificaciones_delete_own" ON public.notificaciones
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX notificaciones_user_idx ON public.notificaciones (user_id, created_at DESC);

-- 4. Checklist detallado de verificación documental
ALTER TABLE public.verificaciones
  ADD COLUMN IF NOT EXISTS checklist jsonb NOT NULL DEFAULT '{
    "soat": {"estado": "pendiente", "motivo": ""},
    "revision_tecnica": {"estado": "pendiente", "motivo": ""},
    "permiso_circulacion": {"estado": "pendiente", "motivo": ""},
    "licencia": {"estado": "pendiente", "motivo": ""},
    "antecedentes": {"estado": "pendiente", "motivo": ""}
  }'::jsonb;

-- 5. Registro de término de viaje
ALTER TABLE public.cargas
  ADD COLUMN IF NOT EXISTS completada_at timestamptz;