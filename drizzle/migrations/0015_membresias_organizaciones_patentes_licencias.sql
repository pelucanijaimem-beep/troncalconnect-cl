CREATE TABLE public.organizaciones (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), propietario_id uuid NOT NULL UNIQUE, nombre text NOT NULL, segmento text NOT NULL CHECK (segmento IN ('transportista','dador')), plan text NOT NULL DEFAULT 'empresa_pyme' CHECK(plan IN ('camionero_solitario','flota_mediana','flota_enterprise','empresa_pyme','corporativo_premium')), created_at timestamptz NOT NULL DEFAULT now(), prueba_hasta timestamptz NOT NULL DEFAULT (now()+interval '1 month'), pago_hasta timestamptz, suscripcion_id text UNIQUE
);
GRANT SELECT ON public.organizaciones TO authenticated;
GRANT ALL ON public.organizaciones TO service_role;
ALTER TABLE public.organizaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY organizaciones_propietario ON public.organizaciones FOR SELECT TO authenticated USING(propietario_id=auth.uid());
CREATE TABLE public.organizacion_miembros (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organizacion_id uuid NOT NULL REFERENCES public.organizaciones(id), user_id uuid NOT NULL UNIQUE, activo boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.organizacion_miembros TO authenticated;
GRANT ALL ON public.organizacion_miembros TO service_role;
ALTER TABLE public.organizacion_miembros ENABLE ROW LEVEL SECURITY;
CREATE POLICY miembros_propios ON public.organizacion_miembros FOR SELECT TO authenticated USING(user_id=auth.uid() OR EXISTS(SELECT 1 FROM public.organizaciones o WHERE o.id=organizacion_id AND o.propietario_id=auth.uid()));
CREATE TABLE public.organizacion_camiones (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organizacion_id uuid NOT NULL REFERENCES public.organizaciones(id), patente text NOT NULL UNIQUE CHECK(patente ~ '^([A-Z]{2}[0-9]{4}|[B-DF-HJ-LP-RT-VW-Z]{4}[0-9]{2})$'), created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.organizacion_camiones TO authenticated;
GRANT ALL ON public.organizacion_camiones TO service_role;
ALTER TABLE public.organizacion_camiones ENABLE ROW LEVEL SECURITY;
CREATE POLICY camiones_propietario ON public.organizacion_camiones FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.organizaciones o WHERE o.id=organizacion_id AND o.propietario_id=auth.uid()));
CREATE TABLE public.configuracion_membresias (clave text PRIMARY KEY, lanzamiento_flotas boolean NOT NULL DEFAULT true);
GRANT ALL ON public.configuracion_membresias TO service_role;
ALTER TABLE public.configuracion_membresias ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.mi_membresia() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.organizaciones%ROWTYPE; n integer; lic integer; precio integer; fundador boolean;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Inicia sesión para continuar'; END IF;
 SELECT org.* INTO o FROM public.organizaciones org JOIN public.organizacion_miembros m ON m.organizacion_id=org.id WHERE m.user_id=auth.uid() AND m.activo;
 IF NOT FOUND THEN RETURN NULL; END IF;
 SELECT count(*)::integer INTO n FROM public.organizacion_camiones WHERE organizacion_id=o.id;
 SELECT count(*)::integer INTO lic FROM public.organizacion_miembros WHERE organizacion_id=o.id AND activo;
 SELECT p.fundador INTO fundador FROM public.perfiles p WHERE p.id=o.propietario_id;
 precio:=CASE WHEN o.segmento='transportista' THEN CASE WHEN n<=1 THEN 0 WHEN n<=20 THEN n*4990 ELSE n*3500 END WHEN o.plan='empresa_pyme' THEN 49990 ELSE lic*149990 END;
 RETURN jsonb_build_object('id',o.id,'nombre',o.nombre,'segmento',o.segmento,'plan',o.plan,'propietario',o.propietario_id=auth.uid(),'camiones',n,'licencias',lic,'total_clp',precio,'fundador',coalesce(fundador,false),'total_fundador_clp',CASE WHEN fundador THEN round(precio*0.8) ELSE precio END,'prueba_hasta',o.prueba_hasta,'pago_hasta',o.pago_hasta,'suscripcion_id',o.suscripcion_id,'camiones_detalle',CASE WHEN o.propietario_id=auth.uid() THEN (SELECT coalesce(jsonb_agg(jsonb_build_object('id',c.id,'patente',c.patente)),'[]'::jsonb) FROM public.organizacion_camiones c WHERE c.organizacion_id=o.id) ELSE '[]'::jsonb END,'miembros_detalle',CASE WHEN o.propietario_id=auth.uid() THEN (SELECT coalesce(jsonb_agg(jsonb_build_object('id',m.id,'user_id',m.user_id,'activo',m.activo)),'[]'::jsonb) FROM public.organizacion_miembros m WHERE m.organizacion_id=o.id) ELSE '[]'::jsonb END);
