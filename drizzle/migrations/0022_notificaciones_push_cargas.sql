CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 1. Suscripciones push de cada teléfono/navegador.
CREATE TABLE public.suscripciones_push (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX suscripciones_push_user_idx ON public.suscripciones_push (user_id);
GRANT SELECT, DELETE ON public.suscripciones_push TO authenticated;
GRANT ALL ON public.suscripciones_push TO service_role;
ALTER TABLE public.suscripciones_push ENABLE ROW LEVEL SECURITY;
CREATE POLICY suscripciones_push_select_own ON public.suscripciones_push
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY suscripciones_push_delete_own ON public.suscripciones_push
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Registra (o reasigna) el dispositivo a quien inició sesión.
CREATE OR REPLACE FUNCTION public.registrar_suscripcion_push(
  p_endpoint text, p_p256dh text, p_auth text, p_user_agent text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Inicia sesión para activar los avisos'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.perfiles WHERE id = v_uid AND NOT bloqueado) THEN
    RAISE EXCEPTION 'Tu cuenta no puede activar avisos';
  END IF;
  IF p_endpoint IS NULL OR p_endpoint !~ '^https://' OR char_length(p_endpoint) > 1000 THEN
    RAISE EXCEPTION 'Suscripción no válida';
  END IF;
  IF p_p256dh IS NULL OR p_p256dh !~ '^[A-Za-z0-9_-]{80,100}=*$'
     OR p_auth IS NULL OR p_auth !~ '^[A-Za-z0-9_-]{16,30}=*$' THEN
    RAISE EXCEPTION 'Claves de suscripción no válidas';
  END IF;
  -- Máximo 10 dispositivos por persona: se descartan los más antiguos.
  DELETE FROM public.suscripciones_push
   WHERE id IN (
     SELECT id FROM public.suscripciones_push
      WHERE user_id = v_uid AND endpoint <> p_endpoint
      ORDER BY updated_at DESC OFFSET 9
   );
  INSERT INTO public.suscripciones_push (user_id, endpoint, p256dh, auth, user_agent)
  VALUES (v_uid, p_endpoint, p_p256dh, p_auth, left(coalesce(p_user_agent, ''), 300))
  ON CONFLICT (endpoint) DO UPDATE
    SET user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth,
        user_agent = excluded.user_agent, updated_at = now();
END;
$$;
REVOKE ALL ON FUNCTION public.registrar_suscripcion_push(text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.registrar_suscripcion_push(text, text, text, text) TO authenticated;

-- 2. Cola privada de un solo uso por carga publicada.
CREATE TABLE public.cola_push_cargas (
  carga_id uuid PRIMARY KEY REFERENCES public.cargas(id) ON DELETE CASCADE,
  token text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  procesada_at timestamptz,
  enviados integer NOT NULL DEFAULT 0
);
GRANT ALL ON public.cola_push_cargas TO service_role;
ALTER TABLE public.cola_push_cargas ENABLE ROW LEVEL SECURITY;

-- 3. Al publicar una carga pública, pedir al servidor de la app que envíe los avisos.
CREATE OR REPLACE FUNCTION public.encolar_push_nueva_carga()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_token text := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
BEGIN
  BEGIN
    INSERT INTO public.cola_push_cargas (carga_id, token) VALUES (NEW.id, v_token);
    PERFORM net.http_post(
      url := 'https://troncaltrack.com/api/public/push-nueva-carga',
      body := jsonb_build_object('carga_id', NEW.id, 'token', v_token),
      headers := '{"Content-Type": "application/json"}'::jsonb,
      timeout_milliseconds := 10000
    );
  EXCEPTION WHEN others THEN
    -- Los avisos son complementarios: nunca bloquean la publicación.
    RAISE WARNING 'encolar_push_nueva_carga: %', SQLSTATE;
  END;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.encolar_push_nueva_carga() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER cargas_push_nueva_carga
  AFTER INSERT ON public.cargas
  FOR EACH ROW
  WHEN (NEW.visibilidad = 'publica' AND NEW.estado = 'activa')
  EXECUTE FUNCTION public.encolar_push_nueva_carga();