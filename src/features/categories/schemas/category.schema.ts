import { z } from 'zod'

import { slugify } from '@/lib/utils/slugify'

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const slugSchema = z
  .string()
  .min(2, 'Le slug doit faire au moins 2 caractères')
  .max(120, 'Le slug est trop long')
  .regex(slugRegex, 'Le slug ne peut contenir que des minuscules, chiffres et tirets')

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Le nom doit faire au moins 2 caractères').max(120),
  slug: slugSchema.optional().or(z.literal('')),
  description: z.string().max(2000).optional().or(z.literal('')),
  imageUrl: z.url('URL invalide').optional().or(z.literal('')),
  parentId: z.uuid().optional().nullable(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
})

export const updateCategorySchema = createCategorySchema.extend({
  id: z.uuid('Identifiant invalide'),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>

/** Normalise les valeurs optionnelles avant insertion DB. */
export function normalizeCategoryInput<T extends CreateCategoryInput>(input: T) {
  return {
    name: input.name.trim(),
    slug: (input.slug && input.slug.length > 0 ? input.slug : slugify(input.name)).trim(),
    description: input.description?.trim() || null,
    imageUrl: input.imageUrl?.trim() || null,
    parentId: input.parentId ?? null,
    isActive: input.isActive ?? true,
    sortOrder: input.sortOrder ?? 0,
  }
}
