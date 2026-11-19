CREATE OR REPLACE FUNCTION public.mi_consumo_publicaciones()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE o public.organizaciones%ROWTYPE; scope uuid; plan_actual text; usado integer; importe numeric; extras integer;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Inicia sesión para continuar'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.perfiles WHERE id=auth.uid() AND NOT bloqueado AND rol='empresa') THEN RETURN NULL; END IF;
 SELECT org.* INTO o FROM public.organizaciones org JOIN public.organizacion_miembros m ON m.organizacion_id=org.id WHERE m.user_id=auth.uid() AND m.activo;
 scope:=coalesce(o.id,auth.uid()); plan_actual:=coalesce(o.plan_uf,'generador_starter');
 SELECT coalesce(max(ordinal),0),coalesce(sum(importe_uf),0),count(*) FILTER(WHERE importe_uf>0) INTO usado,importe,extras FROM public.publicaciones_uso WHERE facturacion_id=scope AND mes=date_trunc('month',now() AT TIME ZONE 'America/Santiago')::date;
 -- All generator plans are unlimited with no per-publication charge.
 RETURN jsonb_build_object('plan',plan_actual,'publicadas',usado,'incluidas',NULL,'excedentes',extras,'importe_uf',importe,'adicional_uf',0,'siguiente_adicional',false,'mes',date_trunc('month',now() AT TIME ZONE 'America/Santiago')::date);
END $function$;

CREATE OR REPLACE FUNCTION public.registrar_publicacion_uf()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE o public.organizaciones%ROWTYPE; scope uuid; mes_actual date; n integer; plan_actual text; es_fundador boolean;
BEGIN
 SELECT org.* INTO o FROM public.organizaciones org JOIN public.organizacion_miembros m ON m.organizacion_id=org.id WHERE m.user_id=NEW.user_id AND m.activo FOR UPDATE OF org;
 scope:=coalesce(o.id,NEW.user_id); plan_actual:=coalesce(o.plan_uf,'generador_starter');
 mes_actual:=date_trunc('month',now() AT TIME ZONE 'America/Santiago')::date;
 SELECT coalesce(fundador,false) INTO es_fundador FROM public.perfiles WHERE id=coalesce(o.propietario_id,NEW.user_id);
 INSERT INTO public.publicaciones_contadores(facturacion_id,mes,cantidad) VALUES(scope,mes_actual,1) ON CONFLICT(facturacion_id,mes) DO UPDATE SET cantidad=public.publicaciones_contadores.cantidad+1 RETURNING cantidad INTO n;
 -- Usage is still recorded, but every generator plan is unlimited: no included cap, rate 0, amount 0.
 INSERT INTO public.publicaciones_uso(carga_id,organizacion_id,facturacion_id,user_id,mes,ordinal,plan,incluidas,tarifa_uf,importe_uf,fundador) VALUES(NEW.id,o.id,scope,NEW.user_id,mes_actual,n,plan_actual,NULL,0,0,coalesce(es_fundador,false));
 RETURN NEW;
END $function$;