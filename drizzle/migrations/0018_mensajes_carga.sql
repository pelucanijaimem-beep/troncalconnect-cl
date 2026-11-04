CREATE TABLE public.mensajes_carga (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carga_id uuid NOT NULL REFERENCES public.cargas(id) ON DELETE CASCADE,
  transportista_id uuid NOT NULL,
  autor_id uuid NOT NULL,
  texto text NOT NULL CHECK (char_length(btrim(texto)) BETWEEN 1 AND 1000),
  leido boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX mensajes_carga_conv_idx ON public.mensajes_carga (carga_id, transportista_id, created_at);

GRANT SELECT, INSERT ON public.mensajes_carga TO authenticated;
GRANT ALL ON public.mensajes_carga TO service_role;
ALTER TABLE public.mensajes_carga ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.conversacion_permitida(_carga_id uuid, _transportista_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select exists (select 1 from public.postulaciones p where p.carga_id = _carga_id and p.user_id = _transportista_id)
    and (_user_id = _transportista_id or public.carga_es_mia(_carga_id, _user_id))
$$;

CREATE POLICY mensajes_carga_select_participantes ON public.mensajes_carga FOR SELECT TO authenticated
  USING (public.conversacion_permitida(carga_id, transportista_id, auth.uid()));
CREATE POLICY mensajes_carga_insert_participantes ON public.mensajes_carga FOR INSERT TO authenticated
  WITH CHECK (autor_id = auth.uid() AND leido = false AND public.conversacion_permitida(carga_id, transportista_id, auth.uid()));

CREATE OR REPLACE FUNCTION public.marcar_mensajes_leidos(p_carga uuid, p_transportista uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  update public.mensajes_carga set leido = true
  where carga_id = p_carga and transportista_id = p_transportista
    and autor_id <> auth.uid() and leido = false
    and public.conversacion_permitida(p_carga, p_transportista, auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.mis_conversaciones()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select coalesce(jsonb_agg(x order by x->>'ultimo_at' desc nulls last), '[]'::jsonb) from (
    select jsonb_build_object(
      'carga_id', c.id, 'transportista_id', p.user_id,
      'ruta', c.origen || ' → ' || c.destino,
      'soy_empresa', c.user_id = auth.uid(),
      'contraparte', case when c.user_id = auth.uid() then coalesce(pf.nombre, 'Transportista') else c.empresa end,
      'ultimo_texto', (select m.texto from public.mensajes_carga m where m.carga_id=c.id and m.transportista_id=p.user_id order by m.created_at desc limit 1),
      'ultimo_at', (select max(m.created_at) from public.mensajes_carga m where m.carga_id=c.id and m.transportista_id=p.user_id),
      'sin_leer', (select count(*) from public.mensajes_carga m where m.carga_id=c.id and m.transportista_id=p.user_id and m.autor_id <> auth.uid() and not m.leido)
    ) x
    from public.postulaciones p
    join public.cargas c on c.id = p.carga_id
    left join public.perfiles pf on pf.id = p.user_id
    where auth.uid() is not null and (p.user_id = auth.uid() or c.user_id = auth.uid())
  ) s
$$;

REVOKE ALL ON FUNCTION public.conversacion_permitida(uuid,uuid,uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.marcar_mensajes_leidos(uuid,uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.mis_conversaciones() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.conversacion_permitida(uuid,uuid,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.marcar_mensajes_leidos(uuid,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mis_conversaciones() TO authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.mensajes_carga;