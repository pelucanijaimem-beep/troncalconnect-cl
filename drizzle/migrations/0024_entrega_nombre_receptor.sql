ALTER TABLE public.viajes_entrega ADD COLUMN receptor_nombre text;

DROP FUNCTION IF EXISTS public.confirmar_entrega_codigo(uuid, text, text, double precision, double precision, integer);

CREATE OR REPLACE FUNCTION public.confirmar_entrega_codigo(
  p_carga uuid, p_codigo text, p_nombre text, p_rut text,
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
  v_nombre text := regexp_replace(btrim(coalesce(p_nombre, '')), '\s+', ' ', 'g');
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
  IF char_length(v_nombre) < 3 OR char_length(v_nombre) > 120 THEN
    RAISE EXCEPTION 'Ingresa el nombre de quien recibe (3 a 120 caracteres)';
  END IF;
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
     SET estado = 'entregado', receptor_nombre = v_nombre, receptor_rut = public.normalizar_rut(p_rut),
         entregado_at = v_ahora, entrega_lat = v_lat, entrega_lng = v_lng,
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
    'El transportista confirmó la entrega en destino del viaje ' || v_carga.origen || ' → ' || v_carga.destino || ' con el código y los datos del receptor. Ya puedes calificar tu experiencia.',
    jsonb_build_object('carga_id', p_carga, 'ruta', v_carga.origen || ' → ' || v_carga.destino)
  );

  RETURN jsonb_build_object('ok', true, 'entregado_at', v_ahora);
END;
$$;
REVOKE ALL ON FUNCTION public.confirmar_entrega_codigo(uuid, text, text, text, double precision, double precision, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.confirmar_entrega_codigo(uuid, text, text, text, double precision, double precision, integer) TO authenticated;

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
    'receptor_nombre', v_viaje.receptor_nombre,
    'receptor_rut', v_viaje.receptor_rut
  );
END;
$$;
REVOKE ALL ON FUNCTION public.codigo_entrega_carga(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.codigo_entrega_carga(uuid) TO authenticated;