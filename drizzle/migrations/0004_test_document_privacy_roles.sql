DO $$
DECLARE cantidad bigint;
BEGIN
  PERFORM set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO cantidad FROM storage.objects WHERE bucket_id = 'documentos';
  RESET ROLE;
  IF cantidad <> 0 THEN RAISE EXCEPTION 'Un usuario sin rol administrador pudo leer archivos documentales'; END IF;
END;
$$;

DO $$
DECLARE cantidad bigint;
BEGIN
  SET LOCAL ROLE anon;
  SELECT count(*) INTO cantidad FROM storage.objects WHERE bucket_id = 'documentos';
  RESET ROLE;
  IF cantidad <> 0 THEN RAISE EXCEPTION 'Un visitante pudo leer archivos documentales'; END IF;
END;
$$;

DO $$
DECLARE admin_id uuid; esperados bigint; accesibles bigint;
BEGIN
  SELECT user_id INTO admin_id FROM public.user_roles WHERE role = 'admin' LIMIT 1;
  IF admin_id IS NULL THEN RAISE EXCEPTION 'Falta administrador para probar acceso documental'; END IF;
  SELECT count(*) INTO esperados FROM storage.objects WHERE bucket_id = 'documentos';
  PERFORM set_config('request.jwt.claim.sub', admin_id::text, true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO accesibles FROM storage.objects WHERE bucket_id = 'documentos';
  RESET ROLE;
  IF accesibles <> esperados THEN RAISE EXCEPTION 'El administrador no puede revisar todos los archivos'; END IF;
END;
$$;

DO $$
DECLARE propietario uuid; accesibles bigint;
BEGIN
  FOR propietario IN SELECT DISTINCT v.user_id FROM public.verificaciones v WHERE NOT public.tiene_rol(v.user_id, 'admin'::public.app_role) LOOP
    PERFORM set_config('request.jwt.claim.sub', propietario::text, true);
    SET LOCAL ROLE authenticated;
    SELECT count(*) INTO accesibles FROM storage.objects WHERE bucket_id = 'documentos';
    RESET ROLE;
    IF accesibles <> 0 THEN RAISE EXCEPTION 'El dueño no administrador pudo leer archivos'; END IF;
  END LOOP;
END;
$$;