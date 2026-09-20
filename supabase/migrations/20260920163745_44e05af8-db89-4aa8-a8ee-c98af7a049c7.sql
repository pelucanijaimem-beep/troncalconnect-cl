
-- 1. Normalización de RUT -------------------------------------------------
create or replace function public.normalizar_rut(p_rut text)
returns text
language sql
immutable
set search_path = public
as $$
  select nullif(lower(regexp_replace(coalesce(p_rut, ''), '[^0-9kK]', '', 'g')), '')
$$;

alter table public.perfiles
  add column if not exists rut_normalizado text
  generated always as (public.normalizar_rut(rut)) stored;

create index if not exists perfiles_rut_normalizado_idx
  on public.perfiles (rut_normalizado);

-- Bloquea RUT duplicado en cuentas nuevas (los duplicados históricos se conservan).
create or replace function public.perfiles_rut_unico()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.rut_normalizado is not null and exists (
    select 1 from public.perfiles p
    where p.rut_normalizado = new.rut_normalizado
      and p.id <> new.id
  ) then
    raise exception 'RUT_DUPLICADO';
  end if;
  return new;
end;
$$;

drop trigger if exists perfiles_rut_unico_trg on public.perfiles;
create trigger perfiles_rut_unico_trg
  before insert or update of rut on public.perfiles
  for each row execute function public.perfiles_rut_unico();

-- Consulta pública mínima: solo indica si un RUT ya tiene cuenta.
create or replace function public.rut_registrado(p_rut text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.perfiles
    where rut_normalizado = public.normalizar_rut(p_rut)
  )
$$;

revoke all on function public.rut_registrado(text) from public;
grant execute on function public.rut_registrado(text) to anon, authenticated;

-- 2. Intentos de inicio de sesión ----------------------------------------
create table if not exists public.intentos_login (
  id uuid primary key default gen_random_uuid(),
  clave text not null unique,
  intentos integer not null default 0,
  bloqueado_hasta timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on public.intentos_login to service_role;
alter table public.intentos_login enable row level security;
create policy "intentos_login_admin" on public.intentos_login
  for select to authenticated
  using (public.tiene_rol(auth.uid(), 'admin'::app_role));

drop trigger if exists intentos_login_updated_at on public.intentos_login;
create trigger intentos_login_updated_at
  before update on public.intentos_login
  for each row execute function public.set_updated_at();

-- 3. Alertas internas (equipo TroncalTrack) -------------------------------
create table if not exists public.alertas_internas (
  id uuid primary key default gen_random_uuid(),
  tipo text not null,
  user_id uuid references auth.users(id) on delete cascade,
  detalle text not null,
  datos jsonb not null default '{}'::jsonb,
  estado text not null default 'pendiente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, update on public.alertas_internas to authenticated;
grant all on public.alertas_internas to service_role;
alter table public.alertas_internas enable row level security;

create policy "alertas_internas_admin_select" on public.alertas_internas
  for select to authenticated
  using (public.tiene_rol(auth.uid(), 'admin'::app_role));
create policy "alertas_internas_admin_update" on public.alertas_internas
  for update to authenticated
  using (public.tiene_rol(auth.uid(), 'admin'::app_role))
  with check (public.tiene_rol(auth.uid(), 'admin'::app_role));

drop trigger if exists alertas_internas_updated_at on public.alertas_internas;
create trigger alertas_internas_updated_at
  before update on public.alertas_internas
  for each row execute function public.set_updated_at();

-- Patente repetida entre cuentas distintas: alerta interna, sin bloquear al usuario.
create or replace function public.detectar_patente_duplicada()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_patente text := upper(regexp_replace(coalesce(new.patente, ''), '[^0-9A-Za-z]', '', 'g'));
  v_otro uuid;
begin
  if v_patente = '' then
    return new;
  end if;

  select v.user_id into v_otro
  from public.vencimientos_documentales v
  where v.user_id <> new.user_id
    and upper(regexp_replace(coalesce(v.patente, ''), '[^0-9A-Za-z]', '', 'g')) = v_patente
  limit 1;

  if v_otro is not null and not exists (
    select 1 from public.alertas_internas a
    where a.tipo = 'patente_duplicada'
      and a.user_id = new.user_id
      and a.datos->>'patente' = v_patente
      and a.estado = 'pendiente'
  ) then
    insert into public.alertas_internas (tipo, user_id, detalle, datos)
    values (
      'patente_duplicada',
      new.user_id,
      'La patente ' || v_patente || ' está registrada en más de una cuenta de transportista. Revisar antes de aprobar cualquier verificación.',
      jsonb_build_object('patente', v_patente, 'otro_user_id', v_otro)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists detectar_patente_duplicada_trg on public.vencimientos_documentales;
create trigger detectar_patente_duplicada_trg
  after insert or update of patente on public.vencimientos_documentales
  for each row execute function public.detectar_patente_duplicada();
