import { z } from 'zod'

import { slugify } from '@/lib/utils/slugify'

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const slugSchema = z
  .string()
  .min(2, 'Le slug doit faire au moins 2 caractères')
  .max(160, 'Le slug est trop long')
  .regex(slugRegex, 'Le slug ne peut contenir que des minuscules, chiffres et tirets')

const priceField = z
  .number()
  .int('Le prix doit être un entier')
  .positive('Le prix doit être positif')

export const createProductSchema = z
  .object({
    name: z.string().min(2).max(200),
    slug: slugSchema.optional().or(z.literal('')),
    description: z.string().max(5000).optional().or(z.literal('')),
    price: priceField,
    compareAtPrice: z.number().int().positive().optional().nullable(),
    stockQuantity: z.number().int().min(0).optional(),
    categoryId: z.uuid('Catégorie requise'),
    images: z.array(z.url()).max(8, 'Maximum 8 images').optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    weight: z.number().int().min(0).optional().nullable(),
  })
  .refine(
    (data) =>
      data.compareAtPrice === undefined ||
      data.compareAtPrice === null ||
      data.compareAtPrice > data.price,
    {
      message: 'Le prix barré doit être supérieur au prix actuel',
      path: ['compareAtPrice'],
    },
  )

export const updateProductSchema = z.object({
  id: z.uuid(),
  name: z.string().min(2).max(200),
  slug: slugSchema.optional().or(z.literal('')),
  description: z.string().max(5000).optional().or(z.literal('')),
  price: priceField,
  compareAtPrice: z.number().int().positive().optional().nullable(),
  stockQuantity: z.number().int().min(0).optional(),
  categoryId: z.uuid('Catégorie requise'),
  images: z.array(z.url()).max(8).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  weight: z.number().int().min(0).optional().nullable(),
})

export const productFiltersSchema = z.object({
  search: z.string().trim().max(100).optional(),
  categoryId: z.uuid().optional(),
  minPrice: z.number().int().min(0).optional(),
  maxPrice: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sort: z.enum(['recent', 'price_asc', 'price_desc', 'name_asc']).default('recent'),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(60).default(24),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ProductFilters = z.infer<typeof productFiltersSchema>

export function normalizeProductInput<T extends CreateProductInput>(input: T) {
  return {
    name: input.name.trim(),
    slug: (input.slug && input.slug.length > 0 ? input.slug : slugify(input.name)).trim(),
    description: input.description?.trim() || null,
    price: input.price,
    compareAtPrice: input.compareAtPrice ?? null,
    stockQuantity: input.stockQuantity ?? 0,
    categoryId: input.categoryId,
    images: input.images ?? [],
    isActive: input.isActive ?? true,
    isFeatured: input.isFeatured ?? false,
    weight: input.weight ?? null,
  }
}
