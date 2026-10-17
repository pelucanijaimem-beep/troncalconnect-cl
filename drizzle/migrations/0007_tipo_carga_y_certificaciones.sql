-- 1. Tipo de carga en las publicaciones (las existentes quedan como 'general')
ALTER TABLE public.cargas ADD COLUMN tipo_carga text NOT NULL DEFAULT 'general';
ALTER TABLE public.cargas ADD CONSTRAINT cargas_tipo_carga_check
  CHECK (tipo_carga IN ('general', 'peligrosa', 'forestal'));

-- 2. Declaración de inducción forestal del transportista (sin aprobación de admin)
ALTER TABLE public.perfiles ADD COLUMN induccion_forestal boolean NOT NULL DEFAULT false;
ALTER TABLE public.perfiles ADD COLUMN induccion_forestal_empresa text;
ALTER TABLE public.perfiles ADD COLUMN induccion_forestal_fecha date;

-- 3. Datos del certificado ChileValora de sustancias peligrosas (aprobado por admin vía checklist)
ALTER TABLE public.verificaciones ADD COLUMN chilevalora_numero text;
ALTER TABLE public.verificaciones ADD COLUMN chilevalora_vigencia date;

-- 4. Insignias públicas del transportista: solo estados, nunca documentos ni números
CREATE OR REPLACE FUNCTION public.insignias_transportista(p_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'peligrosas', EXISTS (
      SELECT 1 FROM public.verificaciones v
      WHERE v.user_id = p_id
        AND v.checklist -> 'chilevalora_peligrosas' ->> 'estado' = 'aprobado'
        AND (v.chilevalora_vigencia IS NULL OR v.chilevalora_vigencia >= CURRENT_DATE)
    ),
    'forestal', COALESCE(
      (SELECT p.induccion_forestal FROM public.perfiles p WHERE p.id = p_id),
      false
    )
  )
$$;

GRANT EXECUTE ON FUNCTION public.insignias_transportista(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.insignias_transportista(uuid) TO service_role;

-- 5. Resumen del propio certificado ChileValora (solo el dueño; sin rutas de archivo)
CREATE OR REPLACE FUNCTION public.mi_chilevalora()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT jsonb_build_object(
       'numero', v.chilevalora_numero,
       'vigencia', v.chilevalora_vigencia,
       'estado', COALESCE(v.checklist -> 'chilevalora_peligrosas' ->> 'estado', 'pendiente'),
       'adjuntado', (v.documentos ? 'chilevalora_peligrosas')
     )
     FROM public.verificaciones v
     WHERE v.user_id = auth.uid()),
    jsonb_build_object('numero', null, 'vigencia', null, 'estado', 'pendiente', 'adjuntado', false)
  )
$$;

GRANT EXECUTE ON FUNCTION public.mi_chilevalora() TO authenticated;
GRANT EXECUTE ON FUNCTION public.mi_chilevalora() TO service_role;