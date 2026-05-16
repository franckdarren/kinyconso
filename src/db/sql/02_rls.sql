-- =============================================================================
-- KinyConso — Row Level Security (RLS)
-- À exécuter APRÈS `01_triggers.sql` (dépend de la fonction `is_admin()`).
-- Idempotent : `drop policy if exists` + `create policy`.
-- =============================================================================
--
-- Rappels :
--   - Le rôle `service_role` BYPASS automatiquement la RLS (utilisé côté serveur
--     via `SUPABASE_SERVICE_ROLE_KEY`).
--   - Les rôles `anon` (non connecté) et `authenticated` (connecté) sont soumis
--     aux politiques ci-dessous.
--   - `auth.uid()` renvoie l'UUID du user courant (ou NULL si anon).
--   - `public.is_admin()` renvoie true si `users.role = 'admin'`.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. Activation RLS sur toutes les tables applicatives
-- -----------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.delivery_options enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.cart enable row level security;
alter table public.notifications enable row level security;
alter table public.app_config enable row level security;

-- -----------------------------------------------------------------------------
-- 0bis. Anti-escalade de rôle
-- Empêche un utilisateur non-admin de se promouvoir lui-même via UPDATE.
-- WITH CHECK ne donne pas accès à OLD, donc on passe par un trigger.
-- -----------------------------------------------------------------------------
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Modification du rôle interdite' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_role_escalation on public.users;
create trigger prevent_role_escalation
  before update on public.users
  for each row execute function public.prevent_role_escalation();

-- =============================================================================
-- USERS
-- =============================================================================
-- L'insertion dans public.users est faite par `handle_new_auth_user` (security
-- definer) → pas besoin de policy INSERT côté client.

drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users
  for select to authenticated
  using (id = auth.uid());

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "users_admin_all" on public.users;
create policy "users_admin_all" on public.users
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================================
-- CATEGORIES — lecture publique des actives, écriture admin
-- =============================================================================
drop policy if exists "categories_select_public" on public.categories;
create policy "categories_select_public" on public.categories
  for select to anon, authenticated
  using (is_active = true);

drop policy if exists "categories_admin_all" on public.categories;
create policy "categories_admin_all" on public.categories
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================================
-- PRODUCTS — lecture publique (actifs et non supprimés), écriture admin
-- =============================================================================
drop policy if exists "products_select_public" on public.products;
create policy "products_select_public" on public.products
  for select to anon, authenticated
  using (is_active = true and deleted_at is null);

drop policy if exists "products_admin_all" on public.products;
create policy "products_admin_all" on public.products
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================================
-- DELIVERY_OPTIONS — lecture publique des actives, écriture admin
-- =============================================================================
drop policy if exists "delivery_options_select_public" on public.delivery_options;
create policy "delivery_options_select_public" on public.delivery_options
  for select to anon, authenticated
  using (is_active = true);

drop policy if exists "delivery_options_admin_all" on public.delivery_options;
create policy "delivery_options_admin_all" on public.delivery_options
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================================
-- ORDERS — chaque client voit ses commandes, admin voit tout
-- =============================================================================
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select to authenticated
  using (user_id = auth.uid() and deleted_at is null);

drop policy if exists "orders_admin_all" on public.orders;
create policy "orders_admin_all" on public.orders
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================================
-- ORDER_ITEMS — visibles si la commande parente est visible
-- L'écriture passe toujours par le service_role (création de commande).
-- =============================================================================
drop policy if exists "order_items_select_own" on public.order_items;
create policy "order_items_select_own" on public.order_items
  for select to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
        and o.deleted_at is null
    )
  );

drop policy if exists "order_items_admin_all" on public.order_items;
create policy "order_items_admin_all" on public.order_items
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================================
-- PAYMENTS — admin uniquement, AUCUNE lecture client direct
-- Les paiements transitent par /api/pvit/* (service_role qui bypass la RLS).
-- =============================================================================
drop policy if exists "payments_admin_all" on public.payments;
create policy "payments_admin_all" on public.payments
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================================
-- CART — chaque utilisateur gère exclusivement son propre panier
-- =============================================================================
drop policy if exists "cart_all_own" on public.cart;
create policy "cart_all_own" on public.cart
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "cart_admin_select" on public.cart;
create policy "cart_admin_select" on public.cart
  for select to authenticated
  using (public.is_admin());

-- =============================================================================
-- NOTIFICATIONS — chaque utilisateur lit/marque les siennes ; admin a tout accès
-- L'insertion côté client est interdite : les notifications sont créées par le
-- backend (service_role) via `sendNotification()`.
-- =============================================================================
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "notifications_admin_all" on public.notifications;
create policy "notifications_admin_all" on public.notifications
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================================
-- APP_CONFIG — admin uniquement (X-Secret PVIT et autres secrets internes)
-- Le token-manager côté serveur lit/écrit via service_role.
-- =============================================================================
drop policy if exists "app_config_admin_all" on public.app_config;
create policy "app_config_admin_all" on public.app_config
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================================
-- Vérification : afficher l'état RLS de toutes les tables applicatives
-- =============================================================================
-- À exécuter manuellement pour vérifier :
--   select tablename, rowsecurity
--   from pg_tables
--   where schemaname = 'public'
--   order by tablename;
