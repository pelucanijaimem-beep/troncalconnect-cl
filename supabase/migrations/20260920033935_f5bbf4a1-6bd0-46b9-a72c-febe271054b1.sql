create table if not exists public.vencimientos_documentales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  patente text not null default '',
  revision_tecnica date,
  permiso_circulacion date,
  soap date,
  carga_peligrosa date,
  avisos jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

grant select, insert, update, delete on public.vencimientos_documentales to authenticated;
grant all on public.vencimientos_documentales to service_role;
alter table public.vencimientos_documentales enable row level security;

create policy "vencimientos_propios" on public.vencimientos_documentales
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "vencimientos_admin" on public.vencimientos_documentales
  for select to authenticated
  using (public.tiene_rol(auth.uid(), 'admin'::app_role));

create trigger vencimientos_set_updated_at
  before update on public.vencimientos_documentales
  for each row execute function public.set_updated_at();

create table if not exists public.viajes_ubicacion (
  id uuid primary key default gen_random_uuid(),
  carga_id uuid not null references public.cargas(id) on delete cascade,
  transportista_id uuid not null references auth.users(id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  velocidad integer not null default 0,
  precision_m integer,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (carga_id, transportista_id)
);

grant select, insert, update, delete on public.viajes_ubicacion to authenticated;
grant all on public.viajes_ubicacion to service_role;
alter table public.viajes_ubicacion enable row level security;

create policy "ubicacion_escribe_transportista" on public.viajes_ubicacion
  for all to authenticated
  using (transportista_id = auth.uid())
  with check (transportista_id = auth.uid());

create policy "ubicacion_lee_dueno_carga" on public.viajes_ubicacion
  for select to authenticated
  using (
    transportista_id = auth.uid()
    or exists (select 1 from public.cargas c where c.id = carga_id and c.user_id = auth.uid())
    or public.tiene_rol(auth.uid(), 'admin'::app_role)
  );

create trigger viajes_ubicacion_set_updated_at
  before update on public.viajes_ubicacion
  for each row execute function public.set_updated_at();

alter table public.viajes_ubicacion replica identity full;
