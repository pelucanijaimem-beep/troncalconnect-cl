DO $$
BEGIN
  IF NOT public.rut_chileno_valido('12.345.678-5') THEN RAISE EXCEPTION 'Falló RUT válido'; END IF;
  IF public.rut_chileno_valido('12.345.678-9') THEN RAISE EXCEPTION 'Aceptó DV incorrecto'; END IF;
  IF public.rut_chileno_valido('') THEN RAISE EXCEPTION 'Aceptó RUT vacío'; END IF;
  IF NOT public.rut_chileno_valido('6.000.000-K') OR NOT public.rut_chileno_valido('6000000k') THEN RAISE EXCEPTION 'Falló normalización K'; END IF;
  IF public.rut_chileno_valido('abc123456785') OR public.rut_chileno_valido('00000000-0') THEN RAISE EXCEPTION 'Aceptó formato inválido'; END IF;
END;
$$;