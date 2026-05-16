# Tester les politiques RLS

Une fois `01_triggers.sql` et `02_rls.sql` appliqués, on doit valider que :

1. Un anonyme ne peut lire que `products`, `categories`, `delivery_options`
2. Un client connecté ne voit que ses propres données
3. Un admin peut tout faire
4. Le service_role (backend) bypass tout

## Méthode 1 — Via Supabase Studio (SQL Editor)

Dans le SQL Editor, on peut simuler un rôle Postgres et un utilisateur arbitraire :

```sql
-- Simulation d'un utilisateur anonyme
set role anon;

-- Doit fonctionner
select count(*) from public.products;
select count(*) from public.categories;

-- Doit renvoyer 0 (vide)
select count(*) from public.orders;
select count(*) from public.users;

-- Réinitialiser
reset role;
```

```sql
-- Simulation d'un utilisateur connecté avec un id donné
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';

-- Doit renvoyer uniquement les commandes de cet user
select * from public.orders;

-- Doit renvoyer 0
select * from public.payments;

reset role;
```

## Méthode 2 — Tester depuis l'app

### Comme anonyme (non connecté)

```ts
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(URL, ANON_KEY)

// ✅ doit fonctionner
const { data: products } = await supabase.from('products').select('*')

// ✅ doit renvoyer []
const { data: orders } = await supabase.from('orders').select('*')

// ❌ doit renvoyer une erreur RLS
const { data: payments, error } = await supabase.from('payments').select('*')
console.assert(error?.code === '42501' || data === null)
```

### Comme client authentifié

Après `supabase.auth.signInWithPassword(...)` :

```ts
// ✅ doit renvoyer uniquement ses commandes
const { data: myOrders } = await supabase.from('orders').select('*')

// ❌ tentative d'escalade de rôle — doit échouer
const { error } = await supabase.from('users').update({ role: 'admin' }).eq('id', user.id)
console.assert(error?.message.includes('rôle interdite'))
```

### Comme admin

1. En SQL : `update public.users set role = 'admin' where id = '<user-id>';`
2. Se reconnecter
3. Toutes les opérations doivent passer (CRUD sur produits, lecture de toutes les commandes, etc.)

## Méthode 3 — Tests automatisés (Phase 19)

À implémenter en Phase 19 avec Vitest + un client Supabase de test :

```ts
describe('RLS — products', () => {
  it('un anonyme ne voit que les produits actifs et non supprimés', async () => {
    const { data } = await anonClient.from('products').select('id, is_active, deleted_at')
    expect(data?.every((p) => p.is_active && !p.deleted_at)).toBe(true)
  })
})
```

## Checklist d'acceptation Phase 3

- [ ] `pg_tables.rowsecurity = true` sur les 10 tables applicatives
- [ ] Un anonyme peut lire `products`/`categories`/`delivery_options` mais rien d'autre
- [ ] Un client voit `orders.user_id = auth.uid()` et seulement celles-là
- [ ] Un client NE PEUT PAS lire `payments` (réservé admin/backend)
- [ ] Un client NE PEUT PAS se promouvoir admin via UPDATE users
- [ ] Un admin peut faire CRUD sur tout
- [ ] Les routes `/api/pvit/*` utilisant `SUPABASE_SERVICE_ROLE_KEY` ne sont pas bloquées par la RLS

## Snippets utiles

```sql
-- Lister l'état RLS de chaque table
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;

-- Lister toutes les politiques actives
select schemaname, tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- Supprimer toutes les policies (utile pour debug — à NE PAS faire en prod)
do $$
declare p record;
begin
  for p in select policyname, tablename from pg_policies where schemaname = 'public'
  loop
    execute format('drop policy if exists %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;
```
