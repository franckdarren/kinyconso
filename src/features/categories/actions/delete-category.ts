'use server'

import { revalidatePath } from 'next/cache'
import { count, eq } from 'drizzle-orm'

import { db } from '@/db'
import { categories, products } from '@/db/schema'
import { requireAdmin } from '@/features/auth/queries/get-current-user'
import type { ActionResult } from '@/types/actions'

export async function deleteCategory(id: string): Promise<ActionResult<void>> {
  try {
    await requireAdmin()
  } catch {
    return { success: false, error: 'Réservé aux administrateurs' }
  }

  const [{ value: productCount } = { value: 0 }] = await db
    .select({ value: count() })
    .from(products)
    .where(eq(products.categoryId, id))

  if (productCount > 0) {
    return {
      success: false,
      error: `Suppression impossible : ${productCount} produit(s) lié(s). Désactivez la catégorie ou réaffectez les produits.`,
    }
  }

  const [{ value: childCount } = { value: 0 }] = await db
    .select({ value: count() })
    .from(categories)
    .where(eq(categories.parentId, id))

  if (childCount > 0) {
    return {
      success: false,
      error: `Suppression impossible : ${childCount} sous-catégorie(s) liée(s).`,
    }
  }

  const result = await db.delete(categories).where(eq(categories.id, id)).returning({
    id: categories.id,
  })

  if (result.length === 0) {
    return { success: false, error: 'Catégorie introuvable' }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/categories')
  return { success: true, data: undefined }
}

export async function toggleCategoryActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult<void>> {
  try {
    await requireAdmin()
  } catch {
    return { success: false, error: 'Réservé aux administrateurs' }
  }

  const [updated] = await db
    .update(categories)
    .set({ isActive })
    .where(eq(categories.id, id))
    .returning({ id: categories.id })

  if (!updated) {
    return { success: false, error: 'Catégorie introuvable' }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/categories')
  return { success: true, data: undefined }
}
