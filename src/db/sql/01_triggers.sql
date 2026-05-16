-- =============================================================================
-- KinyConso — Triggers et fonctions Postgres
-- À exécuter UNE FOIS après `npx drizzle-kit push` (ou via `db:apply-triggers`).
-- Idempotent : les CREATE OR REPLACE / DROP IF EXISTS rendent le script rejouable.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Fonction générique : met à jour updated_at sur chaque UPDATE
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Applique le trigger sur toutes les tables qui possèdent updated_at
do $$
declare
  t record;
begin
  for t in
    select c.table_schema, c.table_name
    from information_schema.columns c
    where c.table_schema = 'public'
      and c.column_name = 'updated_at'
  loop
    execute format(
      'drop trigger if exists set_updated_at on %I.%I;',
      t.table_schema, t.table_name
    );
    execute format(
      'create trigger set_updated_at
         before update on %I.%I
         for each row execute function public.set_updated_at();',
      t.table_schema, t.table_name
    );
  end loop;
end
$$;

-- -----------------------------------------------------------------------------
-- 2. Synchronisation auth.users → public.users
--    Chaque inscription dans Supabase Auth crée automatiquement une ligne
--    correspondante dans public.users (rôle "customer" par défaut).
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    coalesce(new.raw_user_meta_data ->> 'phone', new.phone)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- -----------------------------------------------------------------------------
-- 3. Génération automatique du order_number — format CMD-YYYY-NNNNN
--    Compte les commandes de l'année en cours pour produire un numéro séquentiel.
-- -----------------------------------------------------------------------------
create or replace function public.set_order_number()
returns trigger
language plpgsql
as $$
declare
  current_year text;
  next_seq integer;
begin
  if new.order_number is not null and new.order_number <> '' then
    return new;
  end if;

  current_year := to_char(now(), 'YYYY');

  select coalesce(max(
    nullif(regexp_replace(order_number, '^CMD-\d{4}-', ''), '')::integer
  ), 0) + 1
  into next_seq
  from public.orders
  where order_number like 'CMD-' || current_year || '-%';

  new.order_number := 'CMD-' || current_year || '-' || lpad(next_seq::text, 5, '0');
  return new;
end;
$$;

drop trigger if exists set_order_number on public.orders;
create trigger set_order_number
  before insert on public.orders
  for each row execute function public.set_order_number();

-- -----------------------------------------------------------------------------
-- 4. Helper d'autorisation : is_admin()
--    Utilisable dans les politiques RLS (Phase 3).
-- -----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;
