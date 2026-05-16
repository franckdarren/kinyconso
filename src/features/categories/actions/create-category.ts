'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { categories } from '@/db/schema'
import { requireAdmin } from '@/features/auth/queries/get-current-user'
import type { ActionResult } from '@/types/actions'

import {
  createCategorySchema,
  normalizeCategoryInput,
  type CreateCategoryInput,
} from '../schemas/category.schema'

export async function createCategory(
  input: CreateCategoryInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await requireAdmin()
  } catch {
    return { success: false, error: 'Réservé aux administrateurs' }
  }

  const parsed = createCategorySchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Champs invalides',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const data = normalizeCategoryInput(parsed.data)

  const [existingName] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.name, data.name))
    .limit(1)
  if (existingName) {
    return { success: false, error: 'Une catégorie avec ce nom existe déjà' }
  }

  const [existingSlug] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, data.slug))
    .limit(1)
  if (existingSlug) {
    return { success: false, error: 'Une catégorie avec ce slug existe déjà' }
  }

  const [created] = await db.insert(categories).values(data).returning({
    id: categories.id,
    slug: categories.slug,
  })

  if (!created) {
    return { success: false, error: 'Création échouée' }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/categories')
  revalidatePath('/')
  return { success: true, data: created }
}
