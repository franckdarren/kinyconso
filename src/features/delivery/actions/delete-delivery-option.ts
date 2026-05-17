'use server'

import { revalidatePath } from 'next/cache'
import { count, eq } from 'drizzle-orm'

import { db } from '@/db'
import { deliveryOptions, orders } from '@/db/schema'
import { requireAdmin } from '@/features/auth/queries/get-current-user'
import type { ActionResult } from '@/types/actions'

export async function deleteDeliveryOption(id: string): Promise<ActionResult<void>> {
  try {
    await requireAdmin()
  } catch {
    return { success: false, error: 'Réservé aux administrateurs' }
  }

  const [{ value: orderCount } = { value: 0 }] = await db
    .select({ value: count() })
    .from(orders)
    .where(eq(orders.deliveryOptionId, id))

  if (orderCount > 0) {
    return {
      success: false,
      error: `Suppression impossible : ${orderCount} commande(s) liée(s). Désactivez plutôt l'option.`,
    }
  }

  const result = await db
    .delete(deliveryOptions)
    .where(eq(deliveryOptions.id, id))
    .returning({ id: deliveryOptions.id })

  if (result.length === 0) {
    return { success: false, error: 'Option de livraison introuvable' }
  }

  revalidatePath('/admin/livraisons')
  revalidatePath('/checkout')
  return { success: true, data: undefined }
}

export async function toggleDeliveryOptionActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult<void>> {
  try {
    await requireAdmin()
  } catch {
    return { success: false, error: 'Réservé aux administrateurs' }
  }

  const [updated] = await db
    .update(deliveryOptions)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(deliveryOptions.id, id))
    .returning({ id: deliveryOptions.id })

  if (!updated) {
    return { success: false, error: 'Option de livraison introuvable' }
  }

  revalidatePath('/admin/livraisons')
  revalidatePath('/checkout')
  return { success: true, data: undefined }
}
