ALTER TABLE public.organizacion_camiones ADD COLUMN IF NOT EXISTS gps_dispositivo_id text;
ALTER TABLE public.organizacion_camiones ADD CONSTRAINT organizacion_camiones_gps_formato CHECK (gps_dispositivo_id IS NULL OR gps_dispositivo_id ~ '^[A-Z0-9]{4,40}$');

CREATE OR REPLACE FUNCTION public.tiene_plan_activo(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 SELECT EXISTS(SELECT 1 FROM public.perfiles p WHERE p.id=_user_id AND NOT p.bloqueado AND (p.plan_activo OR EXISTS(SELECT 1 FROM public.organizaciones o JOIN public.organizacion_miembros m ON m.organizacion_id=o.id WHERE m.user_id=p.id AND m.activo AND (o.pago_hasta>now() OR (o.segmento='dador' AND o.prueba_hasta>now()) OR (o.segmento='transportista' AND ((SELECT count(*) FROM public.organizacion_camiones c WHERE c.organizacion_id=o.id)=1 OR o.prueba_hasta>now()))))));
$function$;

CREATE OR REPLACE FUNCTION public.mi_membresia()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE o public.organizaciones%ROWTYPE; n integer; lic integer; precio integer; fundador boolean;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Inicia sesión para continuar'; END IF;
 SELECT org.* INTO o FROM public.organizaciones org JOIN public.organizacion_miembros m ON m.organizacion_id=org.id WHERE m.user_id=auth.uid() AND m.activo;
 IF NOT FOUND THEN RETURN NULL; END IF;
 SELECT count(*)::integer INTO n FROM public.organizacion_camiones WHERE organizacion_id=o.id;
 SELECT count(*)::integer INTO lic FROM public.organizacion_miembros WHERE organizacion_id=o.id AND activo;
 SELECT p.fundador INTO fundador FROM public.perfiles p WHERE p.id=o.propietario_id;
 precio:=CASE WHEN o.segmento='transportista' THEN CASE WHEN n<=1 THEN 0 WHEN n<=20 THEN n*7990 ELSE n*4900 END WHEN o.plan='empresa_pyme' THEN 49990 ELSE lic*149990 END;
 RETURN jsonb_build_object('id',o.id,'nombre',o.nombre,'segmento',o.segmento,'plan',o.plan,'propietario',o.propietario_id=auth.uid(),'camiones',n,'licencias',lic,'total_clp',precio,'fundador',coalesce(fundador,false),'total_fundador_clp',precio,'prueba_hasta',o.prueba_hasta,'pago_hasta',o.pago_hasta,'suscripcion_id',o.suscripcion_id,'camiones_detalle',CASE WHEN o.propietario_id=auth.uid() THEN (SELECT coalesce(jsonb_agg(jsonb_build_object('id',c.id,'patente',c.patente,'gps_dispositivo_id',c.gps_dispositivo_id) ORDER BY c.created_at),'[]'::jsonb) FROM public.organizacion_camiones c WHERE c.organizacion_id=o.id) ELSE '[]'::jsonb END,'miembros_detalle',CASE WHEN o.propietario_id=auth.uid() THEN (SELECT coalesce(jsonb_agg(jsonb_build_object('id',m.id,'user_id',m.user_id,'activo',m.activo)),'[]'::jsonb) FROM public.organizacion_miembros m WHERE m.organizacion_id=o.id) ELSE '[]'::jsonb END);
END $function$;

CREATE OR REPLACE FUNCTION public.registrar_gps_camion(p_camion uuid, p_gps text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v text;
BEGIN
 IF auth.uid() IS NULL OR NOT EXISTS(SELECT 1 FROM public.perfiles WHERE id=auth.uid() AND NOT bloqueado) THEN RAISE EXCEPTION 'Cuenta no disponible'; END IF;
 v:=nullif(upper(regexp_replace(coalesce(p_gps,''),'[[:space:]-]','','g')),'');
 IF v IS NOT NULL AND v !~ '^[A-Z0-9]{4,40}$' THEN RAISE EXCEPTION 'Ingresa un ID o IMEI válido (solo letras y números, entre 4 y 40 caracteres)'; END IF;
 UPDATE public.organizacion_camiones c SET gps_dispositivo_id=v
  FROM public.organizaciones o
  WHERE c.id=p_camion AND c.organizacion_id=o.id AND o.propietario_id=auth.uid() AND o.segmento='transportista';
 IF NOT FOUND THEN RAISE EXCEPTION 'Solo el propietario puede registrar el GPS de sus camiones'; END IF;
 RETURN public.mi_membresia_uf();
END $function$;

REVOKE ALL ON FUNCTION public.registrar_gps_camion(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.registrar_gps_camion(uuid, text) TO authenticated, service_role;