import 'server-only'

import { cache } from 'react'
import { asc, eq } from 'drizzle-orm'

import { db } from '@/db'
import { deliveryOptions } from '@/db/schema'

export const getDeliveryOptions = cache(async () => {
  return db
    .select()
    .from(deliveryOptions)
    .orderBy(asc(deliveryOptions.sortOrder), asc(deliveryOptions.name))
})

export const getActiveDeliveryOptions = cache(async () => {
  return db
    .select()
    .from(deliveryOptions)
    .where(eq(deliveryOptions.isActive, true))
    .orderBy(asc(deliveryOptions.sortOrder), asc(deliveryOptions.name))
})

export const getDeliveryOptionById = cache(async (id: string) => {
  const [row] = await db.select().from(deliveryOptions).where(eq(deliveryOptions.id, id)).limit(1)
  return row ?? null
})
