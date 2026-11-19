ALTER TABLE public.organizaciones DROP CONSTRAINT IF EXISTS organizaciones_plan_check;
ALTER TABLE public.organizaciones ADD CONSTRAINT organizaciones_plan_check CHECK (plan = ANY (ARRAY['camionero_solitario','flota_mediana','flota_corporativa','flota_enterprise','empresa_pyme','corporativo_premium']));
UPDATE public.organizaciones SET plan='flota_corporativa' WHERE plan='flota_enterprise';

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
 RETURN jsonb_build_object('id',o.id,'nombre',o.nombre,'segmento',o.segmento,'plan',o.plan,'propietario',o.propietario_id=auth.uid(),'camiones',n,'licencias',lic,'total_clp',precio,'fundador',coalesce(fundador,false),'total_fundador_clp',precio,'prueba_hasta',o.prueba_hasta,'pago_hasta',o.pago_hasta,'suscripcion_id',o.suscripcion_id,'camiones_detalle',CASE WHEN o.propietario_id=auth.uid() THEN (SELECT coalesce(jsonb_agg(jsonb_build_object('id',c.id,'patente',c.patente)),'[]'::jsonb) FROM public.organizacion_camiones c WHERE c.organizacion_id=o.id) ELSE '[]'::jsonb END,'miembros_detalle',CASE WHEN o.propietario_id=auth.uid() THEN (SELECT coalesce(jsonb_agg(jsonb_build_object('id',m.id,'user_id',m.user_id,'activo',m.activo)),'[]'::jsonb) FROM public.organizacion_miembros m WHERE m.organizacion_id=o.id) ELSE '[]'::jsonb END);
END $function$;

CREATE OR REPLACE FUNCTION public.mi_membresia_uf()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE resumen jsonb; o public.organizaciones%ROWTYPE; n integer; base numeric;
BEGIN
 resumen:=public.mi_membresia(); IF resumen IS NULL THEN RETURN NULL; END IF;
 SELECT * INTO o FROM public.organizaciones WHERE id=(resumen->>'id')::uuid;
 n:=(resumen->>'camiones')::integer;
 base:=CASE WHEN o.segmento='transportista' THEN CASE WHEN n<=1 THEN 0 WHEN n<=20 THEN n*0.1937 ELSE n*0.1188 END ELSE CASE o.plan_uf WHEN 'generador_starter' THEN 1.3 WHEN 'generador_pro' THEN 3.2 ELSE 10 END END;
 RETURN (resumen-'total_clp'-'total_fundador_clp')||jsonb_build_object('plan',CASE WHEN o.segmento='dador' THEN o.plan_uf ELSE o.plan END,'total_uf',base,'total_fundador_uf',base,'consumo',public.mi_consumo_publicaciones());
END $function$;

