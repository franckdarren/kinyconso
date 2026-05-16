import { sql } from 'drizzle-orm'
import { jsonb, pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

import { users } from './users'

export type CartItem = {
  productId: string
  quantity: number
  priceSnapshot: number
}

export const cart = pgTable(
  'cart',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    items: jsonb('items')
      .$type<CartItem[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [uniqueIndex('cart_user_unique').on(table.userId)],
)

export type Cart = typeof cart.$inferSelect
export type NewCart = typeof cart.$inferInsert
