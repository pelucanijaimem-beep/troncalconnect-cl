ALTER TABLE public.organizaciones ADD COLUMN plan_uf text NOT NULL DEFAULT 'generador_starter' CHECK(plan_uf IN ('generador_starter','generador_pro','generador_enterprise'));
UPDATE public.organizaciones SET plan_uf='generador_pro' WHERE segmento='dador' AND plan='corporativo_premium';
CREATE TABLE public.publicaciones_uso (carga_id uuid PRIMARY KEY, organizacion_id uuid, facturacion_id uuid NOT NULL, user_id uuid NOT NULL, mes date NOT NULL, publicada_at timestamptz NOT NULL DEFAULT now(), ordinal integer NOT NULL, plan text NOT NULL, incluidas integer, tarifa_uf numeric(12,4) NOT NULL DEFAULT 0, importe_uf numeric(12,4) NOT NULL DEFAULT 0, fundador boolean NOT NULL DEFAULT false, historica boolean NOT NULL DEFAULT false);
GRANT SELECT ON public.publicaciones_uso TO authenticated;
GRANT ALL ON public.publicaciones_uso TO service_role;
ALTER TABLE public.publicaciones_uso ENABLE ROW LEVEL SECURITY;
CREATE POLICY uso_propietario_admin ON public.publicaciones_uso FOR SELECT TO authenticated USING (user_id=auth.uid() OR EXISTS(SELECT 1 FROM public.organizaciones o WHERE o.id=organizacion_id AND o.propietario_id=auth.uid()) OR public.tiene_rol(auth.uid(),'admin'::public.app_role));
CREATE TABLE public.publicaciones_contadores (facturacion_id uuid NOT NULL, mes date NOT NULL, cantidad integer NOT NULL DEFAULT 0, PRIMARY KEY(facturacion_id,mes));
GRANT ALL ON public.publicaciones_contadores TO service_role;
ALTER TABLE public.publicaciones_contadores ENABLE ROW LEVEL SECURITY;
INSERT INTO public.publicaciones_uso(carga_id,organizacion_id,facturacion_id,user_id,mes,publicada_at,ordinal,plan,incluidas,historica)
SELECT c.id,o.id,coalesce(o.id,c.user_id),c.user_id,(c.created_at AT TIME ZONE 'America/Santiago')::date-date_part('day',c.created_at AT TIME ZONE 'America/Santiago')::integer+1,c.created_at,row_number() OVER(PARTITION BY coalesce(o.id,c.user_id),date_trunc('month',c.created_at AT TIME ZONE 'America/Santiago') ORDER BY c.created_at,c.id)::integer,coalesce(o.plan_uf,'generador_starter'),CASE WHEN o.plan_uf='generador_pro' THEN 60 WHEN o.plan_uf='generador_enterprise' THEN NULL ELSE 15 END,true
FROM public.cargas c LEFT JOIN public.organizacion_miembros m ON m.user_id=c.user_id AND m.activo LEFT JOIN public.organizaciones o ON o.id=m.organizacion_id AND o.segmento='dador';
INSERT INTO public.publicaciones_contadores SELECT facturacion_id,mes,max(ordinal) FROM public.publicaciones_uso GROUP BY facturacion_id,mes;
CREATE OR REPLACE FUNCTION public.validar_limite_publicaciones() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.organizaciones%ROWTYPE; p public.perfiles%ROWTYPE;
BEGIN
 SELECT * INTO p FROM public.perfiles WHERE id=NEW.user_id FOR UPDATE;
 IF NOT FOUND OR p.bloqueado OR p.rol<>'empresa' THEN RAISE EXCEPTION 'Cuenta no disponible para publicar cargas'; END IF;
 SELECT org.* INTO o FROM public.organizaciones org JOIN public.organizacion_miembros m ON m.organizacion_id=org.id WHERE m.user_id=NEW.user_id AND m.activo FOR UPDATE OF org;
 IF FOUND AND (o.segmento<>'dador' OR NOT public.tiene_plan_activo(NEW.user_id)) THEN RAISE EXCEPTION 'Activa tu membresía para publicar cargas'; END IF;
 RETURN NEW;
