'use server'

import { revalidatePath } from 'next/cache'
import { and, eq, ne } from 'drizzle-orm'

import { db } from '@/db'
import { categories } from '@/db/schema'
import { requireAdmin } from '@/features/auth/queries/get-current-user'
import type { ActionResult } from '@/types/actions'

import {
  normalizeCategoryInput,
  updateCategorySchema,
  type UpdateCategoryInput,
} from '../schemas/category.schema'

export async function updateCategory(
  input: UpdateCategoryInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await requireAdmin()
  } catch {
    return { success: false, error: 'Réservé aux administrateurs' }
  }

  const parsed = updateCategorySchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Champs invalides',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const { id } = parsed.data
  const data = normalizeCategoryInput(parsed.data)

  if (id === data.parentId) {
    return { success: false, error: 'Une catégorie ne peut pas être son propre parent' }
  }

  const [existingName] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.name, data.name), ne(categories.id, id)))
    .limit(1)
  if (existingName) {
    return { success: false, error: 'Une autre catégorie utilise déjà ce nom' }
  }

  const [existingSlug] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.slug, data.slug), ne(categories.id, id)))
    .limit(1)
  if (existingSlug) {
    return { success: false, error: 'Une autre catégorie utilise déjà ce slug' }
  }

  const [updated] = await db
    .update(categories)
    .set(data)
    .where(eq(categories.id, id))
    .returning({ id: categories.id, slug: categories.slug })

  if (!updated) {
    return { success: false, error: 'Catégorie introuvable' }
  }

  revalidatePath('/admin/categories')
  revalidatePath(`/admin/categories/${id}/modifier`)
  revalidatePath('/categories')
  revalidatePath(`/categories/${updated.slug}`)
  return { success: true, data: updated }
}
