INSERT INTO public.estado_acceso_ia (funcion, mensaje, estado)
VALUES ('voz_ruta', 'El copiloto por voz estará disponible próximamente.', 423)
ON CONFLICT (funcion) DO NOTHING;