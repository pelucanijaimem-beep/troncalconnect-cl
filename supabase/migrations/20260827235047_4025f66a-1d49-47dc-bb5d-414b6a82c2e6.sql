-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'usuario');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.tiene_rol(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "user_roles_select_own_or_admin" ON public.user_roles
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.tiene_rol(auth.uid(), 'admin'));

-- Perfiles: bloqueo y sello
ALTER TABLE public.perfiles
  ADD COLUMN IF NOT EXISTS bloqueado boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verificado boolean NOT NULL DEFAULT false;

CREATE POLICY "perfiles_admin_update" ON public.perfiles
FOR UPDATE TO authenticated
USING (public.tiene_rol(auth.uid(), 'admin'))
WITH CHECK (public.tiene_rol(auth.uid(), 'admin'));

-- Verificaciones
CREATE TABLE public.verificaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre text NOT NULL DEFAULT '',
  estado text NOT NULL DEFAULT 'pendiente',
  asegurado boolean NOT NULL DEFAULT false,
  documentos jsonb NOT NULL DEFAULT '{}'::jsonb,
  nota_admin text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.verificaciones TO authenticated;
GRANT ALL ON public.verificaciones TO service_role;

ALTER TABLE public.verificaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "verificaciones_select" ON public.verificaciones
FOR SELECT TO authenticated USING (true);

CREATE POLICY "verificaciones_insert_own" ON public.verificaciones
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND estado = 'pendiente');

CREATE POLICY "verificaciones_update_own" ON public.verificaciones
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND estado = 'pendiente');

CREATE POLICY "verificaciones_admin_all" ON public.verificaciones
FOR ALL TO authenticated
USING (public.tiene_rol(auth.uid(), 'admin'))
WITH CHECK (public.tiene_rol(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER verificaciones_updated_at
BEFORE UPDATE ON public.verificaciones
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Cargas: administración
CREATE POLICY "cargas_admin_delete" ON public.cargas
FOR DELETE TO authenticated USING (public.tiene_rol(auth.uid(), 'admin'));

CREATE POLICY "cargas_admin_update" ON public.cargas
FOR UPDATE TO authenticated
USING (public.tiene_rol(auth.uid(), 'admin'))
WITH CHECK (public.tiene_rol(auth.uid(), 'admin'));

-- Rol por defecto al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'usuario')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created_role
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();