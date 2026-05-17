'use server'

import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { cart, type CartItem as DbCartItem } from '@/db/schema'
import { getCurrentUser } from '@/features/auth/queries/get-current-user'
import type { ActionResult } from '@/types/actions'

import type { CartLine } from '@/stores/cart.store'

export interface SyncCartPayload {
  items: Pick<CartLine, 'productId' | 'quantity' | 'unitPrice'>[]
}

/**
 * Persiste le panier côté serveur pour l'utilisateur connecté.
 * Sans effet si l'utilisateur n'est pas connecté.
 */
export async function syncCart(payload: SyncCartPayload): Promise<ActionResult<void>> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: true, data: undefined }
  }

  const items: DbCartItem[] = payload.items.map((i) => ({
    productId: i.productId,
    quantity: i.quantity,
    priceSnapshot: i.unitPrice,
  }))

  await db
    .insert(cart)
    .values({ userId: user.id, items })
    .onConflictDoUpdate({
      target: cart.userId,
      set: { items, updatedAt: new Date() },
    })

  return { success: true, data: undefined }
}

/**
 * Charge le panier server-side pour fusion avec le panier local.
 */
export async function loadServerCart(): Promise<ActionResult<{ items: DbCartItem[] }>> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: true, data: { items: [] } }
  }

  const [row] = await db.select().from(cart).where(eq(cart.userId, user.id)).limit(1)

  return { success: true, data: { items: row?.items ?? [] } }
}
