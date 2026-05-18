import 'server-only'

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

/**
 * ⚠️ SÉCURITÉ — Cette connexion Postgres directe (`DATABASE_URL`) s'exécute
 * avec un rôle propriétaire et **contourne entièrement la RLS Supabase**.
 *
 * La RLS n'est donc PAS le périmètre de sécurité du chemin Drizzle : elle ne
 * sert que de défense en profondeur pour les accès via le client Supabase.
 * Toute query/Server Action utilisant `db` DOIT porter sa propre vérification
 * d'autorisation (ownership `user.id`, `requireAdmin()`, etc.) — ne jamais
 * présumer qu'une politique RLS filtrera les lignes.
 */

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL est manquant. Renseigne-le dans .env.local.')
}

const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof postgres> | undefined
}

const client =
  globalForDb.client ??
  postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    prepare: false,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForDb.client = client
}

export const db = drizzle(client, { schema, logger: process.env.NODE_ENV === 'development' })

export { schema }
export type Database = typeof db
