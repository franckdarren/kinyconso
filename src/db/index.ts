import 'server-only'

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

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
