
alter table public.cargas
  add column if not exists visibilidad text not null default 'publica';

alter table public.cargas
  drop constraint if exists cargas_visibilidad_check;
alter table public.cargas
  add constraint cargas_visibilidad_check check (visibilidad in ('publica','privada'));

create table if not exists public.invitaciones_carga (
  id uuid primary key default gen_random_uuid(),
  carga_id uuid not null references public.cargas(id) on delete cascade,
  invitado_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  unique (carga_id, invitado_id)
);

grant select, insert, delete on public.invitaciones_carga to authenticated;
grant all on public.invitaciones_carga to service_role;

alter table public.invitaciones_carga enable row level security;

create or replace function public.carga_invitado(_carga_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.invitaciones_carga i
    where i.carga_id = _carga_id and i.invitado_id = _user_id
  )
$$;

revoke all on function public.carga_invitado(uuid, uuid) from public, anon;
grant execute on function public.carga_invitado(uuid, uuid) to authenticated, service_role;

create or replace function public.carga_es_mia(_carga_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.cargas c
    where c.id = _carga_id and c.user_id = _user_id
  )
$$;

revoke all on function public.carga_es_mia(uuid, uuid) from public, anon;
grant execute on function public.carga_es_mia(uuid, uuid) to authenticated, service_role;

drop policy if exists invitaciones_select on public.invitaciones_carga;
create policy invitaciones_select on public.invitaciones_carga
  for select to authenticated
  using (
    invitado_id = auth.uid()
    or public.carga_es_mia(carga_id, auth.uid())
    or public.tiene_rol(auth.uid(), 'admin')
  );

drop policy if exists invitaciones_insert_owner on public.invitaciones_carga;
create policy invitaciones_insert_owner on public.invitaciones_carga
  for insert to authenticated
  with check (public.carga_es_mia(carga_id, auth.uid()));

drop policy if exists invitaciones_delete_owner on public.invitaciones_carga;
create policy invitaciones_delete_owner on public.invitaciones_carga
  for delete to authenticated
  using (public.carga_es_mia(carga_id, auth.uid()));

drop policy if exists cargas_select on public.cargas;
create policy cargas_select on public.cargas
  for select to authenticated
  using (
    visibilidad = 'publica'
    or user_id = auth.uid()
    or public.carga_invitado(id, auth.uid())
    or public.tiene_rol(auth.uid(), 'admin')
  );
