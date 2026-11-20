CREATE TABLE public.prerevision_documentos (
  user_id uuid NOT NULL,
  clave text NOT NULL CHECK (clave IN ('licencia', 'soat', 'revision_tecnica', 'permiso_circulacion')),
  ruta text NOT NULL,
  veredicto text NOT NULL CHECK (veredicto IN ('correcto', 'revisar')),
  motivo text NOT NULL DEFAULT '' CHECK (char_length(motivo) <= 300),
  revisado_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, clave)
);

COMMENT ON TABLE public.prerevision_documentos IS 'Advisory AI pre-review of uploaded TroncalCheck documents. Visible only to administrators; never approves or rejects.';

GRANT SELECT ON public.prerevision_documentos TO authenticated;
GRANT ALL ON public.prerevision_documentos TO service_role;

ALTER TABLE public.prerevision_documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Solo administradores leen la pre-revisión"
ON public.prerevision_documentos
FOR SELECT
TO authenticated
USING (public.tiene_rol(auth.uid(), 'admin'::public.app_role));