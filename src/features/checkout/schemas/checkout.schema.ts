import { z } from 'zod'

import { paymentOperatorEnum } from '@/db/schema/enums'

const phoneRegex = /^[+\d\s]+$/

export const addressStepSchema = z.object({
  fullName: z.string().min(2, 'Nom complet requis').max(120),
  phone: z
    .string()
    .min(8, 'Téléphone requis (8 chiffres min)')
    .max(20)
    .regex(phoneRegex, 'Le numéro ne doit contenir que des chiffres'),
  address: z.string().min(5, 'Adresse requise').max(500),
  city: z.string().min(2, 'Ville requise').max(120),
  notes: z.string().max(1000).optional().or(z.literal('')),
})

export const deliveryStepSchema = z.object({
  deliveryOptionId: z.uuid('Option de livraison invalide'),
})

export const paymentStepSchema = z.object({
  operator: z.enum(paymentOperatorEnum.enumValues),
  customerPhone: z
    .string()
    .min(8, 'Numéro Mobile Money requis (8 chiffres min)')
    .max(20)
    .regex(phoneRegex, 'Le numéro ne doit contenir que des chiffres'),
})

export type AddressStepInput = z.infer<typeof addressStepSchema>
export type DeliveryStepInput = z.infer<typeof deliveryStepSchema>
export type PaymentStepInput = z.infer<typeof paymentStepSchema>
