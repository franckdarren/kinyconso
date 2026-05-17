import { z } from 'zod'

export const createDeliveryOptionSchema = z.object({
  name: z.string().min(2, 'Le nom doit faire au moins 2 caractères').max(120),
  description: z.string().max(2000).optional().or(z.literal('')),
  price: z
    .number({ message: 'Le prix doit être un nombre entier en FCFA' })
    .int('Le prix doit être un entier')
    .min(0, 'Le prix ne peut pas être négatif'),
  estimatedDays: z
    .number()
    .int('Le délai doit être un entier (en jours)')
    .min(0, 'Le délai ne peut pas être négatif')
    .optional()
    .nullable(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
})

export const updateDeliveryOptionSchema = createDeliveryOptionSchema.extend({
  id: z.uuid('Identifiant invalide'),
})

export type CreateDeliveryOptionInput = z.infer<typeof createDeliveryOptionSchema>
export type UpdateDeliveryOptionInput = z.infer<typeof updateDeliveryOptionSchema>

/** Normalise les valeurs optionnelles avant insertion DB. */
export function normalizeDeliveryOptionInput<T extends CreateDeliveryOptionInput>(input: T) {
  return {
    name: input.name.trim(),
    description: input.description?.trim() || null,
    price: input.price,
    estimatedDays:
      input.estimatedDays === undefined || input.estimatedDays === null
        ? null
        : input.estimatedDays,
    isActive: input.isActive ?? true,
    sortOrder: input.sortOrder ?? 0,
  }
}
