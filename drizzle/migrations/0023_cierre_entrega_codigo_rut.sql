CREATE TABLE public.viajes_entrega (
  carga_id uuid PRIMARY KEY REFERENCES public.cargas(id) ON DELETE CASCADE,
  generador_id uuid NOT NULL,
  transportista_id uuid NOT NULL,
  codigo text NOT NULL CHECK (codigo ~ '^[0-9]{6}$'),
  estado text NOT NULL DEFAULT 'en_ruta' CHECK (estado IN ('en_ruta', 'entregado')),
  intentos_fallidos integer NOT NULL DEFAULT 0,
  iniciado_at timestamptz NOT NULL DEFAULT now(),
  receptor_rut text,
  entregado_at timestamptz,
  entrega_lat double precision CHECK (entrega_lat IS NULL OR entrega_lat BETWEEN -90 AND 90),
  entrega_lng double precision CHECK (entrega_lng IS NULL OR entrega_lng BETWEEN -180 AND 180),
  entrega_precision_m integer
);
-- Sin acceso directo: el código es secreto y solo se maneja con las funciones de abajo.
GRANT ALL ON public.viajes_entrega TO service_role;
ALTER TABLE public.viajes_entrega ENABLE ROW LEVEL SECURITY;
CREATE INDEX viajes_entrega_transportista_idx ON public.viajes_entrega (transportista_id);

-- Código aleatorio de 6 dígitos, sin repetirse entre viajes en ruta.
CREATE OR REPLACE FUNCTION public.generar_codigo_entrega()
RETURNS text
LANGUAGE plpgsql
VOLATILE
SET search_path = public
AS $$
DECLARE
  v text;
BEGIN
  LOOP
    v := lpad(((('x' || substr(gen_random_uuid()::text, 1, 8))::bit(32)::bigint) % 1000000)::text, 6, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.viajes_entrega WHERE codigo = v AND estado = 'en_ruta');
  END LOOP;
  RETURN v;
END;
$$;
REVOKE ALL ON FUNCTION public.generar_codigo_entrega() FROM PUBLIC, anon, authenticated;

-- El transportista inicia el viaje: queda "En Ruta" con un código de entrega.
CREATE OR REPLACE FUNCTION public.iniciar_viaje_entrega(p_carga uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_carga public.cargas%ROWTYPE;
  v_viaje public.viajes_entrega%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Inicia sesión para iniciar el viaje'; END IF;
  IF EXISTS (SELECT 1 FROM public.perfiles WHERE id = v_uid AND bloqueado) THEN
    RAISE EXCEPTION 'Tu cuenta está bloqueada';
  END IF;
  SELECT * INTO v_carga FROM public.cargas WHERE id = p_carga FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'La carga no existe'; END IF;
  IF v_carga.user_id = v_uid THEN RAISE EXCEPTION 'No puedes iniciar un viaje de tu propia carga'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.postulaciones WHERE carga_id = p_carga AND user_id = v_uid) THEN
    RAISE EXCEPTION 'Postula a la carga antes de iniciar el viaje';
  END IF;
  IF EXISTS (SELECT 1 FROM public.entregas_conformes WHERE carga_id = p_carga) THEN
    RAISE EXCEPTION 'Esta carga ya fue entregada';
  END IF;

  SELECT * INTO v_viaje FROM public.viajes_entrega WHERE carga_id = p_carga FOR UPDATE;
  IF FOUND THEN
    IF v_viaje.transportista_id <> v_uid THEN
      RAISE EXCEPTION 'Otro transportista ya inició el viaje de esta carga';
    END IF;
    RETURN jsonb_build_object('estado', v_viaje.estado, 'iniciado_at', v_viaje.iniciado_at);
  END IF;

  INSERT INTO public.viajes_entrega (carga_id, generador_id, transportista_id, codigo)
  VALUES (p_carga, v_carga.user_id, v_uid, public.generar_codigo_entrega())
  RETURNING * INTO v_viaje;
  RETURN jsonb_build_object('estado', v_viaje.estado, 'iniciado_at', v_viaje.iniciado_at);
