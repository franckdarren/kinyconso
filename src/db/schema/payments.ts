import { sql } from 'drizzle-orm'
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

import { paymentOperatorEnum, paymentStatusEnum } from './enums'
import { orders } from './orders'

export const payments = pgTable(
  'payments',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    status: paymentStatusEnum('status').notNull().default('pending'),
    operator: paymentOperatorEnum('operator').notNull(),
    amount: integer('amount').notNull(),
    fees: integer('fees').notNull().default(0),
    totalAmount: integer('total_amount').notNull(),
    customerPhone: text('customer_phone'),
    pvitTransactionId: text('pvit_transaction_id'),
    merchantReferenceId: text('merchant_reference_id').notNull(),
    pvitCallbackReceivedAt: timestamp('pvit_callback_received_at', { withTimezone: true }),
    rawCallbackPayload: jsonb('raw_callback_payload'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    uniqueIndex('payments_order_unique').on(table.orderId),
    uniqueIndex('payments_merchant_reference_unique').on(table.merchantReferenceId),
    index('payments_status_idx').on(table.status),
    index('payments_pvit_tx_idx').on(table.pvitTransactionId),
  ],
)

export type Payment = typeof payments.$inferSelect
export type NewPayment = typeof payments.$inferInsert
