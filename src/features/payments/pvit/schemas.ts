import { z } from 'zod'

import { paymentOperatorEnum } from '@/db/schema/enums'

export const initiatePaymentSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.uuid('Identifiant produit invalide'),
        quantity: z.number().int().min(1, 'Quantité invalide'),
      }),
    )
    .min(1, 'Le panier est vide'),
  deliveryOptionId: z.uuid('Option de livraison invalide'),
  operator: z.enum(paymentOperatorEnum.enumValues),
  customerPhone: z
    .string()
    .min(8, 'Numéro de téléphone invalide')
    .max(20)
    .regex(/^[+\d\s]+$/, 'Le numéro ne doit contenir que des chiffres')
    .optional(),
  deliveryAddress: z.object({
    fullName: z.string().min(2, 'Nom complet requis').max(120),
    phone: z.string().min(8, 'Téléphone requis').max(20),
    address: z.string().min(5, 'Adresse requise').max(500),
    city: z.string().min(2, 'Ville requise').max(120),
  }),
  notes: z.string().max(1000).optional(),
})

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>

export const checkStatusQuerySchema = z.object({
  reference: z.uuid('Référence invalide'),
})

export const kycRequestSchema = z.object({
  phone: z
    .string()
    .min(8, 'Numéro de téléphone invalide')
    .max(20)
    .regex(/^[+\d\s]+$/, 'Le numéro ne doit contenir que des chiffres'),
  operator: z.enum(paymentOperatorEnum.enumValues),
})

export type KycRequestInput = z.infer<typeof kycRequestSchema>

/**
 * Payload reçu de PVIT sur le webhook /callback.
 * On reste tolérant : la doc PVIT évolue, donc on garde un champ libre.
 */
export const pvitCallbackPayloadSchema = z
  .object({
    transactionId: z.string().min(1),
    merchantReferenceId: z.string().min(1),
    status: z.enum(['SUCCESS', 'FAILED', 'CANCELLED', 'PENDING']),
    responseCode: z.string().min(1),
    amount: z.number().int().nonnegative().optional(),
    operator: z.enum(paymentOperatorEnum.enumValues).optional(),
    message: z.string().optional(),
    signature: z.string().optional(),
  })
  .passthrough()

export type PvitCallbackPayloadInput = z.infer<typeof pvitCallbackPayloadSchema>
