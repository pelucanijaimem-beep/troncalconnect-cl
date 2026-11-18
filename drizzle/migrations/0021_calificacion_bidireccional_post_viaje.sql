-- 1. Cierre del viaje: quién lo hizo y cuándo la empresa confirmó la entrega.
CREATE TABLE public.entregas_conformes (
  carga_id uuid PRIMARY KEY REFERENCES public.cargas(id) ON DELETE CASCADE,
  generador_id uuid NOT NULL,
  transportista_id uuid NOT NULL,
  confirmada_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.entregas_conformes TO authenticated;
GRANT ALL ON public.entregas_conformes TO service_role;
ALTER TABLE public.entregas_conformes ENABLE ROW LEVEL SECURITY;
CREATE POLICY entregas_conformes_select_partes ON public.entregas_conformes
  FOR SELECT TO authenticated
  USING (auth.uid() = generador_id OR auth.uid() = transportista_id OR public.tiene_rol(auth.uid(), 'admin'::app_role));

-- 2. Etiquetas rápidas y una calificación por parte y viaje.
ALTER TABLE public.calificaciones ADD COLUMN etiquetas text[] NOT NULL DEFAULT '{}';
CREATE UNIQUE INDEX calificaciones_una_por_parte_viaje
  ON public.calificaciones (carga_id, autor_id) WHERE carga_id IS NOT NULL;

-- 3. Escritura solo a través de las funciones validadas.
DROP POLICY IF EXISTS calificaciones_insert_own ON public.calificaciones;
DROP POLICY IF EXISTS calificaciones_update_own ON public.calificaciones;
DROP POLICY IF EXISTS calificaciones_delete_own_or_admin ON public.calificaciones;
CREATE POLICY calificaciones_delete_admin ON public.calificaciones
  FOR DELETE TO authenticated USING (public.tiene_rol(auth.uid(), 'admin'::app_role));
REVOKE INSERT, UPDATE, DELETE ON public.calificaciones FROM anon;
REVOKE SELECT ON public.calificaciones FROM anon;
REVOKE INSERT, UPDATE ON public.calificaciones FROM authenticated;
GRANT SELECT, DELETE ON public.calificaciones TO authenticated;
GRANT ALL ON public.calificaciones TO service_role;

-- 4. Etiquetas permitidas según a quién se califica.
CREATE OR REPLACE FUNCTION public.etiquetas_calificacion_validas(p_tipo text, p_etiquetas text[])
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT coalesce(array_length(p_etiquetas, 1), 0) <= 7
    AND (SELECT count(DISTINCT e) FROM unnest(p_etiquetas) e) = coalesce(array_length(p_etiquetas, 1), 0)
    AND p_etiquetas <@ CASE p_tipo
      WHEN 'a_empresa' THEN ARRAY[
        'Carga rápida en planta', 'Trato respetuoso', 'Datos exactos', 'Pago puntual',
        'Demora excesiva en carga/descarga', 'Cambio de condiciones', 'Atraso en pago']
      WHEN 'a_camionero' THEN ARRAY[
        'Puntual en carga y descarga', 'Carga impecable', 'GPS activo todo el viaje', 'Excelente comunicación',
        'Atraso en presentación', 'Falta de EPP/documentos', 'Poca comunicación']
      ELSE ARRAY[]::text[]
    END
$$;

-- 5. La empresa confirma "Entregado y Conforme" con el transportista que hizo el viaje.
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

-- 6. Calificar a la contraparte de un viaje entregado y conforme (una vez por parte).
CREATE OR REPLACE FUNCTION public.calificar_viaje(
  p_carga uuid, p_estrellas integer, p_etiquetas text[], p_comentario text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_entrega public.entregas_conformes%ROWTYPE;
  v_carga public.cargas%ROWTYPE;
  v_tipo text;
  v_evaluado uuid;
  v_evaluado_nombre text;
  v_autor_nombre text;
  v_comentario text := btrim(coalesce(p_comentario, ''));
  v_etiquetas text[] := coalesce(p_etiquetas, '{}');
  v_id uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Inicia sesión para calificar'; END IF;
  IF EXISTS (SELECT 1 FROM public.perfiles WHERE id = v_uid AND bloqueado) THEN
    RAISE EXCEPTION 'Tu cuenta está bloqueada';
  END IF;
  SELECT * INTO v_entrega FROM public.entregas_conformes WHERE carga_id = p_carga;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Solo puedes calificar viajes entregados y conformes';
  END IF;
  IF v_uid = v_entrega.generador_id THEN
    v_tipo := 'a_camionero'; v_evaluado := v_entrega.transportista_id;
  ELSIF v_uid = v_entrega.transportista_id THEN
    v_tipo := 'a_empresa'; v_evaluado := v_entrega.generador_id;
  ELSE
    RAISE EXCEPTION 'Solo las partes del viaje pueden calificarlo';
  END IF;
  IF p_estrellas IS NULL OR p_estrellas < 1 OR p_estrellas > 5 THEN
    RAISE EXCEPTION 'La calificación debe ser de 1 a 5 estrellas';
  END IF;
  IF char_length(v_comentario) > 280 THEN
    RAISE EXCEPTION 'El comentario admite hasta 280 caracteres';
  END IF;
  IF NOT public.etiquetas_calificacion_validas(v_tipo, v_etiquetas) THEN
    RAISE EXCEPTION 'Etiquetas no válidas para esta calificación';
  END IF;

  SELECT * INTO v_carga FROM public.cargas WHERE id = p_carga;
  SELECT nombre INTO v_autor_nombre FROM public.perfiles WHERE id = v_uid;
  IF v_tipo = 'a_empresa' THEN
    v_evaluado_nombre := coalesce(nullif(v_carga.empresa, ''), (SELECT nombre FROM public.perfiles WHERE id = v_evaluado));
  ELSE
    SELECT nombre INTO v_evaluado_nombre FROM public.perfiles WHERE id = v_evaluado;
  END IF;

  BEGIN
    INSERT INTO public.calificaciones (
      carga_id, autor_id, autor_nombre, evaluado_id, evaluado_nombre, tipo,
      estrellas, criterios, comentario, ruta, etiquetas
    ) VALUES (
      p_carga, v_uid, coalesce(v_autor_nombre, 'Usuario TroncalTrack'), v_evaluado,
      coalesce(v_evaluado_nombre, 'Usuario TroncalTrack'), v_tipo,
      p_estrellas, '{}'::jsonb, v_comentario, v_carga.origen || ' → ' || v_carga.destino, v_etiquetas
    ) RETURNING id INTO v_id;
  EXCEPTION WHEN unique_violation THEN
    RAISE EXCEPTION 'Ya calificaste este viaje';
  END;
  RETURN v_id;
END;
$$;
REVOKE ALL ON FUNCTION public.calificar_viaje(uuid, integer, text[], text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.calificar_viaje(uuid, integer, text[], text) TO authenticated;

-- 7. Reputación agregada (solo promedio y cantidad de viajes calificados).
CREATE OR REPLACE FUNCTION public.reputacion_usuarios()
RETURNS TABLE(evaluado_id uuid, promedio numeric, total integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.evaluado_id, round(avg(c.estrellas)::numeric, 1), count(*)::integer
  FROM public.calificaciones c
  WHERE c.evaluado_id IS NOT NULL AND c.carga_id IS NOT NULL
  GROUP BY c.evaluado_id
$$;
REVOKE ALL ON FUNCTION public.reputacion_usuarios() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reputacion_usuarios() TO anon, authenticated;

-- 8. Últimas reseñas recibidas por un usuario.
CREATE OR REPLACE FUNCTION public.resenas_recibidas(p_id uuid, p_limite integer DEFAULT 5)
RETURNS TABLE(id uuid, tipo text, estrellas integer, etiquetas text[], comentario text, ruta text, autor_nombre text, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.tipo, c.estrellas, c.etiquetas, c.comentario, c.ruta, c.autor_nombre, c.created_at
  FROM public.calificaciones c
  WHERE c.evaluado_id = p_id AND c.carga_id IS NOT NULL
    AND auth.uid() IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.bloqueado)
  ORDER BY c.created_at DESC
  LIMIT least(greatest(coalesce(p_limite, 5), 1), 20)
$$;
REVOKE ALL ON FUNCTION public.resenas_recibidas(uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.resenas_recibidas(uuid, integer) TO authenticated;

-- 9. Viajes entregados y conformes que el usuario aún no califica.
CREATE OR REPLACE FUNCTION public.mis_calificaciones_pendientes()
RETURNS TABLE(carga_id uuid, tipo text, contraparte text, ruta text, confirmada_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.carga_id,
         CASE WHEN e.generador_id = auth.uid() THEN 'a_camionero' ELSE 'a_empresa' END,
         CASE WHEN e.generador_id = auth.uid()
              THEN coalesce((SELECT p.nombre FROM public.perfiles p WHERE p.id = e.transportista_id), 'Transportista')
              ELSE coalesce(nullif(c.empresa, ''), 'Empresa generadora') END,
         c.origen || ' → ' || c.destino,
         e.confirmada_at
  FROM public.entregas_conformes e
  JOIN public.cargas c ON c.id = e.carga_id
  WHERE auth.uid() IN (e.generador_id, e.transportista_id)
    AND NOT EXISTS (
      SELECT 1 FROM public.calificaciones k WHERE k.carga_id = e.carga_id AND k.autor_id = auth.uid()
    )
  ORDER BY e.confirmada_at DESC
  LIMIT 20
$$;
REVOKE ALL ON FUNCTION public.mis_calificaciones_pendientes() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mis_calificaciones_pendientes() TO authenticated;