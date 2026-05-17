'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { deliveryOptions } from '@/db/schema'
import { requireAdmin } from '@/features/auth/queries/get-current-user'
import type { ActionResult } from '@/types/actions'

import {
  createDeliveryOptionSchema,
  normalizeDeliveryOptionInput,
  type CreateDeliveryOptionInput,
} from '../schemas/delivery.schema'

export async function createDeliveryOption(
  input: CreateDeliveryOptionInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin()
  } catch {
    return { success: false, error: 'Réservé aux administrateurs' }
  }

  const parsed = createDeliveryOptionSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Champs invalides',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const data = normalizeDeliveryOptionInput(parsed.data)

  const [existingName] = await db
    .select({ id: deliveryOptions.id })
    .from(deliveryOptions)
    .where(eq(deliveryOptions.name, data.name))
    .limit(1)
  if (existingName) {
    return { success: false, error: 'Une option de livraison avec ce nom existe déjà' }
  }

  const [created] = await db
    .insert(deliveryOptions)
    .values(data)
    .returning({ id: deliveryOptions.id })

  if (!created) {
    return { success: false, error: 'Création échouée' }
  }

  revalidatePath('/admin/livraisons')
  revalidatePath('/checkout')
  return { success: true, data: created }
}
