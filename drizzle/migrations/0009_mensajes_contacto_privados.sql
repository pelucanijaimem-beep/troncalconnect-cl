CREATE TABLE public.mensajes_contacto (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tipo text NOT NULL CHECK (tipo IN ('soporte','sugerencia')),
 nombre text NOT NULL CHECK (char_length(btrim(nombre)) BETWEEN 1 AND 100),
 correo text NOT NULL CHECK (char_length(correo) <= 255 AND correo ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
 mensaje text NOT NULL CHECK (char_length(btrim(mensaje)) BETWEEN 10 AND 5000),
 user_id uuid,
 leido boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT (tipo,nombre,correo,mensaje,user_id) ON public.mensajes_contacto TO anon, authenticated;
GRANT SELECT ON public.mensajes_contacto TO authenticated;
GRANT UPDATE (leido) ON public.mensajes_contacto TO authenticated;
GRANT ALL ON public.mensajes_contacto TO service_role;
ALTER TABLE public.mensajes_contacto ENABLE ROW LEVEL SECURITY;
CREATE POLICY contacto_insert_visitante ON public.mensajes_contacto FOR INSERT TO anon WITH CHECK (user_id IS NULL AND leido = false);
CREATE POLICY contacto_insert_usuario ON public.mensajes_contacto FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND leido = false);
CREATE POLICY contacto_select_admin ON public.mensajes_contacto FOR SELECT TO authenticated USING (public.tiene_rol(auth.uid(), 'admin'));
CREATE POLICY contacto_update_admin ON public.mensajes_contacto FOR UPDATE TO authenticated USING (public.tiene_rol(auth.uid(), 'admin')) WITH CHECK (public.tiene_rol(auth.uid(), 'admin'));
CREATE INDEX mensajes_contacto_fecha_idx ON public.mensajes_contacto (created_at DESC);