CREATE OR REPLACE FUNCTION public.registrar_sesion_identidad_v2(p_session uuid, p_user uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p public.perfiles%ROWTYPE;
BEGIN
 IF auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'Acceso restringido'; END IF;
 SELECT * INTO p FROM public.perfiles WHERE id = p_user FOR UPDATE;
 IF NOT FOUND OR p.bloqueado THEN RAISE EXCEPTION 'Cuenta no disponible'; END IF;
 INSERT INTO public.sesiones_identidad(session_id,user_id,entorno) VALUES(p_session,p_user,'live');
 INSERT INTO public.verificaciones(user_id,nombre,estado,didit_session_id,didit_estado,didit_rut_extraido,didit_nombre_completo,didit_decision,didit_actualizado_at)
 VALUES(p_user,p.nombre,'pendiente',p_session::text,'in_progress',NULL,NULL,NULL,now())
 ON CONFLICT(user_id) DO UPDATE SET didit_session_id=EXCLUDED.didit_session_id,didit_estado=EXCLUDED.didit_estado,didit_rut_extraido=NULL,didit_nombre_completo=NULL,didit_decision=NULL,didit_actualizado_at=now();
END; $$;
REVOKE ALL ON FUNCTION public.registrar_sesion_identidad_v2(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.registrar_sesion_identidad_v2(uuid,uuid) TO service_role;
CREATE OR REPLACE FUNCTION public.procesar_identidad_v2(p_session uuid,p_event uuid,p_fecha bigint,p_entorno text,p_estado text,p_decision jsonb) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE s public.sesiones_identidad%ROWTYPE; v public.verificaciones%ROWTYPE; documento jsonb; rut text; nombre text; revision boolean;
BEGIN
 IF auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'Acceso restringido'; END IF;
 SELECT * INTO s FROM public.sesiones_identidad WHERE session_id=p_session FOR UPDATE;
 IF NOT FOUND OR s.entorno<>p_entorno THEN RETURN 'sin_vinculo'; END IF;
 IF p_event=ANY(s.eventos) THEN RETURN 'duplicado'; END IF;
 IF p_fecha<s.ultimo_evento THEN RETURN 'antiguo'; END IF;
 UPDATE public.sesiones_identidad SET estado=p_estado,ultimo_evento=p_fecha,eventos=array_append(eventos,p_event) WHERE session_id=p_session;
 IF p_entorno<>'live' THEN RETURN 'prueba'; END IF;
 SELECT * INTO v FROM public.verificaciones WHERE user_id=s.user_id FOR UPDATE;
 IF NOT FOUND OR v.didit_session_id IS DISTINCT FROM p_session::text THEN RETURN 'sesion_reemplazada'; END IF;
 documento := p_decision->'id_verifications'->0;
 rut := coalesce(nullif(btrim(documento->>'personal_number'),''),nullif(btrim(documento->>'document_number'),''));
 nombre := coalesce(nullif(btrim(documento->>'full_name'),''),nullif(btrim(concat_ws(' ',documento->>'first_name',documento->>'last_name')),''));
 UPDATE public.verificaciones SET didit_estado=p_estado,
 didit_rut_extraido=CASE WHEN documento IS NOT NULL THEN rut ELSE didit_rut_extraido END,
 didit_nombre_completo=CASE WHEN documento IS NOT NULL THEN nombre ELSE didit_nombre_completo END,
 didit_decision=coalesce(p_decision,didit_decision),didit_actualizado_at=now()
 WHERE user_id=s.user_id RETURNING * INTO v;
 UPDATE public.sesiones_identidad SET rut_coincide=v.didit_rut_coincide WHERE session_id=p_session;
 IF p_estado='approved' OR p_estado IN ('declined','expired','kyc_expired') THEN
 revision := p_estado<>'approved' OR v.didit_rut_coincide IS DISTINCT FROM true OR NOT public.rut_chileno_valido(coalesce(v.didit_rut_extraido,''));
 UPDATE public.verificaciones SET requiere_revision_manual=revision,
 estado=CASE WHEN revision THEN 'pendiente' ELSE estado END WHERE user_id=s.user_id;
 IF revision THEN
 UPDATE public.perfiles SET verificado=false WHERE id=s.user_id;
 INSERT INTO public.alertas_internas(tipo,user_id,detalle,datos) VALUES('identidad_revision',s.user_id,'Requiere revisión manual de identidad.',jsonb_build_object('session_id',p_session,'event_id',p_event));
 END IF;
 END IF;
 RETURN 'procesado';
END; $$;
REVOKE ALL ON FUNCTION public.procesar_identidad_v2(uuid,uuid,bigint,text,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.procesar_identidad_v2(uuid,uuid,bigint,text,text,jsonb) TO service_role;