END $$;
REVOKE ALL ON FUNCTION public.mi_membresia() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.mi_membresia() TO authenticated,service_role;
CREATE FUNCTION public.gestionar_membresia(p_accion text,p_valor text DEFAULT '') RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
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
   UPDATE public.organizaciones SET plan=CASE WHEN n<=1 THEN 'camionero_solitario' WHEN n<=20 THEN 'flota_mediana' ELSE 'flota_enterprise' END WHERE id=o.id;
  END IF;
 END IF;
 RETURN public.mi_membresia();
END $$;
REVOKE ALL ON FUNCTION public.gestionar_membresia(text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.gestionar_membresia(text,text) TO authenticated,service_role;
CREATE OR REPLACE FUNCTION public.tiene_plan_activo(_user_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM public.perfiles p WHERE p.id=_user_id AND NOT p.bloqueado AND (p.plan_activo OR EXISTS(SELECT 1 FROM public.organizaciones o JOIN public.organizacion_miembros m ON m.organizacion_id=o.id WHERE m.user_id=p.id AND m.activo AND (o.pago_hasta>now() OR (o.segmento='dador' AND o.prueba_hasta>now()) OR (o.segmento='transportista' AND ((SELECT count(*) FROM public.organizacion_camiones c WHERE c.organizacion_id=o.id)=1 OR coalesce((SELECT lanzamiento_flotas FROM public.configuracion_membresias WHERE clave='lanzamiento'),true)))))));
$$;
CREATE OR REPLACE FUNCTION public.validar_limite_publicaciones() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.organizaciones%ROWTYPE; limite integer; usadas integer; tier text;
BEGIN
 SELECT org.* INTO o FROM public.organizaciones org JOIN public.organizacion_miembros m ON m.organizacion_id=org.id WHERE m.user_id=NEW.user_id AND m.activo FOR UPDATE OF org;
 IF FOUND THEN
  IF o.segmento<>'dador' THEN RAISE EXCEPTION 'Solo los dadores de carga pueden publicar fletes'; END IF;
  IF NOT public.tiene_plan_activo(NEW.user_id) THEN RAISE EXCEPTION 'Activa tu membresía para publicar cargas'; END IF;
  IF o.plan='corporativo_premium' THEN RETURN NEW; END IF;
  SELECT count(*) INTO usadas FROM public.cargas c WHERE c.user_id IN(SELECT user_id FROM public.organizacion_miembros WHERE organizacion_id=o.id) AND c.created_at>=date_trunc('month',now() AT TIME ZONE 'America/Santiago') AT TIME ZONE 'America/Santiago';
  IF usadas>=10 THEN RAISE EXCEPTION 'LIMITE_PLAN:10:empresa_pyme'; END IF;
 ELSE
  SELECT plan_tier INTO tier FROM public.perfiles WHERE id=NEW.user_id FOR UPDATE;
  limite:=public.limite_publicaciones_mes(coalesce(tier,'inicial'));
  IF limite IS NOT NULL AND public.cargas_publicadas_mes_actual(NEW.user_id)>=limite THEN RAISE EXCEPTION 'LIMITE_PLAN:%:%',limite,coalesce(tier,'inicial'); END IF;
 END IF;
 RETURN NEW;
END $$;