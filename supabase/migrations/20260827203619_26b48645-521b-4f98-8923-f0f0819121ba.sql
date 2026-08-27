CREATE TYPE public.rol_usuario AS ENUM ('camionero', 'empresa');
CREATE TYPE public.estado_carga AS ENUM ('activa', 'completada');

CREATE TABLE public.perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  nombre TEXT NOT NULL DEFAULT 'Usuario',
  email TEXT NOT NULL DEFAULT '',
  telefono TEXT,
  rut TEXT,
  rol public.rol_usuario NOT NULL DEFAULT 'camionero',
  plan_activo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.perfiles TO authenticated;
GRANT ALL ON public.perfiles TO service_role;
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "perfiles_select" ON public.perfiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "perfiles_insert_own" ON public.perfiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "perfiles_update_own" ON public.perfiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.cargas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  origen TEXT NOT NULL,
  destino TEXT NOT NULL,
  tipo_camion TEXT NOT NULL,
  precio NUMERIC NOT NULL DEFAULT 0,
  estado public.estado_carga NOT NULL DEFAULT 'activa',
  empresa TEXT NOT NULL,
  empresa_telefono TEXT NOT NULL DEFAULT '',
  empresa_verificada BOOLEAN NOT NULL DEFAULT false,
  pais TEXT NOT NULL DEFAULT 'CL',
  km NUMERIC NOT NULL DEFAULT 0,
  valor_km NUMERIC NOT NULL DEFAULT 0,
  toneladas NUMERIC NOT NULL DEFAULT 0,
  fecha DATE,
  detalle TEXT NOT NULL DEFAULT '',
  solo_verificados BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cargas TO authenticated;
GRANT ALL ON public.cargas TO service_role;
ALTER TABLE public.cargas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cargas_select" ON public.cargas FOR SELECT TO authenticated USING (true);
CREATE POLICY "cargas_insert_own" ON public.cargas FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cargas_update_own" ON public.cargas FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cargas_delete_own" ON public.cargas FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.tiene_plan_activo(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.perfiles WHERE id = _user_id AND plan_activo = true);
$$;

CREATE TABLE public.postulaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carga_id UUID NOT NULL REFERENCES public.cargas ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  mensaje TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (carga_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.postulaciones TO authenticated;
GRANT ALL ON public.postulaciones TO service_role;
ALTER TABLE public.postulaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "postulaciones_select" ON public.postulaciones FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.cargas c WHERE c.id = carga_id AND c.user_id = auth.uid()));
CREATE POLICY "postulaciones_insert_con_plan" ON public.postulaciones FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.tiene_plan_activo(auth.uid()));
CREATE POLICY "postulaciones_delete_own" ON public.postulaciones FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombre, email, telefono, rut, rol)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nombre', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data ->> 'telefono',
    NEW.raw_user_meta_data ->> 'rut',
    COALESCE((NEW.raw_user_meta_data ->> 'rol')::public.rol_usuario, 'camionero')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER PUBLICATION supabase_realtime ADD TABLE public.cargas;