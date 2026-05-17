'use server'

import { revalidatePath } from 'next/cache'
import { and, eq, ne } from 'drizzle-orm'

import { db } from '@/db'
import { deliveryOptions } from '@/db/schema'
import { requireAdmin } from '@/features/auth/queries/get-current-user'
import type { ActionResult } from '@/types/actions'

import {
  normalizeDeliveryOptionInput,
  updateDeliveryOptionSchema,
  type UpdateDeliveryOptionInput,
} from '../schemas/delivery.schema'

export async function updateDeliveryOption(
  input: UpdateDeliveryOptionInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin()
  } catch {
    return { success: false, error: 'Réservé aux administrateurs' }
  }

  const parsed = updateDeliveryOptionSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Champs invalides',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const { id } = parsed.data
  const data = normalizeDeliveryOptionInput(parsed.data)

  const [existingName] = await db
    .select({ id: deliveryOptions.id })
    .from(deliveryOptions)
    .where(and(eq(deliveryOptions.name, data.name), ne(deliveryOptions.id, id)))
    .limit(1)
  if (existingName) {
    return { success: false, error: 'Une autre option utilise déjà ce nom' }
  }

  const [updated] = await db
    .update(deliveryOptions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(deliveryOptions.id, id))
    .returning({ id: deliveryOptions.id })

  if (!updated) {
    return { success: false, error: 'Option de livraison introuvable' }
  }

  revalidatePath('/admin/livraisons')
  revalidatePath(`/admin/livraisons/${id}/modifier`)
  revalidatePath('/checkout')
  return { success: true, data: updated }
}
