import { sql } from 'drizzle-orm'
import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { userRoleEnum } from './enums'

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey(),
    fullName: text('full_name'),
    phone: text('phone'),
    address: text('address'),
    city: text('city'),
    role: userRoleEnum('role').notNull().default('customer'),
    fcmToken: text('fcm_token'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [index('users_role_idx').on(table.role)],
)

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
