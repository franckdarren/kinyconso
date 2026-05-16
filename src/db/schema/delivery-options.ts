import { sql } from 'drizzle-orm'
import { boolean, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const deliveryOptions = pgTable(
  'delivery_options',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: text('name').notNull(),
    description: text('description'),
    price: integer('price').notNull(),
    estimatedDays: integer('estimated_days'),
    isActive: boolean('is_active').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [index('delivery_options_active_idx').on(table.isActive)],
)

export type DeliveryOption = typeof deliveryOptions.$inferSelect
export type NewDeliveryOption = typeof deliveryOptions.$inferInsert
