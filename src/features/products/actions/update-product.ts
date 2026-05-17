'use server'

import { revalidatePath } from 'next/cache'
import { and, eq, ne } from 'drizzle-orm'

import { db } from '@/db'
import { products } from '@/db/schema'
import { requireAdmin } from '@/features/auth/queries/get-current-user'
import type { ActionResult } from '@/types/actions'

import {
  normalizeProductInput,
  updateProductSchema,
  type UpdateProductInput,
} from '../schemas/product.schema'

export async function updateProduct(
  input: UpdateProductInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await requireAdmin()
  } catch {
    return { success: false, error: 'Réservé aux administrateurs' }
  }

  const parsed = updateProductSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Champs invalides',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const { id } = parsed.data
  const data = normalizeProductInput(parsed.data)

  const [existing] = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.slug, data.slug), ne(products.id, id)))
    .limit(1)
  if (existing) {
    return { success: false, error: 'Un autre produit utilise déjà ce slug' }
  }

  const [updated] = await db
    .update(products)
    .set(data)
    .where(eq(products.id, id))
    .returning({ id: products.id, slug: products.slug })

  if (!updated) {
    return { success: false, error: 'Produit introuvable' }
  }

  revalidatePath('/admin/produits')
  revalidatePath(`/admin/produits/${id}/modifier`)
  revalidatePath('/produits')
  revalidatePath(`/produits/${updated.slug}`)
  revalidatePath('/')
  return { success: true, data: updated }
}
