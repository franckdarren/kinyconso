# SQL — Triggers et fonctions Postgres

Ce dossier contient les scripts SQL à exécuter **après** les migrations Drizzle.

## Ordre d'exécution

| Ordre | Fichier           | Phase | Description                                                                              |
| ----- | ----------------- | ----- | ---------------------------------------------------------------------------------------- |
| 1     | `01_triggers.sql` | 2     | `set_updated_at()`, sync `auth.users → public.users`, `set_order_number()`, `is_admin()` |
| 2     | `02_rls.sql`      | 3     | Politiques Row Level Security (à venir)                                                  |

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
