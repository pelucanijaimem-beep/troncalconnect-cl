CREATE TABLE public.sesiones_identidad (
 session_id uuid PRIMARY KEY,
 user_id uuid NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
 entorno text NOT NULL DEFAULT 'live' CHECK (entorno IN ('live','sandbox')),
 estado text NOT NULL DEFAULT 'pendiente',
 rut_coincide boolean,
 ultimo_evento bigint NOT NULL DEFAULT 0,
 eventos uuid[] NOT NULL DEFAULT '{}',
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.sesiones_identidad TO authenticated;
GRANT ALL ON public.sesiones_identidad TO service_role;
ALTER TABLE public.sesiones_identidad ENABLE ROW LEVEL SECURITY;
CREATE POLICY sesiones_identidad_admin ON public.sesiones_identidad FOR SELECT TO authenticated USING (public.tiene_rol(auth.uid(), 'admin'::public.app_role));
ALTER TABLE public.verificaciones ADD COLUMN requiere_revision_manual boolean NOT NULL DEFAULT false;
CREATE OR REPLACE FUNCTION public.proteger_revision_identidad() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF current_user NOT IN ('postgres','service_role') AND NOT public.tiene_rol(auth.uid(), 'admin'::public.app_role) THEN
  IF TG_OP = 'INSERT' THEN NEW.requiere_revision_manual := false;
  ELSE NEW.requiere_revision_manual := OLD.requiere_revision_manual; END IF;
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER proteger_revision_identidad_trg BEFORE INSERT OR UPDATE ON public.verificaciones FOR EACH ROW EXECUTE FUNCTION public.proteger_revision_identidad();
CREATE OR REPLACE FUNCTION public.procesar_resultado_identidad(p_session uuid, p_event uuid, p_fecha bigint, p_entorno text, p_estado text, p_rut text) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s public.sesiones_identidad%ROWTYPE; p public.perfiles%ROWTYPE; coincide boolean;
BEGIN
 SELECT * INTO s FROM public.sesiones_identidad WHERE session_id = p_session FOR UPDATE;
 IF NOT FOUND OR s.entorno <> p_entorno THEN RETURN 'sin_vinculo'; END IF;
 IF p_event = ANY(s.eventos) THEN RETURN 'duplicado'; END IF;
 IF p_fecha < s.ultimo_evento THEN RETURN 'antiguo'; END IF;
 SELECT * INTO p FROM public.perfiles WHERE id = s.user_id;
 coincide := p_estado = 'Approved' AND public.rut_chileno_valido(coalesce(p_rut,'')) AND lower(regexp_replace(p_rut, '[^0-9kK]', '', 'g')) = p.rut_normalizado;
 UPDATE public.sesiones_identidad SET estado = p_estado, rut_coincide = coincide, ultimo_evento = p_fecha, eventos = array_append(eventos,p_event) WHERE session_id = p_session;
 -- Las pruebas no alteran perfiles reales ni conceden el sello.
 IF p_entorno <> 'live' THEN RETURN 'prueba'; END IF;
 INSERT INTO public.verificaciones(user_id,nombre,estado,requiere_revision_manual)
 VALUES (p.id,p.nombre,'pendiente',NOT coincide)
 ON CONFLICT (user_id) DO UPDATE SET requiere_revision_manual = NOT coincide,
 estado = CASE WHEN NOT coincide THEN 'pendiente' ELSE public.verificaciones.estado END;
 IF NOT coincide THEN
  UPDATE public.perfiles SET verificado = false WHERE id = p.id;
  INSERT INTO public.alertas_internas(tipo,user_id,detalle,datos)
  VALUES ('identidad_revision',p.id,'Requiere revisión manual: identidad sin coincidencia válida con el RUT registrado.',jsonb_build_object('session_id',p_session,'event_id',p_event));
 END IF;
 RETURN CASE WHEN coincide THEN 'coincide' ELSE 'revision_manual' END;
END;
$$;
REVOKE ALL ON FUNCTION public.procesar_resultado_identidad(uuid,uuid,bigint,text,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.procesar_resultado_identidad(uuid,uuid,bigint,text,text,text) TO service_role;
CREATE OR REPLACE FUNCTION public.mi_verificacion_resumen() RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
 SELECT jsonb_build_object('nombre',v.nombre,'estado',v.estado,'asegurado',v.asegurado,'checklist',v.checklist,'updated_at',v.updated_at,
 'nota_admin',CASE WHEN v.requiere_revision_manual THEN '' ELSE v.nota_admin END,
 'revision_en_curso',v.requiere_revision_manual,
 'documentos',coalesce((SELECT jsonb_object_agg(d.key,true) FROM jsonb_each(v.documentos) d WHERE jsonb_typeof(d.value)='string' AND d.value <> '""'::jsonb),'{}'::jsonb))
 FROM public.verificaciones v WHERE v.user_id=auth.uid();
$$;