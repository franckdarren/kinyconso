'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { products } from '@/db/schema'
import { requireAdmin } from '@/features/auth/queries/get-current-user'
import type { ActionResult } from '@/types/actions'

import {
  createProductSchema,
  normalizeProductInput,
  type CreateProductInput,
} from '../schemas/product.schema'

export async function createProduct(
  input: CreateProductInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await requireAdmin()
  } catch {
    return { success: false, error: 'Réservé aux administrateurs' }
  }

  const parsed = createProductSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Champs invalides',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const data = normalizeProductInput(parsed.data)

  const [existing] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.slug, data.slug))
    .limit(1)
  if (existing) {
    return { success: false, error: 'Un produit avec ce slug existe déjà' }
  }

  const [created] = await db
    .insert(products)
    .values(data)
    .returning({ id: products.id, slug: products.slug })

  if (!created) {
    return { success: false, error: 'Création échouée' }
  }

  revalidatePath('/admin/produits')
  revalidatePath('/produits')
  revalidatePath('/')
  return { success: true, data: created }
}
