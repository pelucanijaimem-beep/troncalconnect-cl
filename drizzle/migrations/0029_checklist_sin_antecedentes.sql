ALTER TABLE public.verificaciones ALTER COLUMN checklist SET DEFAULT '{
  "soat": {"estado": "pendiente", "motivo": ""},
  "revision_tecnica": {"estado": "pendiente", "motivo": ""},
  "permiso_circulacion": {"estado": "pendiente", "motivo": ""},
  "licencia": {"estado": "pendiente", "motivo": ""}
}'::jsonb;