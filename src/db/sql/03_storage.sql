-- =============================================================================
-- KinyConso — Buckets Supabase Storage + politiques
-- À exécuter APRÈS `02_rls.sql` (dépend de la fonction `is_admin()`).
-- Idempotent.
-- =============================================================================
--
-- Buckets créés :
--   - `products`   : lecture publique, écriture admin uniquement
--   - `categories` : lecture publique, écriture admin uniquement
--   - `avatars`    : lecture publique, écriture par l'utilisateur (son dossier)
--
-- Limites :
--   - 5 Mo par fichier (renforcé aussi côté client)
--   - formats acceptés : jpg, jpeg, png, webp
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Création/MAJ des buckets
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('products',   'products',   true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('categories', 'categories', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('avatars',    'avatars',    true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- -----------------------------------------------------------------------------
-- 2. Politiques bucket `products`
-- -----------------------------------------------------------------------------
drop policy if exists "products_read_public" on storage.objects;
create policy "products_read_public" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'products');

drop policy if exists "products_write_admin" on storage.objects;
create policy "products_write_admin" on storage.objects
  for all to authenticated
  using (bucket_id = 'products' and public.is_admin())
  with check (bucket_id = 'products' and public.is_admin());

-- -----------------------------------------------------------------------------
-- 3. Politiques bucket `categories`
-- -----------------------------------------------------------------------------
drop policy if exists "categories_read_public" on storage.objects;
create policy "categories_read_public" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'categories');

drop policy if exists "categories_write_admin" on storage.objects;
create policy "categories_write_admin" on storage.objects
  for all to authenticated
  using (bucket_id = 'categories' and public.is_admin())
  with check (bucket_id = 'categories' and public.is_admin());

-- -----------------------------------------------------------------------------
-- 4. Politiques bucket `avatars`
--    Chaque user gère son propre dossier `avatars/{auth.uid()}/...`
--    Admin peut tout faire.
-- -----------------------------------------------------------------------------
drop policy if exists "avatars_read_public" on storage.objects;
create policy "avatars_read_public" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'avatars');

drop policy if exists "avatars_write_own" on storage.objects;
create policy "avatars_write_own" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_admin_all" on storage.objects;
create policy "avatars_admin_all" on storage.objects
  for all to authenticated
  using (bucket_id = 'avatars' and public.is_admin())
  with check (bucket_id = 'avatars' and public.is_admin());