CREATE OR REPLACE FUNCTION public.gestionar_membresia(p_accion text, p_valor text DEFAULT ''::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE o public.organizaciones%ROWTYPE; p public.perfiles%ROWTYPE; destino public.perfiles%ROWTYPE; n integer;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Inicia sesión para continuar'; END IF;
 SELECT * INTO p FROM public.perfiles WHERE id=auth.uid() FOR UPDATE;
 IF NOT FOUND OR p.bloqueado THEN RAISE EXCEPTION 'Cuenta no disponible'; END IF;
 SELECT * INTO o FROM public.organizaciones WHERE propietario_id=auth.uid() FOR UPDATE;
 IF p_accion='crear' THEN
  IF FOUND THEN RETURN public.mi_membresia(); END IF;
  IF EXISTS(SELECT 1 FROM public.organizacion_miembros WHERE user_id=auth.uid()) THEN RAISE EXCEPTION 'Ya perteneces a una organización'; END IF;
  INSERT INTO public.organizaciones(propietario_id,nombre,segmento,plan) VALUES(p.id,p.nombre,CASE WHEN p.rol='camionero' THEN 'transportista' ELSE 'dador' END,CASE WHEN p.rol='camionero' THEN 'camionero_solitario' ELSE 'empresa_pyme' END) RETURNING * INTO o;
  INSERT INTO public.organizacion_miembros(organizacion_id,user_id) VALUES(o.id,p.id);
 ELSE
  IF o.id IS NULL THEN RAISE EXCEPTION 'Solo el propietario puede gestionar la membresía'; END IF;
  IF o.suscripcion_id IS NOT NULL THEN RAISE EXCEPTION 'Coordina el cambio de tu suscripción antes de modificar unidades'; END IF;
  IF p_accion='camion' THEN
   IF o.segmento<>'transportista' THEN RAISE EXCEPTION 'Solo transportistas pueden registrar camiones'; END IF;
   p_valor:=upper(regexp_replace(p_valor,'[[:space:]-]','','g'));
   IF p_valor !~ '^([A-Z]{2}[0-9]{4}|[B-DF-HJ-LP-RT-VW-Z]{4}[0-9]{2})$' THEN RAISE EXCEPTION 'Ingresa una patente chilena válida'; END IF;
   INSERT INTO public.organizacion_camiones(organizacion_id,patente) VALUES(o.id,p_valor);
  ELSIF p_accion='quitar_camion' THEN
   DELETE FROM public.organizacion_camiones WHERE organizacion_id=o.id AND id=p_valor::uuid;
  ELSIF p_accion='plan' THEN
   IF o.segmento<>'dador' OR p_valor NOT IN ('empresa_pyme','corporativo_premium') THEN RAISE EXCEPTION 'Plan no disponible para tu tipo de cuenta'; END IF;
   IF p_valor='empresa_pyme' AND (SELECT count(*) FROM public.organizacion_miembros WHERE organizacion_id=o.id AND activo)>1 THEN RAISE EXCEPTION 'Empresa Pyme incluye solo un usuario'; END IF;
   UPDATE public.organizaciones SET plan=p_valor WHERE id=o.id;
  ELSIF p_accion='usuario' THEN
   IF o.segmento<>'dador' OR o.plan<>'corporativo_premium' THEN RAISE EXCEPTION 'Solo Corporativo Premium permite agregar licencias'; END IF;
   SELECT * INTO destino FROM public.perfiles WHERE lower(email)=lower(btrim(p_valor));
   IF NOT FOUND OR destino.bloqueado OR destino.rol<>'empresa' THEN RAISE EXCEPTION 'No hay una cuenta de dador disponible con ese correo'; END IF;
   IF EXISTS(SELECT 1 FROM public.organizacion_miembros WHERE user_id=destino.id AND organizacion_id<>o.id) THEN RAISE EXCEPTION 'La cuenta ya pertenece a otra organización'; END IF;
   INSERT INTO public.organizacion_miembros(organizacion_id,user_id) VALUES(o.id,destino.id) ON CONFLICT(user_id) DO UPDATE SET activo=true;
  ELSIF p_accion='quitar_usuario' THEN
   UPDATE public.organizacion_miembros SET activo=false WHERE organizacion_id=o.id AND id=p_valor::uuid AND user_id<>o.propietario_id;
  ELSE RAISE EXCEPTION 'Acción no disponible'; END IF;
  IF o.segmento='transportista' THEN
   SELECT count(*) INTO n FROM public.organizacion_camiones WHERE organizacion_id=o.id;
   UPDATE public.organizaciones SET plan=CASE WHEN n<=1 THEN 'camionero_solitario' WHEN n<=20 THEN 'flota_mediana' ELSE 'flota_corporativa' END WHERE id=o.id;
  END IF;
 END IF;
 RETURN public.mi_membresia();
END $function$;

CREATE OR REPLACE FUNCTION public.gps_viaje_obligatorio()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 SELECT auth.uid() IS NOT NULL AND EXISTS(
  SELECT 1 FROM public.organizaciones o
  JOIN public.organizacion_miembros m ON m.organizacion_id=o.id
  WHERE m.user_id=auth.uid() AND m.activo AND o.segmento='transportista'
    AND o.plan IN ('flota_mediana','flota_corporativa','flota_enterprise'))
$function$;
REVOKE ALL ON FUNCTION public.gps_viaje_obligatorio() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.gps_viaje_obligatorio() TO authenticated;