END $$;
CREATE FUNCTION public.registrar_publicacion_uf() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.organizaciones%ROWTYPE; scope uuid; mes_actual date; n integer; incluido integer; tarifa numeric; plan_actual text; es_fundador boolean;
BEGIN
 SELECT org.* INTO o FROM public.organizaciones org JOIN public.organizacion_miembros m ON m.organizacion_id=org.id WHERE m.user_id=NEW.user_id AND m.activo FOR UPDATE OF org;
 scope:=coalesce(o.id,NEW.user_id); plan_actual:=coalesce(o.plan_uf,'generador_starter');
 mes_actual:=date_trunc('month',now() AT TIME ZONE 'America/Santiago')::date;
 incluido:=CASE plan_actual WHEN 'generador_starter' THEN 15 WHEN 'generador_pro' THEN 60 ELSE NULL END;
 tarifa:=CASE plan_actual WHEN 'generador_starter' THEN 0.03 WHEN 'generador_pro' THEN 0.02 ELSE 0 END;
 SELECT coalesce(fundador,false) INTO es_fundador FROM public.perfiles WHERE id=coalesce(o.propietario_id,NEW.user_id);
 INSERT INTO public.publicaciones_contadores(facturacion_id,mes,cantidad) VALUES(scope,mes_actual,1) ON CONFLICT(facturacion_id,mes) DO UPDATE SET cantidad=public.publicaciones_contadores.cantidad+1 RETURNING cantidad INTO n;
 INSERT INTO public.publicaciones_uso(carga_id,organizacion_id,facturacion_id,user_id,mes,ordinal,plan,incluidas,tarifa_uf,importe_uf,fundador) VALUES(NEW.id,o.id,scope,NEW.user_id,mes_actual,n,plan_actual,incluido,tarifa,CASE WHEN n>incluido THEN tarifa*CASE WHEN es_fundador THEN 0.8 ELSE 1 END ELSE 0 END,coalesce(es_fundador,false));
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.registrar_publicacion_uf() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER cargas_registrar_uso_uf AFTER INSERT ON public.cargas FOR EACH ROW EXECUTE FUNCTION public.registrar_publicacion_uf();
CREATE FUNCTION public.mi_consumo_publicaciones() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.organizaciones%ROWTYPE; scope uuid; plan_actual text; usado integer; incluido integer; importe numeric; extras integer;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Inicia sesión para continuar'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.perfiles WHERE id=auth.uid() AND NOT bloqueado AND rol='empresa') THEN RETURN NULL; END IF;
 SELECT org.* INTO o FROM public.organizaciones org JOIN public.organizacion_miembros m ON m.organizacion_id=org.id WHERE m.user_id=auth.uid() AND m.activo;
 scope:=coalesce(o.id,auth.uid()); plan_actual:=coalesce(o.plan_uf,'generador_starter');
 incluido:=CASE plan_actual WHEN 'generador_starter' THEN 15 WHEN 'generador_pro' THEN 60 ELSE NULL END;
 SELECT coalesce(max(ordinal),0),coalesce(sum(importe_uf),0),count(*) FILTER(WHERE importe_uf>0) INTO usado,importe,extras FROM public.publicaciones_uso WHERE facturacion_id=scope AND mes=date_trunc('month',now() AT TIME ZONE 'America/Santiago')::date;
 RETURN jsonb_build_object('plan',plan_actual,'publicadas',usado,'incluidas',incluido,'excedentes',extras,'importe_uf',importe,'adicional_uf',CASE plan_actual WHEN 'generador_starter' THEN 0.03 WHEN 'generador_pro' THEN 0.02 ELSE 0 END,'siguiente_adicional',incluido IS NOT NULL AND usado>=incluido,'mes',date_trunc('month',now() AT TIME ZONE 'America/Santiago')::date);
END $$;
REVOKE ALL ON FUNCTION public.mi_consumo_publicaciones() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.mi_consumo_publicaciones() TO authenticated,service_role;
CREATE FUNCTION public.mi_membresia_uf() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE resumen jsonb; o public.organizaciones%ROWTYPE; n integer; base numeric;
BEGIN
 resumen:=public.mi_membresia(); IF resumen IS NULL THEN RETURN NULL; END IF;
 SELECT * INTO o FROM public.organizaciones WHERE id=(resumen->>'id')::uuid;
 n:=(resumen->>'camiones')::integer;
 base:=CASE WHEN o.segmento='transportista' THEN CASE WHEN n<=1 THEN 0 WHEN n<=20 THEN n*0.121 ELSE n*0.0848 END ELSE CASE o.plan_uf WHEN 'generador_starter' THEN 1.3 WHEN 'generador_pro' THEN 3.2 ELSE 10 END END;
 RETURN (resumen-'total_clp'-'total_fundador_clp')||jsonb_build_object('plan',CASE WHEN o.segmento='dador' THEN o.plan_uf ELSE o.plan END,'total_uf',base,'total_fundador_uf',CASE WHEN (resumen->>'fundador')::boolean THEN base*0.8 ELSE base END,'consumo',public.mi_consumo_publicaciones());
END $$;
REVOKE ALL ON FUNCTION public.mi_membresia_uf() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.mi_membresia_uf() TO authenticated,service_role;
CREATE FUNCTION public.gestionar_membresia_uf(p_accion text,p_valor text DEFAULT '') RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.organizaciones%ROWTYPE;
BEGIN
 IF auth.uid() IS NULL OR NOT EXISTS(SELECT 1 FROM public.perfiles WHERE id=auth.uid() AND NOT bloqueado) THEN RAISE EXCEPTION 'Cuenta no disponible'; END IF;
 IF p_accion='plan' THEN
 SELECT * INTO o FROM public.organizaciones WHERE propietario_id=auth.uid() FOR UPDATE;
 IF NOT FOUND OR o.segmento<>'dador' OR p_valor NOT IN ('generador_starter','generador_pro') THEN RAISE EXCEPTION 'Coordina este plan por WhatsApp'; END IF;
 IF o.suscripcion_id IS NOT NULL THEN RAISE EXCEPTION 'Coordina el cambio de tu suscripción'; END IF;
 IF p_valor='generador_starter' AND (SELECT count(*) FROM public.organizacion_miembros WHERE organizacion_id=o.id AND activo)>1 THEN RAISE EXCEPTION 'Starter incluye un administrador'; END IF;
 UPDATE public.organizaciones SET plan_uf=p_valor,plan=CASE WHEN p_valor='generador_starter' THEN 'empresa_pyme' ELSE 'corporativo_premium' END WHERE id=o.id;
 ELSE PERFORM public.gestionar_membresia(p_accion,p_valor); END IF;
 RETURN public.mi_membresia_uf();
END $$;
REVOKE ALL ON FUNCTION public.gestionar_membresia_uf(text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.gestionar_membresia_uf(text,text) TO authenticated,service_role;
COMMENT ON FUNCTION public.mi_membresia() IS 'DEPRECATED pricing output: clients use mi_membresia_uf; retained for compatibility';