END;
$$;
REVOKE ALL ON FUNCTION public.iniciar_viaje_entrega(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.iniciar_viaje_entrega(uuid) TO authenticated;

-- Solo la empresa dueña de la carga ve el código de entrega.
CREATE OR REPLACE FUNCTION public.codigo_entrega_carga(p_carga uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_viaje public.viajes_entrega%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN RETURN NULL; END IF;
  SELECT * INTO v_viaje FROM public.viajes_entrega WHERE carga_id = p_carga;
  IF NOT FOUND OR v_viaje.generador_id <> v_uid THEN RETURN NULL; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.cargas WHERE id = p_carga AND user_id = v_uid) THEN RETURN NULL; END IF;
  RETURN jsonb_build_object(
    'estado', v_viaje.estado,
    'codigo', CASE WHEN v_viaje.estado = 'en_ruta' THEN v_viaje.codigo END,
    'bloqueado', v_viaje.intentos_fallidos >= 5,
    'transportista', (SELECT nombre FROM public.perfiles WHERE id = v_viaje.transportista_id),
    'iniciado_at', v_viaje.iniciado_at,
    'entregado_at', v_viaje.entregado_at,
    'receptor_rut', v_viaje.receptor_rut
  );
END;
$$;
REVOKE ALL ON FUNCTION public.codigo_entrega_carga(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.codigo_entrega_carga(uuid) TO authenticated;

-- La empresa puede generar un código nuevo (por ejemplo, tras agotar los intentos).
CREATE OR REPLACE FUNCTION public.regenerar_codigo_entrega(p_carga uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_codigo text;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Inicia sesión para generar el código'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.cargas WHERE id = p_carga AND user_id = v_uid) THEN
    RAISE EXCEPTION 'Solo la empresa dueña de la carga puede generar el código';
  END IF;
  PERFORM 1 FROM public.viajes_entrega WHERE carga_id = p_carga AND estado = 'en_ruta' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'El viaje no está en ruta'; END IF;
  v_codigo := public.generar_codigo_entrega();
  UPDATE public.viajes_entrega SET codigo = v_codigo, intentos_fallidos = 0 WHERE carga_id = p_carga;
  RETURN v_codigo;
END;
$$;
REVOKE ALL ON FUNCTION public.regenerar_codigo_entrega(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.regenerar_codigo_entrega(uuid) TO authenticated;

-- El transportista cierra la entrega con el código y el RUT de quien recibe.
CREATE OR REPLACE FUNCTION public.confirmar_entrega_codigo(
  p_carga uuid, p_codigo text, p_rut text,
  p_lat double precision DEFAULT NULL, p_lng double precision DEFAULT NULL, p_precision integer DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_viaje public.viajes_entrega%ROWTYPE;
  v_carga public.cargas%ROWTYPE;
  v_codigo text := btrim(coalesce(p_codigo, ''));
  v_lat double precision := p_lat;
  v_lng double precision := p_lng;
  v_ahora timestamptz := now();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Inicia sesión para confirmar la entrega'; END IF;
  IF EXISTS (SELECT 1 FROM public.perfiles WHERE id = v_uid AND bloqueado) THEN
    RAISE EXCEPTION 'Tu cuenta está bloqueada';
  END IF;
  SELECT * INTO v_viaje FROM public.viajes_entrega WHERE carga_id = p_carga FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Este viaje no tiene código de entrega. Inicia el viaje desde TroncalTrack';
  END IF;
  IF v_viaje.transportista_id <> v_uid THEN
    RAISE EXCEPTION 'Solo el transportista del viaje puede confirmar la entrega';
  END IF;
  IF v_viaje.estado = 'entregado' OR EXISTS (SELECT 1 FROM public.entregas_conformes WHERE carga_id = p_carga) THEN
    RAISE EXCEPTION 'Esta entrega ya fue confirmada';
  END IF;
  IF v_codigo !~ '^[0-9]{6}$' THEN RAISE EXCEPTION 'El código debe tener 6 dígitos'; END IF;
  IF NOT public.rut_chileno_valido(p_rut) THEN RAISE EXCEPTION 'RUT del receptor no válido'; END IF;
  IF v_lat IS NULL OR v_lng IS NULL OR v_lat NOT BETWEEN -90 AND 90 OR v_lng NOT BETWEEN -180 AND 180 THEN
    v_lat := NULL; v_lng := NULL;
  END IF;
  IF v_viaje.intentos_fallidos >= 5 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'bloqueado', 'restantes', 0);
  END IF;

  IF v_codigo <> v_viaje.codigo THEN
    UPDATE public.viajes_entrega SET intentos_fallidos = intentos_fallidos + 1 WHERE carga_id = p_carga;
    RETURN jsonb_build_object('ok', false, 'error', 'codigo_incorrecto', 'restantes', greatest(0, 4 - v_viaje.intentos_fallidos));
  END IF;

  UPDATE public.viajes_entrega
     SET estado = 'entregado', receptor_rut = public.normalizar_rut(p_rut), entregado_at = v_ahora,
         entrega_lat = v_lat, entrega_lng = v_lng,
         entrega_precision_m = CASE WHEN v_lat IS NULL THEN NULL ELSE greatest(0, p_precision) END
   WHERE carga_id = p_carga;

  INSERT INTO public.entregas_conformes (carga_id, generador_id, transportista_id, confirmada_at)
  VALUES (p_carga, v_viaje.generador_id, v_uid, v_ahora);

  SELECT * INTO v_carga FROM public.cargas WHERE id = p_carga FOR UPDATE;
  UPDATE public.cargas SET estado = 'completada', completada_at = coalesce(completada_at, v_ahora) WHERE id = p_carga;

  INSERT INTO public.notificaciones (user_id, tipo, titulo, mensaje, datos)
  VALUES (
    v_viaje.generador_id,
    'calificacion_pendiente',
    'Entrega confirmada: califica tu viaje',
    'El transportista confirmó la entrega en destino del viaje ' || v_carga.origen || ' → ' || v_carga.destino || ' con el código y el RUT del receptor. Ya puedes calificar tu experiencia.',
    jsonb_build_object('carga_id', p_carga, 'ruta', v_carga.origen || ' → ' || v_carga.destino)
  );

  RETURN jsonb_build_object('ok', true, 'entregado_at', v_ahora);
END;
$$;
REVOKE ALL ON FUNCTION public.confirmar_entrega_codigo(uuid, text, text, double precision, double precision, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.confirmar_entrega_codigo(uuid, text, text, double precision, double precision, integer) TO authenticated;

-- Los viajes con código se cierran solo con el código; la confirmación manual queda para viajes sin código.
CREATE OR REPLACE FUNCTION public.confirmar_entrega_conforme(p_carga uuid, p_transportista uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_carga public.cargas%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Inicia sesión para confirmar la entrega'; END IF;
  IF EXISTS (SELECT 1 FROM public.perfiles WHERE id = v_uid AND bloqueado) THEN
    RAISE EXCEPTION 'Tu cuenta está bloqueada';
  END IF;
  SELECT * INTO v_carga FROM public.cargas WHERE id = p_carga FOR UPDATE;
  IF NOT FOUND OR v_carga.user_id <> v_uid THEN
    RAISE EXCEPTION 'Solo la empresa dueña de la carga puede confirmar la entrega';
  END IF;
  IF EXISTS (SELECT 1 FROM public.viajes_entrega WHERE carga_id = p_carga) THEN
    RAISE EXCEPTION 'Este viaje se cierra con el código de entrega que el receptor entrega al transportista';
  END IF;
  IF p_transportista IS NULL OR p_transportista = v_uid OR NOT EXISTS (
    SELECT 1 FROM public.postulaciones WHERE carga_id = p_carga AND user_id = p_transportista
  ) THEN
    RAISE EXCEPTION 'Elige a un transportista que haya postulado a esta carga';
  END IF;
  IF EXISTS (SELECT 1 FROM public.entregas_conformes WHERE carga_id = p_carga) THEN
    RAISE EXCEPTION 'Esta entrega ya fue confirmada';
  END IF;

  INSERT INTO public.entregas_conformes (carga_id, generador_id, transportista_id)
  VALUES (p_carga, v_uid, p_transportista);

  UPDATE public.cargas
     SET estado = 'completada', completada_at = coalesce(completada_at, now())
   WHERE id = p_carga;

  INSERT INTO public.notificaciones (user_id, tipo, titulo, mensaje, datos)
  VALUES (
    p_transportista,
    'calificacion_pendiente',
    'Entrega confirmada: califica tu viaje',
    'La empresa confirmó como entregado y conforme el viaje ' || v_carga.origen || ' → ' || v_carga.destino || '. Ya puedes calificar tu experiencia.',
    jsonb_build_object('carga_id', p_carga, 'ruta', v_carga.origen || ' → ' || v_carga.destino)
  );
END;
$$;
REVOKE ALL ON FUNCTION public.confirmar_entrega_conforme(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.confirmar_entrega_conforme(uuid, uuid) TO authenticated;