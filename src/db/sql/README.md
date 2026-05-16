# SQL — Triggers et fonctions Postgres

Ce dossier contient les scripts SQL à exécuter **après** les migrations Drizzle.

## Ordre d'exécution

| Ordre | Fichier           | Phase | Description                                                                              |
| ----- | ----------------- | ----- | ---------------------------------------------------------------------------------------- |
| 1     | `01_triggers.sql` | 2     | `set_updated_at()`, sync `auth.users → public.users`, `set_order_number()`, `is_admin()` |
| 2     | `02_rls.sql`      | 3     | Activation RLS + politiques par table + anti-escalade de rôle                            |

## Vue d'ensemble des politiques RLS

| Table              | `anon`         | `authenticated` (client)      | `authenticated` (admin) | `service_role` |
| ------------------ | -------------- | ----------------------------- | ----------------------- | -------------- |
| `users`            | ❌             | SELECT/UPDATE son profil      | ALL                     | ALL (bypass)   |
| `categories`       | SELECT actives | SELECT actives                | ALL                     | ALL (bypass)   |
| `products`         | SELECT actifs  | SELECT actifs                 | ALL                     | ALL (bypass)   |
| `delivery_options` | SELECT actives | SELECT actives                | ALL                     | ALL (bypass)   |
| `orders`           | ❌             | SELECT ses commandes          | ALL                     | ALL (bypass)   |
| `order_items`      | ❌             | SELECT items de ses commandes | ALL                     | ALL (bypass)   |
| `payments`         | ❌             | ❌                            | ALL                     | ALL (bypass)   |
| `cart`             | ❌             | ALL sur son panier            | SELECT tout             | ALL (bypass)   |
| `notifications`    | ❌             | SELECT/UPDATE ses notifs      | ALL                     | ALL (bypass)   |
| `app_config`       | ❌             | ❌                            | ALL                     | ALL (bypass)   |

**`service_role`** : clé serveur (`SUPABASE_SERVICE_ROLE_KEY`) utilisée par les routes API (`/api/pvit/*`, server actions privilégiées). Elle bypass automatiquement la RLS.

## Comment exécuter

### Via Supabase Studio (SQL Editor)

1. Copier le contenu du fichier
2. Coller dans une requête vierge
3. Exécuter

### Via psql / Drizzle

```bash
psql "$DATABASE_URL" -f src/db/sql/01_triggers.sql
```

### Via le script npm dédié

```bash
npm run db:apply-sql
```

## Idempotence

Tous les scripts utilisent `create or replace` et `drop ... if exists` — ils sont **rejouables sans risque** sur une base existante.
